// api/trpc.ts - Vercel Serverless Function with inline dependencies
import { initTRPC } from '@trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================
// Validate critical environment variables
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('[CRITICAL] DATABASE_URL is not configured!');
  // In production, we should fail fast, but in development we can continue
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL environment variable is required');
  }
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn('[WARNING] STRIPE_SECRET_KEY is not configured. Payment features will not work.');
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('[WARNING] RESEND_API_KEY is not configured. Email features will not work.');
}

// ============================================================================
// DATABASE CONNECTION
// ============================================================================
// Use Neon serverless driver for Vercel serverless functions
// This is optimized for serverless environments and doesn't maintain persistent connections
const sql = neon(DATABASE_URL || '');

// ============================================================================
// TRPC SETUP
// ============================================================================
// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// User type definition
type User = {
  id: number;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  emailVerified?: boolean;
};

// Define context type
type Context = {
  user: User | null;
  setCookie: (name: string, value: string) => void;
  clearCookie: (name: string) => void;
  clientIp?: string;
};

const t = initTRPC.context<Context>().create();
const router = t.router;
const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const user = (ctx as Context).user;
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  return next({ ctx });
});

// Middleware to check if user is admin
const adminProcedure = publicProcedure.use(async ({ ctx, next }) => {
  const user = (ctx as Context).user;
  if (!user || user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return next({ ctx });
});

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

// Password strength validation
function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

// Sanitize string input to prevent XSS
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limit length
}

// Enhanced email validation with RFC 5322 compliant regex
function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  
  // RFC 5322 compliant regex (simplified but robust)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  // Check length
  if (email.length > 255) {
    return { valid: false, message: 'Email is too long (max 255 characters)' };
  }
  
  // Check for common invalid patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
}

// Sanitize email
function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 255);
}

// Structured logging with levels
type LogLevel = 'info' | 'warn' | 'error' | 'security';
type LogEntry = {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  ip?: string;
  userId?: number;
  path?: string;
};

function structuredLog(level: LogLevel, message: string, data?: any, metadata?: { ip?: string; userId?: number; path?: string }) {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
    ...(metadata?.ip && { ip: metadata.ip }),
    ...(metadata?.userId && { userId: metadata.userId }),
    ...(metadata?.path && { path: metadata.path }),
  };
  
  const logString = JSON.stringify(logEntry);
  
  switch (level) {
    case 'error':
      console.error(`[${level.toUpperCase()}]`, logString);
      break;
    case 'warn':
    case 'security':
      console.warn(`[${level.toUpperCase()}]`, logString);
      break;
    default:
      console.log(`[${level.toUpperCase()}]`, logString);
  }
  
  // In production, you might want to send this to a logging service
  // For now, we just log to console
}

// Security logging (wrapper for structured logging)
function logSecurityEvent(type: string, details: any, ip?: string) {
  structuredLog('security', type, details, { ip });
}

// Error handling wrapper for database queries
async function withTimeout<T>(
  query: () => Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Database query timeout'
): Promise<T> {
  return Promise.race([
    query(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
}

// Retry logic for database queries
async function withRetry<T>(
  query: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await query();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('connection') ||
        error.message.includes('ECONNREFUSED')
      )) {
        if (attempt < maxRetries) {
          structuredLog('warn', `Database query failed, retrying (${attempt}/${maxRetries})`, { error: lastError.message });
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
          continue;
        }
      }
      
      // For other errors, throw immediately
      throw lastError;
    }
  }
  
  throw lastError || new Error('Query failed after retries');
}

// Safe database query wrapper with timeout and retry
async function safeQuery<T>(
  query: () => Promise<T>,
  options: { timeoutMs?: number; retries?: number; errorMessage?: string } = {}
): Promise<T> {
  const { timeoutMs = 10000, retries = 2, errorMessage = 'Database query failed' } = options;
  
  try {
    return await withRetry(
      () => withTimeout(query, timeoutMs, errorMessage),
      retries
    );
  } catch (error) {
    structuredLog('error', 'Database query failed', {
      error: error instanceof Error ? error.message : String(error),
      timeout: timeoutMs,
      retries,
    });
    throw error;
  }
}

// Simple in-memory cache for frequent queries
const queryCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const cached = queryCache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    queryCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number = CACHE_TTL_MS): void {
  queryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function clearCache(pattern?: string): void {
  if (!pattern) {
    queryCache.clear();
    return;
  }
  
  for (const key of queryCache.keys()) {
    if (key.includes(pattern)) {
      queryCache.delete(key);
    }
  }
}

// Rate limiting tracking (in-memory, for serverless this is per-instance)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxAttempts) {
    return false;
  }
  
  record.count++;
  return true;
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================
async function getUserByEmail(email: string) {
  const sanitizedEmail = sanitizeEmail(email);
  const users = await sql`
    SELECT * FROM users WHERE email = ${sanitizedEmail} LIMIT 1
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
  // Sanitize all inputs
  const sanitizedEmail = sanitizeEmail(data.email);
  const sanitizedName = sanitizeString(data.name);
  const sanitizedPhone = data.phone ? sanitizeString(data.phone) : '';
  const sanitizedAddress = data.address ? sanitizeString(data.address) : '';
  const sanitizedCity = data.city ? sanitizeString(data.city) : '';
  const sanitizedState = data.state ? sanitizeString(data.state) : '';
  const sanitizedCountry = data.country ? sanitizeString(data.country) : '';
  
  // Validate password strength
  const passwordValidation = validatePasswordStrength(data.password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.message || 'Password does not meet security requirements');
  }
  
  // Hash password with bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(data.password, 10);
  
  const users = await sql`
    INSERT INTO users (
      email, name, password, phone, address, city, state, "poBox", country,
      role, "emailVerified", "loginMethod", "createdAt", "updatedAt", "lastSignedIn"
    )
    VALUES (
      ${sanitizedEmail}, ${sanitizedName}, ${hashedPassword},
      ${sanitizedPhone}, ${sanitizedAddress}, ${sanitizedCity},
      ${sanitizedState}, ${data.poBox || null}, ${sanitizedCountry},
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
  
  // Update last signed in
  try {
    await sql`
      UPDATE users
      SET "lastSignedIn" = NOW()
      WHERE id = ${user.id}
    `;
  } catch (e) {
    console.warn('[Login] Failed to update lastSignedIn:', e);
    // Continue even if update fails
  }
  
  return user;
}

async function verifyEmailToken(token: string) {
  const users = await sql`
    SELECT * FROM users
    WHERE "emailVerificationToken" = ${token}
      AND "emailVerificationExpires" > NOW()
    LIMIT 1
  `;
  
  if (users.length === 0) {
    return null;
  }
  
  const user = users[0];
  
  // Mark email as verified and clear token
  await sql`
    UPDATE users
    SET "emailVerified" = 1,
        "emailVerificationToken" = NULL,
        "emailVerificationExpires" = NULL
    WHERE id = ${user.id}
  `;
  
  return user;
}

// ============================================================================
// EMAIL SENDING (using Resend)
// ============================================================================
async function sendVerificationEmail(email: string, token: string, name: string) {
  try {
    // Import the email module dynamically to avoid issues in serverless
    const { sendVerificationEmail: sendEmail } = await import('../server/email');
    await sendEmail(email, token, name);
    console.log('[Email] Verification email sent to:', email);
  } catch (error) {
    console.error('[Email] Error sending verification email:', error);
    // Fallback: try direct Resend API call
    try {
      const verifyUrl = `${process.env.SITE_URL || 'https://ileala.ae'}/verify-email?token=${token}`;
      
      if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'ILE ALA <noreply@ileala.ae>',
          to: email,
            subject: 'Verify your email - ILE ALA',
          html: `
            <h1>Welcome ${name}!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verifyUrl}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
          `,
          }),
      });
      
      if (!response.ok) {
        console.error('[Email] Failed to send verification email:', await response.text());
      }
    } else {
        console.log('[Email] RESEND_API_KEY not configured. Verification URL:', verifyUrl);
      }
    } catch (fallbackError) {
      console.error('[Email] Fallback email sending also failed:', fallbackError);
    }
  }
}

async function sendWelcomeEmail(email: string, name: string) {
  try {
    // Import the email module dynamically
    const { sendWelcomeEmail: sendEmail } = await import('../server/email');
    await sendEmail(email, name);
    console.log('[Email] Welcome email sent to:', email);
  } catch (error) {
    console.error('[Email] Error sending welcome email:', error);
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
        name: z.string().min(2).max(100),
        email: z.string().email().max(255).refine((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        }, { message: 'Invalid email format' }),
        password: z.string().min(8).max(128),
        phone: z.string().max(50).optional(),
        address: z.string().max(255).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(100).optional(),
        poBox: z.string().max(50).optional(),
        country: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get client IP for rate limiting and logging
          const clientIp = ctx.req?.headers?.['x-forwarded-for'] || 
                          ctx.req?.headers?.['x-real-ip'] || 
                          'unknown';
          
          // Rate limiting: max 3 registrations per IP per 15 minutes
          const rateLimitKey = `register:${clientIp}`;
          if (!checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000)) {
            logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'register', email: input.email }, clientIp);
            throw new Error('Too many registration attempts. Please try again later.');
          }
          
          console.log('[Register] Starting registration for:', input.email);
          
          // Validate password strength
          const passwordValidation = validatePasswordStrength(input.password);
          if (!passwordValidation.valid) {
            logSecurityEvent('WEAK_PASSWORD_ATTEMPT', { email: input.email }, clientIp);
            throw new Error(passwordValidation.message || 'Password does not meet security requirements');
          }
          
        const existingUser = await safeQuery(
          () => getUserByEmail(input.email),
          { timeoutMs: 5000, retries: 1 }
        );
        
          if (existingUser) {
          logSecurityEvent('DUPLICATE_REGISTRATION_ATTEMPT', { email: input.email }, clientIp);
            throw new Error('User with this email already exists');
          }
          
        structuredLog('info', 'Creating new user', { email: input.email }, { ip: clientIp });
        const user = await safeQuery(
          () => createUser(input),
          { timeoutMs: 10000, retries: 2 }
        );
          console.log('[Register] User created:', user.id);
          
          logSecurityEvent('USER_REGISTERED', { userId: user.id, email: user.email }, clientIp);
          
          const token = await generateEmailVerificationToken(user.id);
          await sendVerificationEmail(user.email, token, user.name || 'Customer');
          
          // Set session cookie
          const sessionValue = createSessionCookie(user);
          (ctx as Context).setCookie(COOKIE_NAME, sessionValue);
          
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
        email: z.string().email().max(255).refine((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        }, { message: 'Invalid email format' }),
        password: z.string().max(128),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get client IP for rate limiting and logging
        const clientIp = ctx.req?.headers?.['x-forwarded-for'] || 
                        ctx.req?.headers?.['x-real-ip'] || 
                        'unknown';
        
        // Rate limiting: max 5 login attempts per IP per 15 minutes
        const rateLimitKey = `login:${clientIp}`;
        if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'login', email: input.email }, clientIp);
          throw new Error('Too many login attempts. Please try again in 15 minutes.');
        }
        
        // Sanitize email
        const sanitizedEmail = sanitizeEmail(input.email);
        
        const user = await safeQuery(
          () => verifyUserCredentials(sanitizedEmail, input.password),
          { timeoutMs: 5000, retries: 1 }
        );
        
        if (!user) {
          logSecurityEvent('FAILED_LOGIN_ATTEMPT', { email: sanitizedEmail }, clientIp);
          throw new Error('Invalid email or password');
        }
        
        logSecurityEvent('SUCCESSFUL_LOGIN', { userId: user.id, email: user.email }, clientIp);
        
        const sessionValue = createSessionCookie(user);
        (ctx as Context).setCookie(COOKIE_NAME, sessionValue);
        
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
      return (ctx as Context).user || null;
    }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      (ctx as Context).clearCookie(COOKIE_NAME);
      return { success: true };
    }),
    
    verifyEmail: publicProcedure
      .input(z.object({
        token: z.string().min(10).max(100),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get client IP for rate limiting
        const clientIp = (ctx as Context).clientIp || 'unknown';
        
        // Rate limiting: max 10 verification attempts per IP per 5 minutes
        const rateLimitKey = `verify:${clientIp}`;
        if (!checkRateLimit(rateLimitKey, 10, 5 * 60 * 1000)) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'verify_email' }, clientIp);
          throw new Error('Too many verification attempts. Please try again later.');
        }
        
        // Sanitize token (only alphanumeric and hyphens)
        const sanitizedToken = input.token.replace(/[^a-zA-Z0-9\-_]/g, '');
        
        const user = await verifyEmailToken(sanitizedToken);
        if (!user) {
          logSecurityEvent('INVALID_VERIFICATION_TOKEN', { tokenLength: input.token.length }, clientIp);
          throw new Error('Invalid or expired verification token');
        }
        
        logSecurityEvent('EMAIL_VERIFIED', { userId: user.id, email: user.email }, clientIp);
        
        // Send welcome email after verification
        await sendWelcomeEmail(user.email, user.name || 'Customer');
        
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
    
    resendVerification: publicProcedure
      .input(z.object({
        email: z.string().email().max(255).refine((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        }, { message: 'Invalid email format' }),
      }))
      .mutation(async ({ input, ctx }) => {
        const clientIp = (ctx as Context).clientIp || 'unknown';
        
        // Rate limiting: max 3 reenvios por hora
        const rateLimitKey = `resend:${input.email}`;
        if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'resend_verification', email: input.email }, clientIp);
          throw new Error('Too many verification email requests. Please try again later.');
        }
        
        const sanitizedEmail = sanitizeEmail(input.email);
        const user = await getUserByEmail(sanitizedEmail);
        
        if (!user) {
          // Don't reveal if user exists for security
          return { success: true };
        }
        
        if (user.emailVerified) {
          throw new Error('Email already verified');
        }
        
        const token = await generateEmailVerificationToken(user.id);
        await sendVerificationEmail(user.email, token, user.name || 'Customer');
        
        logSecurityEvent('VERIFICATION_EMAIL_RESENT', { userId: user.id, email: user.email }, clientIp);
        
        return { success: true };
      }),
    
    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email().max(255).refine((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        }, { message: 'Invalid email format' }),
      }))
      .mutation(async ({ input, ctx }) => {
        const clientIp = (ctx as Context).clientIp || 'unknown';
        
        // Rate limiting: max 3 tentativas por hora
        const rateLimitKey = `forgot:${input.email}`;
        if (!checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000)) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'forgot_password', email: input.email }, clientIp);
          // Don't reveal rate limit for security
          return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
        }
        
        const sanitizedEmail = sanitizeEmail(input.email);
        const user = await getUserByEmail(sanitizedEmail);
        
        if (!user) {
          // Don't reveal if email exists for security
          return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
        }
        
        // Generate password reset token (using nanoid for consistency)
        const resetToken = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        
        // Update user with token
        await sql`
          UPDATE users
          SET "passwordResetToken" = ${resetToken},
              "passwordResetExpires" = ${expiresAt.toISOString()},
              "updatedAt" = NOW()
          WHERE id = ${user.id}
        `;
        
        // Send password reset email
        const { sendPasswordResetEmail } = await import('../server/email');
        await sendPasswordResetEmail(user.email, resetToken, user.name || 'Customer');
        
        logSecurityEvent('PASSWORD_RESET_REQUESTED', { userId: user.id, email: user.email }, clientIp);
        
        return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
      }),
    
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string().min(10).max(100),
        newPassword: z.string().min(8).max(128),
      }))
      .mutation(async ({ input, ctx }) => {
        const clientIp = (ctx as Context).clientIp || 'unknown';
        
        // Rate limiting: max 5 tentativas por IP por 15 minutos
        const rateLimitKey = `reset:${clientIp}`;
        if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
          logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'reset_password' }, clientIp);
          throw new Error('Too many password reset attempts. Please try again later.');
        }
        
        // Validate password strength
        const passwordValidation = validatePasswordStrength(input.newPassword);
        if (!passwordValidation.valid) {
          logSecurityEvent('WEAK_PASSWORD_ATTEMPT', { action: 'reset_password' }, clientIp);
          throw new Error(passwordValidation.message || 'Password does not meet security requirements');
        }
        
        // Sanitize token
        const sanitizedToken = input.token.replace(/[^a-zA-Z0-9\-_]/g, '');
        
        // Find user with valid token
        const users = await sql`
          SELECT id, "passwordResetExpires"
          FROM users
          WHERE "passwordResetToken" = ${sanitizedToken}
            AND "passwordResetExpires" > NOW()
          LIMIT 1
        `;
        
        if (users.length === 0) {
          logSecurityEvent('INVALID_RESET_TOKEN', { tokenLength: input.token.length }, clientIp);
          throw new Error('Invalid or expired reset token');
        }
        
        const userId = users[0].id;
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);
        
        // Update user password and clear reset token
        await sql`
          UPDATE users
          SET password = ${hashedPassword},
              "passwordResetToken" = NULL,
              "passwordResetExpires" = NULL,
              "updatedAt" = NOW()
          WHERE id = ${userId}
        `;
        
        logSecurityEvent('PASSWORD_RESET_SUCCESS', { userId: user_id }, clientIp);
        
        return { success: true, message: 'Password updated successfully' };
      }),
  }),
  
  // Products router
  products: router({
    list: publicProcedure.query(async () => {
      const cacheKey = 'products:list';
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const products = await safeQuery(
        () => sql`
          SELECT * FROM products
          WHERE active = 1
          ORDER BY "createdAt" DESC
        `,
        { timeoutMs: 5000, retries: 1 }
      );
      
      setCache(cacheKey, products);
      return products;
    }),
    
    featured: publicProcedure.query(async () => {
      const cacheKey = 'products:featured';
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const products = await safeQuery(
        () => sql`
          SELECT * FROM products
          WHERE active = 1 AND featured = 1
          ORDER BY "createdAt" DESC
        `,
        { timeoutMs: 5000, retries: 1 }
      );
      
      setCache(cacheKey, products);
      return products;
    }),
    
    byId: publicProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input }) => {
        const cacheKey = `products:byId:${input.id}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const products = await safeQuery(
          () => sql`
            SELECT * FROM products
            WHERE id = ${input.id} AND active = 1
            LIMIT 1
          `,
          { timeoutMs: 5000, retries: 1 }
        );
        
        if (products.length === 0) {
          throw new Error('Product not found');
        }
        
        const product = products[0];
        setCache(cacheKey, product);
        return product;
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string().max(255) }))
      .query(async ({ input }) => {
        const sanitizedSlug = sanitizeString(input.slug);
        const cacheKey = `products:bySlug:${sanitizedSlug}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const products = await safeQuery(
          () => sql`
            SELECT * FROM products
            WHERE slug = ${sanitizedSlug} AND active = 1
            LIMIT 1
          `,
          { timeoutMs: 5000, retries: 1 }
        );
        
        if (products.length === 0) {
          throw new Error('Product not found');
        }
        
        const product = products[0];
        setCache(cacheKey, product);
        return product;
      }),
    
    byCollection: publicProcedure
      .input(z.object({ collection: z.string().max(100) }))
      .query(async ({ input }) => {
        const sanitizedCollection = sanitizeString(input.collection);
        const cacheKey = `products:byCollection:${sanitizedCollection}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const products = await safeQuery(
          () => sql`
            SELECT * FROM products
            WHERE collection = ${sanitizedCollection} AND active = 1
            ORDER BY "createdAt" DESC
          `,
          { timeoutMs: 5000, retries: 1 }
        );
        
        setCache(cacheKey, products);
        return products;
      }),
  }),
  
  // Cart router
  cart: router({
    items: protectedProcedure.query(async ({ ctx }) => {
      const user = (ctx as Context).user;
      
      const items = await sql`
        SELECT 
          ci.id,
          ci.quantity,
          ci."createdAt",
          ci."updatedAt",
          p.id as "productId",
          p.name,
          p."nameEN",
          p."namePT",
          p.slug,
          p.price,
          p."imageUrl",
          p.stock,
          p.active
        FROM "cartItems" ci
        JOIN products p ON ci."productId" = p.id
        WHERE ci."userId" = ${user.id}
        ORDER BY ci."createdAt" DESC
      `;
      
      return items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          id: item.productId,
          name: item.name,
          nameEN: item.nameEN,
          namePT: item.namePT,
          slug: item.slug,
          price: item.price,
          imageUrl: item.imageUrl,
          stock: item.stock,
          active: item.active,
        },
      }));
    }),
    
    add: protectedProcedure
      .input(z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(999),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as Context).user;
        
        // Check if product exists and is active
        const products = await sql`
          SELECT id, stock FROM products
          WHERE id = ${input.productId} AND active = 1
          LIMIT 1
        `;
        
        if (products.length === 0) {
          throw new Error('Product not found');
        }
        
        const product = products[0];
        
        // Check if item already exists in cart
        const existing = await sql`
          SELECT id, quantity FROM "cartItems"
          WHERE "userId" = ${user.id} AND "productId" = ${input.productId}
          LIMIT 1
        `;
        
        if (existing.length > 0) {
          // Update quantity
          const newQuantity = existing[0].quantity + input.quantity;
          await sql`
            UPDATE "cartItems"
            SET quantity = ${newQuantity}, "updatedAt" = NOW()
            WHERE id = ${existing[0].id}
          `;
          return { id: existing[0].id };
        } else {
          // Insert new item
          const result = await sql`
            INSERT INTO "cartItems" ("userId", "productId", quantity, "createdAt", "updatedAt")
            VALUES (${user.id}, ${input.productId}, ${input.quantity}, NOW(), NOW())
            RETURNING id
          `;
          return { id: result[0].id };
        }
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().min(0).max(999),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as Context).user;
        
        // Verify cart item belongs to user
        const items = await sql`
          SELECT id FROM "cartItems"
          WHERE id = ${input.id} AND "userId" = ${user.id}
          LIMIT 1
        `;
        
        if (items.length === 0) {
          throw new Error('Cart item not found');
        }
        
        if (input.quantity === 0) {
          await sql`DELETE FROM "cartItems" WHERE id = ${input.id}`;
        } else {
          await sql`
            UPDATE "cartItems"
            SET quantity = ${input.quantity}, "updatedAt" = NOW()
            WHERE id = ${input.id}
          `;
        }
        
        return { success: true };
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as Context).user;
        
        // Verify cart item belongs to user
        const items = await sql`
          SELECT id FROM "cartItems"
          WHERE id = ${input.id} AND "userId" = ${user.id}
          LIMIT 1
        `;
        
        if (items.length === 0) {
          throw new Error('Cart item not found');
        }
        
        await sql`DELETE FROM "cartItems" WHERE id = ${input.id}`;
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const user = (ctx as Context).user;
      
      await sql`DELETE FROM "cartItems" WHERE "userId" = ${user.id}`;
      return { success: true };
    }),
  }),
  
  // Coupons router
  coupons: router({
    validate: publicProcedure
      .input(z.object({
        code: z.string().min(3).max(50),
        orderTotal: z.number().min(0),
      }))
      .query(async ({ input }) => {
        const sanitizedCode = input.code.toUpperCase().replace(/[^A-Z0-9-_]/g, '');
        
        // Get coupon
        const coupons = await sql`
          SELECT * FROM coupons
          WHERE code = ${sanitizedCode}
          LIMIT 1
        `;
        
        if (coupons.length === 0) {
          return { valid: false, message: 'Coupon not found' };
        }
        
        const coupon = coupons[0];
        
        if (coupon.active === 0) {
          return { valid: false, message: 'Coupon is inactive' };
        }
        
        // Check if coupon has expired
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
          return { valid: false, message: 'Coupon has expired' };
        }
        
        // Check if coupon hasn't started yet
        if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
          return { valid: false, message: 'Coupon is not yet valid' };
        }
        
        // Check max uses
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
          return { valid: false, message: 'Coupon has reached maximum uses' };
        }
        
        // Check minimum purchase amount
        if (input.orderTotal < coupon.minPurchaseAmount) {
          return { valid: false, message: `Minimum purchase of ${coupon.minPurchaseAmount} AED required` };
        }
        
        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
          discount = Math.floor((input.orderTotal * coupon.discountValue) / 100);
        } else {
          discount = Math.min(coupon.discountValue, input.orderTotal);
        }
        
        return {
          valid: true,
          discount,
          coupon,
        };
      }),
  }),
  
  // Orders router
  orders: router({
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1),
          price: z.number().min(0),
        })),
        shippingAddress: z.string().max(500),
        customerName: z.string().min(2).max(100),
        customerEmail: z.string().email().max(255).refine((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        }, { message: 'Invalid email format' }),
        customerPhone: z.string().max(50).optional(),
        couponCode: z.string().max(50).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as Context).user;
        
        const clientIp = (ctx as Context).clientIp || 'unknown';
        
        // Sanitize inputs
        const sanitizedAddress = sanitizeString(input.shippingAddress);
        const sanitizedName = sanitizeString(input.customerName);
        const sanitizedEmail = sanitizeEmail(input.customerEmail);
        const sanitizedPhone = input.customerPhone ? sanitizeString(input.customerPhone) : null;
        const sanitizedCouponCode = input.couponCode ? input.couponCode.toUpperCase().replace(/[^A-Z0-9-_]/g, '') : null;
        
        // Calculate subtotal
        const subtotal = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Apply coupon if provided
        let discountAmount = 0;
        let totalAmount = subtotal;
        
        if (sanitizedCouponCode) {
          const coupons = await sql`
            SELECT * FROM coupons
            WHERE code = ${sanitizedCouponCode} AND active = 1
            LIMIT 1
          `;
          
          if (coupons.length > 0) {
            const coupon = coupons[0];
            
            // Validate coupon
            if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
              // Coupon expired, continue without it
            } else if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
              // Coupon not yet valid, continue without it
            } else if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
              // Coupon max uses reached, continue without it
            } else if (subtotal >= coupon.minPurchaseAmount) {
              // Calculate discount
              if (coupon.discountType === 'percentage') {
                discountAmount = Math.floor((subtotal * coupon.discountValue) / 100);
              } else {
                discountAmount = Math.min(coupon.discountValue, subtotal);
              }
              
              totalAmount = subtotal - discountAmount;
              
              // Increment coupon usage
              await sql`
                UPDATE coupons
                SET "usedCount" = "usedCount" + 1, "updatedAt" = NOW()
                WHERE code = ${sanitizedCouponCode}
              `;
            }
          }
        }
        
        // Create order
        const orderResult = await sql`
          INSERT INTO orders (
            "userId", "totalAmount", "shippingAddress", "customerName",
            "customerEmail", "customerPhone", "couponCode", "discountAmount",
            status, "paymentStatus", "createdAt", "updatedAt"
          )
          VALUES (
            ${user.id}, ${totalAmount}, ${sanitizedAddress}, ${sanitizedName},
            ${sanitizedEmail}, ${sanitizedPhone}, ${sanitizedCouponCode}, ${discountAmount},
            'pending', 'pending', NOW(), NOW()
          )
          RETURNING id
        `;
        
        const orderId = orderResult[0].id;
        
        // Create order items
        for (const item of input.items) {
          await sql`
            INSERT INTO "orderItems" (
              "orderId", "productId", quantity, "priceAtPurchase", "createdAt", "updatedAt"
            )
            VALUES (
              ${orderId}, ${item.productId}, ${item.quantity}, ${item.price}, NOW(), NOW()
            )
          `;
        }
        
        // Clear cart
        await sql`DELETE FROM "cartItems" WHERE "userId" = ${user.id}`;
        
        logSecurityEvent('ORDER_CREATED', { orderId, userId: user.id }, clientIp);
        
        return { orderId };
      }),
    
    byId: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        const user = (ctx as Context).user;
        
        const orders = await sql`
          SELECT * FROM orders
          WHERE id = ${input.id}
          LIMIT 1
        `;
        
        if (orders.length === 0) {
          throw new Error('Order not found');
        }
        
        const order = orders[0];
        
        // Check if user owns this order or is admin
        if (order.userId !== user.id && user.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        const items = await sql`
          SELECT 
            oi.id,
            oi.quantity,
            oi."priceAtPurchase",
            p.id as "productId",
            p.name,
            p."nameEN",
            p."namePT",
            p.slug,
            p."imageUrl"
          FROM "orderItems" oi
          JOIN products p ON oi."productId" = p.id
          WHERE oi."orderId" = ${input.id}
        `;
        
        return {
          ...order,
          items: items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            product: {
              id: item.productId,
              name: item.name,
              nameEN: item.nameEN,
              namePT: item.namePT,
              slug: item.slug,
              imageUrl: item.imageUrl,
            },
          })),
        };
      }),
    
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const user = (ctx as Context).user;
      
      const orders = await sql`
        SELECT * FROM orders
        WHERE "userId" = ${user.id}
        ORDER BY "createdAt" DESC
      `;
      
      return orders;
    }),
  }),
  
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email().max(255).refine((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        }, { message: 'Invalid email format' }),
        name: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get client IP for rate limiting
          const clientIp = (ctx as Context).clientIp || 'unknown';
          
          // Rate limiting: max 5 subscriptions per IP per hour
          const rateLimitKey = `newsletter:${clientIp}`;
          if (!checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000)) {
            logSecurityEvent('RATE_LIMIT_EXCEEDED', { action: 'newsletter_subscribe' }, clientIp);
            throw new Error('Too many subscription attempts. Please try again later.');
          }
          
          // Sanitize inputs
          const sanitizedEmail = sanitizeEmail(input.email);
          const sanitizedName = input.name ? sanitizeString(input.name) : undefined;
          
          console.log('[Newsletter] Subscribing:', sanitizedEmail);
          
          // Check if email already exists
          const existing = await sql`
            SELECT id FROM newsletter WHERE email = ${sanitizedEmail} LIMIT 1
          `;
          
          if (existing.length > 0) {
            // Update existing subscription to active
            await sql`
              UPDATE newsletter
              SET active = 1, subscribed_at = NOW()
              WHERE email = ${sanitizedEmail}
            `;
            console.log('[Newsletter] Reactivated existing subscription');
            return { success: true, message: 'Email already subscribed - reactivated' };
          }
          
          // Insert new subscription
          if (sanitizedName && sanitizedName.trim()) {
            await sql`
              INSERT INTO newsletter (email, name, source, active, subscribed_at)
              VALUES (${sanitizedEmail}, ${sanitizedName.trim()}, 'website', 1, NOW())
            `;
          } else {
            await sql`
              INSERT INTO newsletter (email, source, active, subscribed_at)
              VALUES (${sanitizedEmail}, 'website', 1, NOW())
            `;
          }
          
          console.log('[Newsletter] Successfully subscribed');
          return { success: true };
        } catch (error: any) {
          console.error('[Newsletter] Error:', error);
          
          // Check if it's a duplicate email error (unique constraint)
          if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
            // Try to reactivate
            try {
              const sanitizedEmail = sanitizeEmail(input.email);
              await sql`
                UPDATE newsletter
                SET active = 1, subscribed_at = NOW()
                WHERE email = ${sanitizedEmail}
              `;
              return { success: true, message: 'Email already subscribed - reactivated' };
            } catch (updateError) {
              throw new Error('Email already subscribed');
            }
          }
          
          throw new Error('Failed to subscribe to newsletter');
        }
      }),
  }),
  
  // System router
  system: router({
    health: publicProcedure
      .input(z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }))
      .query(() => ({
        ok: true,
      })),
    
    notifyOwner: adminProcedure
      .input(z.object({
        title: z.string().min(1, "title is required").max(1200),
        content: z.string().min(1, "content is required").max(20000),
      }))
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import('../server/_core/notification');
        const delivered = await notifyOwner(input);
        return {
          success: delivered,
        } as const;
      }),
  }),
  
  // Payment router
  payment: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({
        orderId: z.number().int().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = (ctx as Context).user;
        
        if (!STRIPE_SECRET_KEY) {
          throw new Error('Stripe is not configured');
        }
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: '2025-10-29.clover',
        });
        
        const orders = await sql`
          SELECT * FROM orders
          WHERE id = ${input.orderId}
          LIMIT 1
        `;
        
        if (orders.length === 0) {
          throw new Error('Order not found');
        }
        
        const order = orders[0];
        
        if (order.userId !== user.id) {
          throw new Error('Unauthorized');
        }
        
        const items = await sql`
          SELECT 
            oi.quantity,
            oi."priceAtPurchase",
            p."nameEN",
            p."descriptionEN",
            p."imageUrl"
          FROM "orderItems" oi
          JOIN products p ON oi."productId" = p.id
          WHERE oi."orderId" = ${input.orderId}
        `;
        
        const lineItems = items.map(item => ({
          price_data: {
            currency: 'aed',
            product_data: {
              name: item.nameEN || 'Product',
              description: item.descriptionEN || undefined,
              images: item.imageUrl ? [item.imageUrl] : [],
            },
            unit_amount: Math.round(item.priceAtPurchase * 100), // Convert to fils (cents)
          },
          quantity: item.quantity,
        }));
        
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || process.env.SITE_URL || 'https://ileala.ae';
        
        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: 'payment',
          currency: 'aed',
          success_url: `${baseUrl}/order-confirmation/${input.orderId}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/checkout`,
          metadata: {
            orderId: input.orderId.toString(),
          },
        });
        
        return { sessionId: session.id, url: session.url || '' };
      }),
    
    verifyPayment: protectedProcedure
      .input(z.object({
        sessionId: z.string().min(1),
      }))
      .query(async ({ input }) => {
        if (!STRIPE_SECRET_KEY) {
          throw new Error('Stripe is not configured');
        }
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: '2025-10-29.clover',
        });
        
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        
        if (session.payment_status === 'paid' && session.metadata?.orderId) {
          const orderId = parseInt(session.metadata.orderId);
          await sql`
            UPDATE orders
            SET "paymentStatus" = 'paid', "updatedAt" = NOW()
            WHERE id = ${orderId}
          `;
        }
        
        return {
          paymentStatus: session.payment_status,
          orderId: session.metadata?.orderId,
        };
      }),
    
    createSanityCheckout: publicProcedure
      .input(z.object({
        productId: z.string().min(1),
        productName: z.string().min(1).max(255),
        productPrice: z.number().min(0),
        productImage: z.string().url().max(500).optional(),
        quantity: z.number().int().min(1).max(999).default(1),
      }))
      .mutation(async ({ input }) => {
        if (!STRIPE_SECRET_KEY) {
          throw new Error('Stripe is not configured');
        }
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: '2025-10-29.clover',
        });
        
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || process.env.SITE_URL || 'https://ileala.ae';
        
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: 'aed',
                product_data: {
                  name: input.productName,
                  images: input.productImage ? [input.productImage] : [],
                },
                unit_amount: Math.round(input.productPrice * 100), // Convert to fils (cents)
              },
              quantity: input.quantity,
            },
          ],
          mode: 'payment',
          currency: 'aed',
          locale: 'en',
          success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/products`,
          metadata: {
            productId: input.productId,
            source: 'sanity',
          },
        });
        
        return { sessionId: session.id, url: session.url || '' };
      }),
    
    createSanityCartCheckout: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.string().min(1),
          productName: z.string().min(1).max(255),
          productPrice: z.number().min(0),
          productImage: z.string().url().max(500).optional(),
          quantity: z.number().int().min(1).max(999),
        })),
      }))
      .mutation(async ({ input }) => {
        if (!STRIPE_SECRET_KEY) {
          throw new Error('Stripe is not configured');
        }
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(STRIPE_SECRET_KEY, {
          apiVersion: '2025-10-29.clover',
        });
        
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || process.env.SITE_URL || 'https://ileala.ae';
        
        const lineItems = input.items.map(item => ({
          price_data: {
            currency: 'aed',
            product_data: {
              name: item.productName,
              images: item.productImage ? [item.productImage] : [],
            },
            unit_amount: Math.round(item.productPrice * 100), // Convert to fils (cents)
          },
          quantity: item.quantity,
        }));
        
        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: 'payment',
          currency: 'aed',
          locale: 'en',
          success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/cart`,
          metadata: {
            source: 'sanity-cart',
            itemCount: input.items.length.toString(),
          },
        });
        
        return { sessionId: session.id, url: session.url || '' };
      }),
  }),
  
  // Admin router (protected - only for admin users)
  admin: router({
    // Products management
    products: router({
      list: adminProcedure.query(async () => {
        const products = await sql`
          SELECT * FROM products ORDER BY "createdAt" DESC
        `;
        return products;
      }),
      
      create: adminProcedure
        .input(z.object({
          nameEN: z.string().min(1).max(255),
          namePT: z.string().min(1).max(255),
          descriptionEN: z.string().max(5000).optional(),
          descriptionPT: z.string().max(5000).optional(),
          price: z.number().min(0).max(999999.99),
          imageUrl: z.string().url().max(500).optional(),
          collection: z.string().max(100).optional(),
          category: z.string().max(100).optional(),
          stock: z.number().min(0).max(999999).default(0),
          featured: z.number().min(0).max(1).default(0),
        }))
        .mutation(async ({ input, ctx }) => {
          // Sanitize all string inputs
          const sanitizedNameEN = sanitizeString(input.nameEN);
          const sanitizedNamePT = sanitizeString(input.namePT);
          const sanitizedDescEN = input.descriptionEN ? sanitizeString(input.descriptionEN) : null;
          const sanitizedDescPT = input.descriptionPT ? sanitizeString(input.descriptionPT) : null;
          const sanitizedCollection = input.collection ? sanitizeString(input.collection) : null;
          const sanitizedCategory = input.category ? sanitizeString(input.category) : null;
          
          // Validate imageUrl is a valid URL if provided
          let sanitizedImageUrl = null;
          if (input.imageUrl) {
            try {
              new URL(input.imageUrl);
              sanitizedImageUrl = input.imageUrl.slice(0, 500);
            } catch (e) {
              throw new Error('Invalid image URL');
            }
          }
          
          // Generate slug from nameEN
          const slug = sanitizedNameEN.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();
          
          const clientIp = (ctx as Context).clientIp || 'unknown';
          logSecurityEvent('PRODUCT_CREATED', { productName: sanitizedNameEN }, clientIp);
          
          const result = await safeQuery(
            () => sql`
              INSERT INTO products (
                name, "nameEN", "namePT", "descriptionEN", "descriptionPT",
                price, "imageUrl", collection, category, stock, featured,
                slug, active, "createdAt", "updatedAt"
              )
              VALUES (
                ${sanitizedNameEN}, ${sanitizedNameEN}, ${sanitizedNamePT || sanitizedNameEN},
                ${sanitizedDescEN}, ${sanitizedDescPT},
                ${input.price}, ${sanitizedImageUrl}, ${sanitizedCollection},
                ${sanitizedCategory}, ${input.stock || 0}, ${input.featured || 0},
                ${slug}, 1, NOW(), NOW()
              )
              RETURNING id
            `,
            { timeoutMs: 10000, retries: 2 }
          );
          
          // Clear products cache
          clearCache('products:');
          
          return { id: result[0].id };
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number().int().positive(),
          nameEN: z.string().min(1).max(255).optional(),
          namePT: z.string().min(1).max(255).optional(),
          descriptionEN: z.string().max(5000).optional(),
          descriptionPT: z.string().max(5000).optional(),
          price: z.number().min(0).max(999999.99).optional(),
          imageUrl: z.string().url().max(500).optional(),
          collection: z.string().max(100).optional(),
          category: z.string().max(100).optional(),
          stock: z.number().min(0).max(999999).optional(),
          featured: z.number().min(0).max(1).optional(),
          active: z.number().min(0).max(1).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const { id, ...updates } = input;
          const clientIp = (ctx as Context).clientIp || 'unknown';
          
          // Sanitize and update each field individually if provided
          if (updates.nameEN !== undefined) {
            const sanitized = sanitizeString(updates.nameEN);
            await sql`UPDATE products SET name = ${sanitized}, "nameEN" = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.namePT !== undefined) {
            const sanitized = sanitizeString(updates.namePT);
            await sql`UPDATE products SET "namePT" = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.descriptionEN !== undefined) {
            const sanitized = sanitizeString(updates.descriptionEN);
            await sql`UPDATE products SET "descriptionEN" = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.descriptionPT !== undefined) {
            const sanitized = sanitizeString(updates.descriptionPT);
            await sql`UPDATE products SET "descriptionPT" = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.price !== undefined) {
            await sql`UPDATE products SET price = ${updates.price}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.imageUrl !== undefined) {
            // Validate URL
            try {
              new URL(updates.imageUrl);
              const sanitized = updates.imageUrl.slice(0, 500);
              await sql`UPDATE products SET "imageUrl" = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
            } catch (e) {
              throw new Error('Invalid image URL');
            }
          }
          if (updates.collection !== undefined) {
            const sanitized = sanitizeString(updates.collection);
            await sql`UPDATE products SET collection = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.category !== undefined) {
            const sanitized = sanitizeString(updates.category);
            await sql`UPDATE products SET category = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.stock !== undefined) {
            await sql`UPDATE products SET stock = ${updates.stock}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.featured !== undefined) {
            await sql`UPDATE products SET featured = ${updates.featured}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.active !== undefined) {
            await sql`UPDATE products SET active = ${updates.active}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          
          logSecurityEvent('PRODUCT_UPDATED', { productId: id }, clientIp);
          
          // Clear products cache
          clearCache('products:');
          
          return { success: true };
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          const clientIp = (ctx as Context).clientIp || 'unknown';
          logSecurityEvent('PRODUCT_DELETED', { productId: input.id }, clientIp);
          
          // Clear cache for products
          clearCache('products:');
          
          await safeQuery(
            () => sql`DELETE FROM products WHERE id = ${input.id}`,
            { timeoutMs: 5000, retries: 1 }
          );
          
          return { success: true };
        }),
      
      uploadImage: adminProcedure
        .input(z.object({
          fileName: z.string().min(1).max(255),
          fileData: z.string().min(1), // base64 encoded
          contentType: z.string().min(1).max(100),
        }))
        .mutation(async ({ input, ctx }) => {
          const clientIp = (ctx as Context).clientIp || 'unknown';
          
          try {
            // Validate file size (max 5MB for base64)
            // Base64 encoding increases size by ~33%, so 5MB base64 ≈ 3.75MB original
            const MAX_FILE_SIZE_BASE64 = 5 * 1024 * 1024; // 5MB
            if (input.fileData.length > MAX_FILE_SIZE_BASE64) {
              structuredLog('warn', 'File upload rejected - file too large', {
                fileName: input.fileName,
                size: input.fileData.length,
                maxSize: MAX_FILE_SIZE_BASE64,
              }, { ip: clientIp });
              throw new Error('File size exceeds maximum allowed (5MB)');
            }
            
            // Validate content type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(input.contentType.toLowerCase())) {
              structuredLog('warn', 'File upload rejected - invalid content type', {
                fileName: input.fileName,
                contentType: input.contentType,
              }, { ip: clientIp });
              throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
            }
            
            // Decode base64
            let buffer: Buffer;
            try {
              buffer = Buffer.from(input.fileData, 'base64');
            } catch (e) {
              structuredLog('error', 'File upload failed - invalid base64', {
                fileName: input.fileName,
                error: e instanceof Error ? e.message : String(e),
              }, { ip: clientIp });
              throw new Error('Invalid file data format');
            }
            
            // Validate actual buffer size (should match base64 size calculation)
            const MAX_BUFFER_SIZE = 5 * 1024 * 1024; // 5MB
            if (buffer.length > MAX_BUFFER_SIZE) {
              structuredLog('warn', 'File upload rejected - buffer too large', {
                fileName: input.fileName,
                bufferSize: buffer.length,
                maxSize: MAX_BUFFER_SIZE,
              }, { ip: clientIp });
              throw new Error('File size exceeds maximum allowed (5MB)');
            }
            
            // Generate unique filename
            const timestamp = Date.now();
            const ext = input.fileName.split('.').pop() || 'jpg';
            const sanitizedFileName = sanitizeString(input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_'));
            const key = `products/${timestamp}-${sanitizedFileName}`;
            
            // Upload to S3
            const { storagePut } = await import('../server/storage');
            const result = await storagePut(key, buffer, input.contentType);
            
            structuredLog('info', 'Image uploaded successfully', {
              fileName: input.fileName,
              key: result.key,
              url: result.url,
            }, { ip: clientIp });
            
            return { url: result.url, key: result.key };
          } catch (error) {
            structuredLog('error', 'Image upload failed', {
              fileName: input.fileName,
              error: error instanceof Error ? error.message : String(error),
            }, { ip: clientIp });
            throw error;
          }
        }),
    }),
    
    // Orders management
    orders: router({
      list: adminProcedure.query(async () => {
        const orders = await sql`
          SELECT * FROM orders ORDER BY "createdAt" DESC
        `;
        return orders;
      }),
      
      updateStatus: adminProcedure
        .input(z.object({
          id: z.number().int().positive(),
          status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        }))
        .mutation(async ({ input, ctx }) => {
          const clientIp = (ctx as Context).clientIp || 'unknown';
          logSecurityEvent('ORDER_STATUS_UPDATED', { orderId: input.id, status: input.status }, clientIp);
          await sql`
            UPDATE orders
            SET status = ${input.status}, "updatedAt" = NOW()
            WHERE id = ${input.id}
          `;
          return { success: true };
        }),
    }),
    
    // Customers management
    customers: router({
      list: adminProcedure.query(async () => {
        const users = await sql`
          SELECT 
            id, name, email, phone, address, city, state, "poBox", country,
            "emailVerified", "loginMethod", role, "createdAt", "lastSignedIn"
          FROM users
          ORDER BY "createdAt" DESC
        `;
        return users;
      }),
    }),
    
    // Coupons management
    coupons: router({
      list: adminProcedure.query(async () => {
        const coupons = await sql`
          SELECT * FROM coupons ORDER BY "createdAt" DESC
        `;
        return coupons;
      }),
      
      create: adminProcedure
        .input(z.object({
          code: z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/i),
          discountType: z.enum(['percentage', 'fixed']),
          discountValue: z.number().min(0).max(100),
          minPurchaseAmount: z.number().min(0).max(999999.99).default(0),
          maxUses: z.number().min(0).max(999999).default(0),
          active: z.number().min(0).max(1).default(1),
          validFrom: z.date().optional(),
          validUntil: z.date().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          // Sanitize coupon code (uppercase, alphanumeric + hyphens/underscores)
          const sanitizedCode = input.code.toUpperCase().replace(/[^A-Z0-9-_]/g, '');
          
          // Validate discount value based on type
          if (input.discountType === 'percentage' && input.discountValue > 100) {
            throw new Error('Percentage discount cannot exceed 100%');
          }
          
          const clientIp = (ctx as Context).clientIp || 'unknown';
          logSecurityEvent('COUPON_CREATED', { code: sanitizedCode }, clientIp);
          
          const result = await sql`
            INSERT INTO coupons (
              code, "discountType", "discountValue", "minPurchaseAmount",
              "maxUses", active, "validFrom", "validUntil", "createdAt", "updatedAt"
            )
            VALUES (
              ${sanitizedCode}, ${input.discountType}, ${input.discountValue},
              ${input.minPurchaseAmount || 0}, ${input.maxUses || 0},
              ${input.active || 1}, ${input.validFrom || null}, ${input.validUntil || null},
              NOW(), NOW()
            )
            RETURNING id
          `;
          return { id: result[0].id };
        }),
      
      update: adminProcedure
        .input(z.object({
          id: z.number().int().positive(),
          code: z.string().min(3).max(50).regex(/^[A-Z0-9-_]+$/i).optional(),
          discountType: z.enum(['percentage', 'fixed']).optional(),
          discountValue: z.number().min(0).max(100).optional(),
          minPurchaseAmount: z.number().min(0).max(999999.99).optional(),
          maxUses: z.number().min(0).max(999999).optional(),
          active: z.number().min(0).max(1).optional(),
          validUntil: z.date().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const { id, ...updates } = input;
          const clientIp = (ctx as Context).clientIp || 'unknown';
          
          // Validate discount value if provided
          if (updates.discountType === 'percentage' && updates.discountValue !== undefined && updates.discountValue > 100) {
            throw new Error('Percentage discount cannot exceed 100%');
          }
          
          // Update each field individually if provided
          if (updates.code !== undefined) {
            const sanitized = updates.code.toUpperCase().replace(/[^A-Z0-9-_]/g, '');
            await sql`UPDATE coupons SET code = ${sanitized}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.discountType !== undefined) {
            await sql`UPDATE coupons SET "discountType" = ${updates.discountType}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.discountValue !== undefined) {
            await sql`UPDATE coupons SET "discountValue" = ${updates.discountValue}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.minPurchaseAmount !== undefined) {
            await sql`UPDATE coupons SET "minPurchaseAmount" = ${updates.minPurchaseAmount}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.maxUses !== undefined) {
            await sql`UPDATE coupons SET "maxUses" = ${updates.maxUses}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.active !== undefined) {
            await sql`UPDATE coupons SET active = ${updates.active}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          if (updates.validUntil !== undefined) {
            await sql`UPDATE coupons SET "validUntil" = ${updates.validUntil}, "updatedAt" = NOW() WHERE id = ${id}`;
          }
          
          logSecurityEvent('COUPON_UPDATED', { couponId: id }, clientIp);
          
          return { success: true };
        }),
      
      delete: adminProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ input, ctx }) => {
          const clientIp = (ctx as Context).clientIp || 'unknown';
          logSecurityEvent('COUPON_DELETED', { couponId: input.id }, clientIp);
          await sql`DELETE FROM coupons WHERE id = ${input.id}`;
          return { success: true };
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;

// ============================================================================
// VERCEL HANDLER
// ============================================================================
// Helper function to create a safe Request from any input
function createSafeRequest(rawRequest: any): Request {
  // CRITICAL: This function must NEVER call any methods on the original request object.
  // We use ONLY property access (obj?.prop), never method calls (obj.method()).
  // Even checking typeof obj.method === 'function' can trigger property access that causes errors.
  
  const reqAny = rawRequest as any;
  
  // Extract URL - use only safe property access
  let url = 'https://ileala.ae';
  try {
    if (typeof rawRequest === 'string') {
      url = rawRequest;
    } else {
      url = String(reqAny?.url || reqAny?.href || url);
    }
  } catch (e) {
    // Fallback to default
  }
  
  // Extract method - use only safe property access
  const method = String(reqAny?.method || 'GET');
  
  // Create headers object safely - NEVER call methods on original headers
  const headers = new Headers();
  
  // Extract headers using ONLY Object.keys - this is the safest way
  // We never call .forEach(), .get(), or any other method on the original headers
  // CRITICAL: Even accessing reqAny?.headers might trigger property access that causes errors
  // We must wrap this in a try-catch and be extremely defensive
  try {
    // Use hasOwnProperty check first to avoid triggering getters
    if (reqAny && 'headers' in reqAny) {
      const headersObj = reqAny.headers;
      if (headersObj && typeof headersObj === 'object' && !Array.isArray(headersObj)) {
        // Use Object.keys - this is safe and doesn't call methods
        // But we must be careful - even Object.keys might trigger property access
        try {
          const keys = Object.keys(headersObj);
          for (const key of keys) {
            try {
              // Use bracket notation to avoid triggering getters
              const value = headersObj[key];
              if (typeof value === 'string') {
                headers.set(key, value);
              } else if (Array.isArray(value)) {
                for (const v of value) {
                  headers.append(key, String(v));
                }
              } else if (value != null) {
                headers.set(key, String(value));
              }
            } catch (e) {
              // Skip this header if we can't process it
            }
          }
        } catch (keysError) {
          // If Object.keys fails, skip headers extraction
          console.warn('[Vercel tRPC] Could not use Object.keys on headers:', keysError);
        }
      }
    }
  } catch (headerError) {
    console.warn('[Vercel tRPC] Could not extract headers:', headerError);
    // Continue with empty headers - this is safe
  }
  
  // Extract other properties safely - only property access, no method calls
  const body = reqAny?.body;
  const cache = reqAny?.cache;
  const credentials = reqAny?.credentials;
  const integrity = reqAny?.integrity;
  const keepalive = reqAny?.keepalive;
  const mode = reqAny?.mode;
  const redirect = reqAny?.redirect;
  const referrer = reqAny?.referrer;
  const referrerPolicy = reqAny?.referrerPolicy;
  const signal = reqAny?.signal;
  
  // Create a proper Request object
  return new Request(url, {
    method,
    headers,
    body,
    cache,
    credentials,
    integrity,
    keepalive,
    mode,
    redirect,
    referrer,
    referrerPolicy,
    signal,
  });
}

// Vercel handler - must export default
// Using Node.js runtime (nodejs20.x) to avoid Edge Runtime issues with request.headers.get
// CRITICAL: The error "at Object.handler" suggests Vercel wraps our handler in an object.
// The error happens when Vercel tries to process the handler before calling it.
// 
// SOLUTION: Use a function expression assigned to a const, then export it.
// This prevents Vercel from wrapping it in an Object.handler structure.
// CRITICAL: The error "at Object.handler" means Vercel wraps our handler in an object.
// This happens BEFORE the handler is called, so we can't catch it with try-catch.
// The solution is to ensure the handler function itself never accesses request.headers.get
// until we've created a safe Request object.

// CRITICAL: The error "at Object.handler" means Vercel wraps our handler in an object.
// The error happens at line 270 (a comment), which means it happens during module processing.
// 
// SOLUTION: Create a protected request wrapper that intercepts any access to headers.get
// BEFORE the handler is even called. This prevents Vercel's validation from failing.
function createProtectedRequest(rawReq: any): any {
  // CRITICAL: Never check instanceof Request or access headers.get directly
  // This can trigger the error before we can handle it
  
  // Create a Proxy that intercepts ALL property access
  // This prevents errors when Vercel tries to validate the handler
  return new Proxy(rawReq || {}, {
    get(target, prop) {
      // If accessing 'headers', return a safe Headers-like object IMMEDIATELY
      // Don't check anything about the original headers first
      if (prop === 'headers') {
        // Return a Headers object that ALWAYS has a get method
        // This prevents "headers.get is not a function" errors
        const headers = new Headers();
        
        // Try to extract headers from the original request safely
        // Use only property access, never method calls
        try {
          const originalHeaders = target?.headers;
          if (originalHeaders && typeof originalHeaders === 'object' && !Array.isArray(originalHeaders)) {
            // Use Object.keys to avoid calling any methods
            try {
              const keys = Object.keys(originalHeaders);
              for (const key of keys) {
                try {
                  const value = originalHeaders[key];
                  if (typeof value === 'string') {
                    headers.set(key, value);
                  } else if (Array.isArray(value)) {
                    for (const v of value) {
                      headers.append(key, String(v));
                    }
                  } else if (value != null) {
                    headers.set(key, String(value));
                  }
                } catch (e) {
                  // Skip this header
                }
              }
            } catch (e) {
              // If Object.keys fails, continue with empty headers
            }
          }
        } catch (e) {
          // If we can't extract headers, return empty Headers object
          // This is safe and won't cause errors
        }
        
        return headers;
      }
      
      // For all other properties, use safe property access
      try {
        return target?.[prop];
      } catch (e) {
        return undefined;
      }
    },
    has(target, prop) {
      // Support 'in' operator
      return prop in (target || {});
    },
    ownKeys(target) {
      // Support Object.keys
      return Object.keys(target || {});
    },
  });
}

// CRITICAL: The error "at Object.handler" means Vercel wraps our handler in an object.
// This happens when Vercel tries to inspect the handler before calling it.
// The error occurs because Vercel tries to access req.headers.get during inspection.
// SOLUTION: Use a factory function that creates the handler, preventing Vercel from inspecting it.
// CRITICAL: The handler must NEVER access req.headers.get directly - always convert to Request first.
// CRITICAL FIX: The error happens because Vercel inspects the handler before calling it.
// During inspection, it tries to access req.headers.get, which fails.
// SOLUTION: Create a completely isolated handler that never exposes the original req.
export default async function handler(req: any): Promise<Response> {
  // IMMEDIATELY wrap in try-catch to catch ANY error, including during Vercel's inspection
  try {
    // CRITICAL: Convert req to Request IMMEDIATELY using ONLY property access
    // NEVER access req.headers.get or any method on req
    let url = 'https://ileala.ae';
    let method = 'GET';
    const headers = new Headers();
    
    // Extract properties using ONLY bracket notation and typeof checks
    // This prevents Vercel from trying to call methods during inspection
    try {
      if (req && typeof req === 'object') {
        // Extract URL - use only property access
        if ('url' in req && typeof req.url === 'string') {
          url = req.url;
        } else if ('href' in req && typeof req.href === 'string') {
          url = req.href;
        }
        
        // Extract method - use only property access
        if ('method' in req && typeof req.method === 'string') {
          method = req.method;
        }
        
        // Extract headers - use ONLY Object.keys, NEVER call methods
        if ('headers' in req && req.headers && typeof req.headers === 'object' && !Array.isArray(req.headers)) {
          try {
            // Use Object.keys - this is safe and doesn't call methods
            const headerKeys = Object.keys(req.headers);
            for (const key of headerKeys) {
              try {
                const value = req.headers[key];
                if (typeof value === 'string') {
                  headers.set(key, value);
                } else if (Array.isArray(value)) {
                  for (const v of value) {
                    headers.append(key, String(v));
                  }
                } else if (value != null && value !== undefined) {
                  headers.set(key, String(value));
                }
              } catch (e) {
                // Skip this header if we can't process it
              }
            }
          } catch (e) {
            // If Object.keys fails, continue with empty headers
          }
        }
      }
    } catch (e) {
      // If extraction fails, use defaults (already set above)
    }
    
    // Create a completely new Request object from extracted values
    // This ensures no reference to the original req remains
    const validRequest = new Request(url, {
      method,
      headers, // Fresh Headers object with no reference to original
      body: req?.body,
      cache: req?.cache,
      credentials: req?.credentials,
      integrity: req?.integrity,
      keepalive: req?.keepalive,
      mode: req?.mode,
      redirect: req?.redirect,
      referrer: req?.referrer,
      referrerPolicy: req?.referrerPolicy,
      signal: req?.signal,
    });
    
    // Now process with the completely isolated request
    return await handleRequest(validRequest);
  } catch (error) {
    // Log the error with full details
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack';
    
    console.error('[Vercel tRPC] Error in handler:', errorMessage);
    console.error('[Vercel tRPC] Error stack:', errorStack);
    console.error('[Vercel tRPC] Request type:', typeof req);
    console.error('[Vercel tRPC] Request keys:', req ? Object.keys(req).slice(0, 10) : 'null');
    
    // Return a proper error response in tRPC batch format
    return new Response(
      JSON.stringify([
        {
          error: {
            message: errorMessage.includes('headers.get') 
              ? 'Request headers are not accessible in the expected format'
              : 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
            data: {
              code: 'INTERNAL_SERVER_ERROR',
              httpStatus: 500,
            },
          },
        },
      ]),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleRequest(request: any): Promise<Response> {
  // CRITICAL: Wrap everything in try-catch to ensure we ALWAYS return JSON
  // Even if there's an error, we must return a JSON response, not HTML
  try {
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
  // Extract client IP for security logging and rate limiting
  const forwardedFor = validRequest.headers.get('x-forwarded-for');
  const realIp = validRequest.headers.get('x-real-ip');
  const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
  
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
    clientIp,
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
    
    // CRITICAL: Create a completely new Request object with fresh Headers
    // This ensures no reference to the original request object remains
    // Extract all header values first to create a completely new Headers object
    const finalHeaders = new Headers();
    try {
      // Use forEach safely - validRequest is already a proper Request object
      validRequest.headers.forEach((value, key) => {
        finalHeaders.set(key, value);
      });
    } catch (e) {
      // If forEach fails, try to extract headers manually
      try {
        const headerEntries = Array.from(validRequest.headers.entries());
        for (const [key, value] of headerEntries) {
          finalHeaders.set(key, value);
        }
      } catch (e2) {
        // If all else fails, continue with empty headers
        structuredLog('warn', 'Could not extract headers for final request', { error: e instanceof Error ? e.message : String(e) });
      }
    }
    
    // Create a completely isolated Request object
    // This prevents any access to the original request's headers.get method
    // CRITICAL: Create Request from scratch with only primitive values
    const finalRequest = new Request(validRequest.url, {
      method: validRequest.method,
      headers: finalHeaders, // Use the new Headers object, not the original
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
    
    // Verify the final request is completely isolated
    if (typeof finalRequest.headers.get !== 'function') {
      structuredLog('error', 'Final request headers.get is not a function', {
        headersType: typeof finalRequest.headers,
        isHeaders: finalRequest.headers instanceof Headers,
      });
      throw new Error('Failed to create valid Request object');
    }
    
    let response: Response;
    try {
      // Create context function with explicit return type
      // This ensures TypeScript recognizes the Context type in procedures
      const createContext = (): Context => {
        // Return the context object with explicit type
        // CRITICAL: Type assertion to ensure TypeScript recognizes all properties
        return {
          user: ctx.user,
          clientIp: ctx.clientIp,
          setCookie: ctx.setCookie,
          clearCookie: ctx.clearCookie,
        } as Context;
      };
      
      response = await fetchRequestHandler({
      endpoint: '/api/trpc',
        req: finalRequest,
      router: appRouter,
        createContext,
        onError: ({ error, path, type }) => {
          console.error('[Vercel tRPC] Error in handler:', {
            error: error.message,
            path,
            type,
            stack: error.stack,
          });
        },
      });
    } catch (handlerError) {
      // If fetchRequestHandler throws an error, return a JSON error response
      console.error('[Vercel tRPC] fetchRequestHandler threw error:', handlerError);
      return new Response(
        JSON.stringify([
          {
            error: {
              message: 'Internal server error',
              code: 'INTERNAL_SERVER_ERROR',
              data: {
                code: 'INTERNAL_SERVER_ERROR',
                httpStatus: 500,
              },
            },
          },
        ]),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Ensure response is JSON - check status and content type
    const contentType = response.headers.get('content-type') || '';
    const isErrorStatus = response.status >= 400;
    
    if (isErrorStatus && !contentType.includes('application/json')) {
      // Clone response before reading to avoid consuming body
      const clonedResponse = response.clone();
      const text = await clonedResponse.text().catch(() => 'Unknown error');
      console.error('[Vercel tRPC] Non-JSON error response received:', text.substring(0, 200));
      
      // Return JSON error in tRPC batch format
      return new Response(
        JSON.stringify([
          {
            error: {
              message: text.includes('server error') || text.includes('Server Error') 
                ? 'A server error occurred. Please try again later.'
                : 'An unexpected error occurred',
              code: 'INTERNAL_SERVER_ERROR',
              data: {
                code: 'INTERNAL_SERVER_ERROR',
                httpStatus: response.status || 500,
              },
            },
          },
        ]),
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
    
    // CRITICAL: Always return JSON, never HTML
    // Return in tRPC batch format to ensure client can parse it
    return new Response(
      JSON.stringify([
        {
          error: {
            message: error instanceof Error ? error.message : 'Internal server error',
            code: 'INTERNAL_SERVER_ERROR',
            data: {
              code: 'INTERNAL_SERVER_ERROR',
              httpStatus: 500,
            },
          },
        },
      ]),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

