// api/trpc.ts - Vercel Serverless Function with inline dependencies
import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { z } from 'zod';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

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
// Define context type
type Context = {
  user: any | null;
  setCookie: (name: string, value: string) => void;
  clearCookie: (name: string) => void;
};

const t = initTRPC.context<Context>().create();
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
// Helper function to create a safe Request from any input
function createSafeRequest(rawRequest: any): Request {
  // Extract URL and method safely without accessing headers
  const reqAny = rawRequest as any;
  const url = (reqAny?.url || reqAny?.href || (typeof reqAny === 'string' ? reqAny : 'https://ileala.ae')) as string;
  const method = (reqAny?.method || 'GET') as string;
  
  // Create headers object safely - NEVER call .get() or .forEach() on original headers
  const headers = new Headers();
  
  // Try to extract headers without calling any methods on the original headers object
  if (reqAny?.headers) {
    try {
      // Method 1: If it's a Headers object with forEach
      if (typeof (reqAny.headers as any).forEach === 'function') {
        (reqAny.headers as any).forEach((value: string, key: string) => {
          headers.set(key, value);
        });
      } 
      // Method 2: If it's a plain object, iterate safely
      else if (typeof reqAny.headers === 'object' && !Array.isArray(reqAny.headers)) {
        for (const key in reqAny.headers) {
          if (Object.prototype.hasOwnProperty.call(reqAny.headers, key)) {
            const value = reqAny.headers[key];
            if (typeof value === 'string') {
              headers.set(key, value);
            } else if (Array.isArray(value)) {
              value.forEach((v: any) => headers.append(key, String(v)));
            }
          }
        }
      }
    } catch (headerError) {
      console.warn('[Vercel tRPC] Could not extract headers:', headerError);
      // Continue with empty headers
    }
  }
  
  // Create a proper Request object
  return new Request(url, {
    method,
    headers,
    body: reqAny?.body,
    cache: reqAny?.cache,
    credentials: reqAny?.credentials,
    integrity: reqAny?.integrity,
    keepalive: reqAny?.keepalive,
    mode: reqAny?.mode,
    redirect: reqAny?.redirect,
    referrer: reqAny?.referrer,
    referrerPolicy: reqAny?.referrerPolicy,
    signal: reqAny?.signal,
  });
}

// Vercel handler - must export default
// CRITICAL: We must intercept the request IMMEDIATELY and convert it to a proper Request
// before ANY code (including Vercel's internal code) tries to access request.headers.get
export default async function handler(request: Request | any) {
  // NEVER try to access request.headers.get() directly - always create a safe Request first
  // Even if it looks like a Request, it may not have properly bound methods
  let safeRequest: Request;
  
  try {
    // ALWAYS create a new Request object - don't trust the incoming request
    // This ensures all methods (including headers.get) are properly bound
    safeRequest = createSafeRequest(request);
  } catch (conversionError) {
    console.error('[Vercel tRPC] Failed to create safe Request:', conversionError);
    return new Response(
      JSON.stringify({
        error: {
          message: 'Failed to process request',
          code: 'REQUEST_CONVERSION_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  // Now use the safe request
  try {
    return await handleRequest(safeRequest);
  } catch (error) {
    // Log the error with as much info as possible without accessing request properties
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack';
    
    console.error('[Vercel tRPC] Fatal error in handler:', errorMessage);
    console.error('[Vercel tRPC] Error stack:', errorStack);
    
    return new Response(
      JSON.stringify({
        error: {
          message: errorMessage.includes('headers.get') 
            ? 'Request headers are not accessible in the expected format'
            : errorMessage,
          code: 'FATAL_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleRequest(request: any) {
  const cookies: Array<{ name: string; value: string; options: any }> = [];
  
  // FIRST: Create a valid Request object BEFORE accessing any properties
  // This prevents "request.headers.get is not a function" errors
  // The request parameter may not be a proper Request object from Vercel
  let validRequest: Request;
  try {
    // Safely extract properties with fallbacks - use reqAny to avoid type errors
    const reqAny = request;
    const url = reqAny?.url || reqAny?.href || (typeof reqAny === 'string' ? reqAny : 'http://localhost');
    const method = reqAny?.method || 'GET';
    
    // Extract headers safely - handle all possible formats
    // NEVER call .get() or .forEach() directly - check if they exist first
    const headers = new Headers();
    if (reqAny?.headers) {
      try {
        // Check if it's a Headers object with forEach (safest check)
        if (reqAny.headers && typeof reqAny.headers.forEach === 'function') {
          // Headers object (Fetch API) - has forEach method
          reqAny.headers.forEach((value: string, key: string) => {
            headers.set(key, value);
          });
        } else if (reqAny.headers && typeof reqAny.headers === 'object' && !Array.isArray(reqAny.headers)) {
          // It's an object - try to iterate as plain object
          // This handles both plain objects and Headers-like objects
          try {
            Object.entries(reqAny.headers).forEach(([key, value]) => {
              if (typeof value === 'string') {
                headers.set(key, value);
              } else if (Array.isArray(value)) {
                value.forEach((v: any) => headers.append(key, String(v)));
              } else if (value != null) {
                headers.set(key, String(value));
              }
            });
          } catch (e) {
            console.warn('[Vercel tRPC] Could not extract headers from object:', e);
            // Continue with empty headers
          }
        }
      } catch (e) {
        console.warn('[Vercel tRPC] Error extracting headers:', e);
        // Continue with empty headers - request can still be processed
      }
    }
    
    // Create a new Request object with all properties
    validRequest = new Request(url, {
      method,
      headers,
      body: reqAny?.body,
      cache: reqAny?.cache,
      credentials: reqAny?.credentials,
      integrity: reqAny?.integrity,
      keepalive: reqAny?.keepalive,
      mode: reqAny?.mode,
      redirect: reqAny?.redirect,
      referrer: reqAny?.referrer,
      referrerPolicy: reqAny?.referrerPolicy,
      signal: reqAny?.signal,
    });
  } catch (e) {
    console.error('[Vercel tRPC] Failed to create valid Request:', e);
    return new Response(
      JSON.stringify({
        error: {
          message: 'Failed to process request',
          code: 'REQUEST_CONVERSION_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  // Now we can safely use validRequest
  // Parse cookies from request
  const cookieHeader = validRequest.headers.get('cookie');
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
  
  // Create context with explicit type
  const ctx: Context = {
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
    console.log('[Vercel tRPC] Handling request:', validRequest.method, validRequest.url);
    console.log('[Vercel tRPC] ValidRequest is Request instance:', validRequest instanceof Request);
    console.log('[Vercel tRPC] ValidRequest headers type:', typeof validRequest.headers);
    console.log('[Vercel tRPC] ValidRequest headers.get type:', typeof validRequest.headers.get);
    
    // Ensure validRequest is truly a Request object with all methods bound
    // Sometimes creating a new Request doesn't properly bind all methods
    const finalRequest = new Request(validRequest.url, {
      method: validRequest.method,
      headers: validRequest.headers,
      body: validRequest.body,
      cache: validRequest.cache,
      credentials: validRequest.credentials,
      integrity: validRequest.integrity,
      keepalive: validRequest.keepalive,
      mode: validRequest.mode,
      redirect: validRequest.redirect,
      referrer: validRequest.referrer,
      referrerPolicy: validRequest.referrerPolicy,
      signal: validRequest.signal,
    });
    
    console.log('[Vercel tRPC] FinalRequest headers.get type:', typeof finalRequest.headers.get);
    
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: finalRequest,
      router: appRouter,
      createContext: () => ctx,
      onError: ({ error, path, type }) => {
        console.error('[Vercel tRPC] Error in handler:', {
          error: error.message,
          path,
          type,
          stack: error.stack,
        });
      },
    });
    
    // Ensure response is JSON - check status and content type
    const contentType = response.headers.get('content-type') || '';
    const isErrorStatus = response.status >= 400;
    
    if (isErrorStatus && !contentType.includes('application/json')) {
      // If response is an error and not JSON, try to read it and convert to JSON error
      const text = await response.text().catch(() => 'Unknown error');
      console.error('[Vercel tRPC] Non-JSON error response received:', text.substring(0, 200));
      
      return new Response(
        JSON.stringify({
          error: {
            message: text.includes('server error') || text.includes('Server Error') 
              ? 'A server error occurred. Please try again later.'
              : 'An unexpected error occurred',
            code: 'INTERNAL_SERVER_ERROR',
            details: process.env.NODE_ENV === 'development' ? text.substring(0, 500) : undefined,
          },
        }),
        {
          status: response.status || 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
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
    console.error('[Vercel tRPC] Error in handleRequest:', error);
    console.error('[Vercel tRPC] Error stack:', error instanceof Error ? error.stack : 'No stack');
    
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

