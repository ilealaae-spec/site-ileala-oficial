// api/trpc.ts - Vercel Serverless Function with inline dependencies
import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { z } from 'zod';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import type { IncomingMessage } from 'http';

type PossibleRequest =
  | Request
  | (IncomingMessage & {
      body?: unknown;
      buffer?: () => Promise<Buffer>;
    })
  | {
      method?: string;
      url?: string;
      headers?: Record<string, string | string[] | undefined>;
      body?: unknown;
      buffer?: () => Promise<Buffer>;
    };

function isFetchRequest(value: PossibleRequest): value is Request {
  return (
    !!value &&
    typeof (value as Request).headers?.get === 'function' &&
    typeof (value as Request).arrayBuffer === 'function'
  );
}

function isNodeReadable(value: unknown): value is NodeJS.ReadableStream {
  return !!value && typeof (value as NodeJS.ReadableStream).pipe === 'function' && typeof (value as NodeJS.ReadableStream).on === 'function';
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else if (chunk instanceof Uint8Array) {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(Buffer.from(chunk as any));
    }
  }
  return Buffer.concat(chunks);
}

function createHeadersFromObject(
  incomingHeaders: Record<string, string | string[] | undefined> | undefined
): Headers {
  const headers = new Headers();
  if (!incomingHeaders) {
    return headers;
  }

  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) {
          headers.append(key, item);
        }
      }
    } else if (value !== undefined) {
      headers.set(key, String(value));
    }
  }

  return headers;
}

async function readBodyFromPossibleRequest(req: PossibleRequest): Promise<Buffer | null> {
  if (!req) {
    return null;
  }

  const possibleBody = (req as any).body;

  if (typeof possibleBody === 'string') {
    return Buffer.from(possibleBody);
  }

  if (possibleBody instanceof Uint8Array || Buffer.isBuffer(possibleBody)) {
    return Buffer.from(possibleBody);
  }

  if (typeof (req as any).buffer === 'function') {
    const buffered = await (req as any).buffer();
    return buffered ? Buffer.from(buffered) : null;
  }

  if (isNodeReadable(possibleBody)) {
    return streamToBuffer(possibleBody);
  }

  if (isNodeReadable(req as any)) {
    return streamToBuffer(req as any);
  }

  return null;
}

function buildAbsoluteUrl(rawRequest: PossibleRequest, headers: Headers): string {
  const rawUrl = typeof (rawRequest as any)?.url === 'string' ? (rawRequest as any).url : '';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }

  const forwardedProto = headers.get('x-forwarded-proto') || 'https';
  const forwardedHost = headers.get('x-forwarded-host') || headers.get('host') || process.env.VERCEL_URL || 'localhost';
  const normalizedHost = forwardedHost.startsWith('http') ? forwardedHost : `${forwardedProto}://${forwardedHost}`;
  const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl || ''}`;

  return `${normalizedHost}${path}`;
}

async function normalizeRequest(rawRequest: PossibleRequest): Promise<Request> {
  if (isFetchRequest(rawRequest)) {
    return rawRequest;
  }

  const headers = createHeadersFromObject((rawRequest as any)?.headers);
  const method = (rawRequest as any)?.method || 'GET';
  const url = buildAbsoluteUrl(rawRequest, headers);

  let body: Buffer | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const buffered = await readBodyFromPossibleRequest(rawRequest);
    if (buffered && buffered.length > 0) {
      body = buffered;
    }
  }

  return new Request(url, {
    method,
    headers,
    body,
  });
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
const sql = postgres(process.env.DATABASE_URL || '', {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
});

// ============================================================================
// TRPC SETUP
// ============================================================================
const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================
async function getUserByEmail(email: string) {
  const users = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return users[0] || null;
}

async function createUser(data: {
  email: string;
  name: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  poBox?: string;
  country?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const users = await sql`
    INSERT INTO users (
      email, name, password, phone, address, city, state, "poBox", country,
      role, "emailVerified", "loginMethod", "createdAt", "updatedAt", "lastSignedIn"
    )
    VALUES (
      ${data.email}, ${data.name}, ${hashedPassword},
      ${data.phone || ''}, ${data.address || ''}, ${data.city || ''},
      ${data.state || ''}, ${data.poBox || null}, ${data.country || ''},
      'user', 0, 'email', NOW(), NOW(), NOW()
    )
    RETURNING *
  `;
  
  return users[0];
}

async function generateEmailVerificationToken(userId: number): Promise<string> {
  const token = nanoid(32);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await sql`
    UPDATE users
    SET "emailVerificationToken" = ${token},
        "emailVerificationExpires" = ${expires}
    WHERE id = ${userId}
  `;
  
  return token;
}

async function verifyUserCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user || !user.password) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;
  
  return user;
}

// ============================================================================
// EMAIL SENDING (Simplified - using Resend)
// ============================================================================
async function sendVerificationEmail(email: string, token: string, name: string) {
  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ileala.ae'}/verify-email?token=${token}`;
    
    // If Resend is configured, send email
    if (process.env.RESEND_API_KEY ) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Ile Ala <noreply@ileala.ae>',
          to: email,
          subject: 'Verify your email address',
          html: `
            <h1>Welcome ${name}!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verifyUrl}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
          `,
        } ),
      });
      
      if (!response.ok) {
        console.error('[Email] Failed to send verification email:', await response.text());
      }
    } else {
      console.log('[Email] Verification URL (email not sent):', verifyUrl);
    }
  } catch (error) {
    console.error('[Email] Error sending verification email:', error);
  }
}

// ============================================================================
// COOKIE HELPERS
// ============================================================================
const COOKIE_NAME = 'session';

function createSessionCookie(user: any): string {
  return JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'user',
  });
}

function parseCookie(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
}

function createSetCookieHeader(name: string, value: string, options: {
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
} ): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.secure) parts.push('Secure');
  if (options.httpOnly ) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  
  return parts.join('; ');
}

// ============================================================================
// TRPC ROUTER
// ============================================================================
const appRouter = router({
  auth: router({
    register: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        poBox: z.string().optional(),
        country: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          console.log('[Register] Starting registration for:', input.email);
          
          const existingUser = await getUserByEmail(input.email);
          if (existingUser) {
            throw new Error('User with this email already exists');
          }
          
          console.log('[Register] Creating user...');
          const user = await createUser(input);
          console.log('[Register] User created:', user.id);
          
          const token = await generateEmailVerificationToken(user.id);
          await sendVerificationEmail(user.email, token, user.name || 'Customer');
          
          // Set session cookie
          const sessionValue = createSessionCookie(user);
          ctx.setCookie(COOKIE_NAME, sessionValue);
          
          console.log('[Register] Success!');
          return {
            success: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          };
        } catch (error) {
          console.error('[Register] ERROR:', error);
          throw error;
        }
      }),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await verifyUserCredentials(input.email, input.password);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        const sessionValue = createSessionCookie(user);
        ctx.setCookie(COOKIE_NAME, sessionValue);
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    
    me: publicProcedure.query(({ ctx }) => {
      return ctx.user || null;
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.clearCookie(COOKIE_NAME);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;

// ============================================================================
// VERCEL HANDLER
// ============================================================================
export default async function handler(rawRequest: PossibleRequest) {
  const request = await normalizeRequest(rawRequest);
  const cookies: Array<{ name: string; value: string; options: any }> = [];
  
  // Parse cookies from request
  const cookieHeader = request.headers.get('cookie');
  const parsedCookies = parseCookie(cookieHeader);
  
  // Parse user from session cookie
  let user = null;
  try {
    if (parsedCookies[COOKIE_NAME]) {
      user = JSON.parse(parsedCookies[COOKIE_NAME]);
    }
  } catch (e) {
    // Invalid session
  }
  
  // Create context
  const ctx = {
    user,
    setCookie(name: string, value: string) {
      cookies.push({
        name,
        value,
        options: {
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax',
          maxAge: 365 * 24 * 60 * 60, // 1 year
        },
      } );
    },
    clearCookie(name: string) {
      cookies.push({
        name,
        value: '',
        options: {
          path: '/',
          maxAge: -1,
        },
      });
    },
  };
  
  try {
    console.log('[Vercel tRPC] Handling request:', request.method, request.url);
    
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: () => ctx,
    });
    
    // Add cookies to response
    if (cookies.length > 0) {
      const newHeaders = new Headers(response.headers);
      
      for (const { name, value, options } of cookies) {
        const cookieString = createSetCookieHeader(name, value, options);
        newHeaders.append('Set-Cookie', cookieString);
      }
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
    
    console.log('[Vercel tRPC] Request handled successfully');
    return response;
    
  } catch (error) {
    console.error('[Vercel tRPC] Error:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
