import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from 'stripe';
// Use Cloudinary if configured, otherwise fall back to AWS S3
import { storagePut as cloudinaryPut } from './storage-cloudinary';
import { storagePut as s3Put } from './storage';

// Debug logging - only log in development or when DEBUG=true
const DEBUG = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
const debugLog = (...args: any[]) => DEBUG && console.log(...args);

// Smart storage selection based on available credentials
async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  // Check if Cloudinary is configured
  const hasCloudinary = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  // Check if AWS is configured
  const hasAWS = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );

  debugLog('[Storage] Selecting storage provider:', { hasCloudinary, hasAWS });

  // Prefer Cloudinary if configured
  if (hasCloudinary) {
    return cloudinaryPut(relKey, data, contentType);
  }

  // Fall back to AWS S3
  if (hasAWS) {
    return s3Put(relKey, data, contentType);
  }

  throw new Error('No storage provider configured. Please set either CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/AWS_S3_BUCKET in your environment variables.');
}
import { checkRateLimit, recordFailedAttempt, clearRateLimit, getClientIp } from './rate-limiter';
import { createAuditLogger } from './audit-logger';
import { recordLoginAttempt } from './login-notifications';
import { getActiveSessions, terminateAllSessions, terminateSession } from './session-manager';
import { validateUpload, validateImageBuffer, sanitizeFilename, generateSafeFilename } from './upload-validator';
import { generate2FASecret, generate2FAQRCode, verify2FAToken, generateBackupCodes, verifyBackupCode, is2FAEnabled } from './two-factor';
import { sdk } from "./_core/sdk";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  addressSchema,
  citySchema,
  stateSchema,
  countrySchema,
  poBoxSchema,
  couponCodeSchema,
  quantitySchema,
  orderTotalSchema,
} from "./_core/validation";
import { getCached, setCached, invalidateCache, CacheKeys } from "./_core/cache";
import { ENV } from "./_core/env";

// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-10-29.clover' })
  : null;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  user: router({
    /**
     * ROTA DE LOGIN DE EMERGÊNCIA (LEGADA)
     *
     * IMPORTANTE: Esta rota existe para compatibilidade com código antigo.
     * A rota principal de login é `auth.login` (veja abaixo).
     *
     * CREDENCIAIS DE EMERGÊNCIA:
     *   Configure via variáveis de ambiente no Railway:
     *   - EMERGENCY_ADMIN_EMAIL
     *   - EMERGENCY_ADMIN_PASSWORD
     */
    login: publicProcedure
      .input(z.object({
        email: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // Check emergency credentials from environment variables (not hardcoded)
        const emergencyEmail = ENV.emergencyAdminEmail;
        const emergencyPassword = ENV.emergencyAdminPassword;

        if (emergencyEmail && emergencyPassword && email === emergencyEmail && password === emergencyPassword) {
          const sessionData = JSON.stringify({
            id: 'emergency-admin-001',
            email: emergencyEmail,
            name: 'Emergency Admin',
            role: 'admin',
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionData, cookieOptions);

          return {
            success: true,
            user: {
              id: 'emergency-admin-001',
              email: emergencyEmail,
              name: 'Emergency Admin',
              role: 'admin'
            }
          };
        }

        throw new Error('Invalid credentials');
      }),
  }),
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;

      // For emergency login sessions, the id might be a string like "emergency-admin-001"
      // In that case, use email to fetch user data instead
      let userData = null;
      if (typeof ctx.user.id === 'number') {
        userData = await db.getUserById(ctx.user.id);
      } else if (ctx.user.email) {
        // Emergency login or session with string ID - use email
        userData = await db.getUserByEmail(ctx.user.email);
      }

      return {
        ...ctx.user,
        // Use userData if available, otherwise fall back to ctx.user data
        id: userData?.id ?? ctx.user.id,
        twoFactorEnabled: userData?.twoFactorEnabled === 1,
      };
    }),
    
    /**
     * ROTA PRINCIPAL DE LOGIN
     *
     * CREDENCIAIS DE EMERGÊNCIA:
     *   Configure via variáveis de ambiente no Railway:
     *   - EMERGENCY_ADMIN_EMAIL
     *   - EMERGENCY_ADMIN_PASSWORD
     */
    login: publicProcedure
      .input(z.object({
        email: emailSchema,
        password: z.string().min(1, 'Password is required'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // Check rate limit before processing login
        const clientIp = getClientIp(ctx.req.headers);
        const rateLimit = checkRateLimit(clientIp);

        if (rateLimit.isBlocked) {
          throw new Error(rateLimit.message || 'Too many login attempts. Please try again later.');
        }

        // Check emergency credentials from environment variables
        const emergencyEmail = ENV.emergencyAdminEmail;
        const emergencyPassword = ENV.emergencyAdminPassword;

        if (emergencyEmail && emergencyPassword && email === emergencyEmail && password === emergencyPassword) {
          // Check if user exists in database and has 2FA enabled
          const emergencyUser = await db.getUserByEmail(emergencyEmail);

          if (emergencyUser) {
            const is2FAEnabled = emergencyUser.twoFactorEnabled == 1 || emergencyUser.twoFactorEnabled === true;

            if (is2FAEnabled) {
              const tokenData = {
                userId: emergencyUser.id,
                email: emergencyUser.email,
                timestamp: Date.now(),
                isEmergency: true,
              };
              const tempToken = Buffer.from(JSON.stringify(tokenData)).toString('base64');

              return {
                success: true,
                requires2FA: true,
                tempToken,
                message: '2FA verification required',
              };
            }
          }

          // No 2FA required - proceed with emergency login
          const sessionData = JSON.stringify({
            id: emergencyUser?.id || 'emergency-admin-001',
            email: emergencyEmail,
            name: 'Emergency Admin',
            role: 'admin',
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionData, cookieOptions);

          clearRateLimit(clientIp);

          recordLoginAttempt({
            userId: emergencyUser?.id || 1,
            email: emergencyEmail,
            ip: clientIp,
            userAgent: ctx.req.headers['user-agent'],
            success: true,
          }).catch(() => { /* Silent fail */ });

          return {
            success: true,
            user: {
              id: emergencyUser?.id || 'emergency-admin-001',
              email: emergencyEmail,
              name: 'Emergency Admin',
              role: 'admin',
            }
          };
        }

        // Verify credentials
        const user = await db.verifyUserCredentials(email, password);

        if (!user) {
          // Record failed attempt for rate limiting
          recordFailedAttempt(clientIp);

          // Try to get user ID for failed login tracking
          const failedUser = await db.getUserByEmail(email);
          if (failedUser) {
            recordLoginAttempt({
              userId: failedUser.id,
              email: email,
              ip: clientIp,
              userAgent: ctx.req.headers['user-agent'],
              success: false,
              failureReason: 'Invalid password',
            }).catch(() => { /* Silent fail */ });
          }

          throw new Error('Invalid email or password');
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
        }
                // Clear rate limit on successful login
        clearRateLimit(clientIp);

        // Check if 2FA is enabled for this user
        // Check if 2FA is enabled (handle both number and string from database)
        const is2FAEnabled = user.twoFactorEnabled == 1 || user.twoFactorEnabled === true;

        if (is2FAEnabled) {
          // Don't create session yet - require 2FA verification first
          
          // Create a temporary token to identify this login attempt
          const tempToken = Buffer.from(JSON.stringify({
            userId: user.id,
            email: user.email,
            timestamp: Date.now(),
          })).toString('base64');
          
          return {
            success: true,
            requires2FA: true,
            tempToken,
            message: '2FA verification required',
          };
        }

        // Update last signed in
        await db.updateUser(user.id, {
          lastSignedIn: new Date(),
        });

        // Create session data for traditional email/password login
        const sessionData = {
          id: user.id,
          email: user.email,
          name: user.name || null,
          role: user.role || 'user',
          loginMethod: 'email',
        };

        // Set cookie with JSON session data
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const finalCookieOptions = {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        };
        
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), finalCookieOptions);

        // Record successful login
        recordLoginAttempt({
          userId: user.id,
          email: user.email,
          ip: clientIp,
          userAgent: ctx.req.headers['user-agent'],
          success: true,
        }).catch(() => { /* Silent fail for login recording */ });

        return { 
          success: true, 
          user: {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: user.role || 'user',
          }
        };
      }),
    register: publicProcedure
      .input(z.object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        phone: phoneSchema,
        address: addressSchema,
        city: citySchema,
        state: stateSchema,
        poBox: poBoxSchema,
        country: countrySchema,
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user already exists
        const existingUser = await db.getUserByEmail(input.email);
        
        if (existingUser) {
          throw new Error('User with this email already exists');
        }
        
        // Create user
        const userId = await db.createUser({
          email: input.email,
          name: input.name,
          password: input.password,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          poBox: input.poBox,
          country: input.country,
        });
        
        // Get created user
        const user = await db.getUserById(userId);
        
        if (!user) {
          throw new Error('Failed to create user');
        }
        
        // Generate email verification token
        const token = await db.generateEmailVerificationToken(user.id);

        // Send verification email
        const { sendVerificationEmail } = await import('./email');
        await sendVerificationEmail(user.email, token, user.name || 'Customer');

        // DO NOT auto-login - require email verification first
        return {
          success: true,
          requiresVerification: true,
          message: 'Account created! Please check your email to verify your account before logging in.',
        };
      }),
    verifyEmail: publicProcedure
      .input(z.object({
        token: z.string(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.verifyEmailToken(input.token);

        if (!user) {
          throw new Error('Invalid or expired verification token');
        }

        // Send welcome email after successful verification
        try {
          const { sendWelcomeEmail } = await import('./email');
          await sendWelcomeEmail(user.email, user.name || 'Customer');
        } catch {
          // Don't fail verification if welcome email fails
        }

        return { success: true, user: { id: user.id, email: user.email } };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);

      // Clear cookie with all necessary options to ensure it's properly removed
      // Must match the options used when setting the cookie
      ctx.res.clearCookie(COOKIE_NAME, {
        ...cookieOptions,
        maxAge: 0,
      });

      // Also try to clear with explicit domain for cross-subdomain cookies
      if (process.env.NODE_ENV === 'production') {
        ctx.res.clearCookie(COOKIE_NAME, {
          httpOnly: true,
          path: '/',
          sameSite: 'none',
          secure: true,
          domain: '.ileala.ae',
          maxAge: 0,
        });
        // Also try without domain in case cookie was set differently
        ctx.res.clearCookie(COOKIE_NAME, {
          httpOnly: true,
          path: '/',
          sameSite: 'lax',
          secure: true,
          maxAge: 0,
        });
      }

      return {
        success: true,
      } as const;
    }),

    // Update profile
    updateProfile: protectedProcedure
      .input(z.object({
        name: nameSchema.optional(),
        phone: phoneSchema.optional(),
        address: addressSchema.optional(),
        city: citySchema.optional(),
        state: stateSchema.optional(),
        poBox: poBoxSchema.optional(),
        country: countrySchema.optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }

        // Filter out undefined values
        const updates: Record<string, any> = {};
        if (input.name !== undefined) updates.name = input.name;
        if (input.phone !== undefined) updates.phone = input.phone;
        if (input.address !== undefined) updates.address = input.address;
        if (input.city !== undefined) updates.city = input.city;
        if (input.state !== undefined) updates.state = input.state;
        if (input.poBox !== undefined) updates.poBox = input.poBox;
        if (input.country !== undefined) updates.country = input.country;

        await db.updateUser(ctx.user.id, updates);

        return { success: true };
      }),

    // Change password
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error('Not authenticated');
        }

        // Get user with password
        const user = await db.getUserById(ctx.user.id);
        if (!user || !user.password) {
          throw new Error('User not found or no password set');
        }

        // Verify current password
        const bcrypt = await import('bcryptjs');
        const isValidPassword = await bcrypt.compare(input.currentPassword, user.password);
        if (!isValidPassword) {
          throw new Error('Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        // Update password in database
        await db.updateUserPassword(ctx.user.id, hashedPassword);

        return { success: true };
      }),

    // Verify 2FA during login
    verify2FALogin: publicProcedure
      .input(z.object({
        tempToken: z.string(),
        code: z.string().min(6).max(9), // Accept 6-digit TOTP or 8-char backup code (with optional hyphen)
      }))
      .mutation(async ({ input, ctx }) => {
        // Decode temp token
        let tokenData;
        try {
          tokenData = JSON.parse(Buffer.from(input.tempToken, 'base64').toString());
        } catch (error) {
          throw new Error('Invalid token');
        }
        
        // Check if token is expired (5 minutes)
        if (Date.now() - tokenData.timestamp > 5 * 60 * 1000) {
          throw new Error('Token expired. Please login again.');
        }
        
        // Get user data
        const user = await db.getUserById(tokenData.userId);
        if (!user || !user.twoFactorSecret) {
          throw new Error('Invalid user or 2FA not configured');
        }
        
        // Verify 2FA code
        const isValid = verify2FAToken(input.code, user.twoFactorSecret);
        if (!isValid) {
          // Try backup codes
          const backupResult = verifyBackupCode(input.code, user.twoFactorBackupCodes);
          if (!backupResult.valid) {
            throw new Error('Invalid verification code');
          }
          
          // Update backup codes if one was used
          if (backupResult.remainingCodes) {
            await db.updateUser(user.id, {
              twoFactorBackupCodes: JSON.stringify(backupResult.remainingCodes),
            });
          }
        }
        
        // Update last signed in
        await db.updateUser(user.id, {
          lastSignedIn: new Date(),
        });
        
        // Create session
        const sessionData = {
          id: user.id,
          email: user.email,
          name: user.name || null,
          role: user.role || 'user',
          loginMethod: 'email',
        };
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const finalCookieOptions = {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        };
        
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), finalCookieOptions);
        
        // Record successful login
        const clientIp = getClientIp(ctx.req.headers);
        recordLoginAttempt({
          userId: user.id,
          email: user.email,
          ip: clientIp,
          userAgent: ctx.req.headers['user-agent'],
          success: true,
        }).catch(() => { /* Silent fail */ });
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: user.role || 'user',
          },
        };
      }),
    
    // 2FA endpoints
    setup2FA: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      // Generate new secret
      const secret = generate2FASecret();
      
      // Generate QR code
      const qrCode = await generate2FAQRCode(ctx.user.email, secret);
      
      // Return secret and QR code (don't save yet - wait for verification)
      return {
        secret,
        qrCode,
      };
    }),
    
    enable2FA: protectedProcedure
      .input(z.object({
        secret: z.string(),
        token: z.string().length(6),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        
        // Verify the token before enabling
        const valid = verify2FAToken(input.token, input.secret);
        if (!valid) {
          throw new Error('Invalid verification code');
        }
        
        // Generate backup codes
        const backupCodes = generateBackupCodes();
        
        // Save to database
        await db.enable2FA(ctx.user.id, input.secret, JSON.stringify(backupCodes));
        
        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'update',
          entity: 'user_security',
          entityId: ctx.user.id,
          metadata: { action: '2fa_enabled' },
        });
        
        return {
          success: true,
          backupCodes,
        };
      }),
    
    disable2FA: protectedProcedure
      .input(z.object({
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        
        // Verify password before disabling
        const user = await db.getUserById(ctx.user.id);
        if (!user || !user.password) {
          throw new Error('User not found');
        }
        
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(input.password, user.password);
        if (!valid) {
          throw new Error('Invalid password');
        }
        
        // Disable 2FA
        await db.disable2FA(ctx.user.id);
        
        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'update',
          entity: 'user_security',
          entityId: ctx.user.id,
          metadata: { action: '2fa_disabled' },
        });
        
        return { success: true };
      }),
    
    verify2FA: publicProcedure
      .input(z.object({
        email: z.string().email(),
        token: z.string(),
        isBackupCode: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new Error('User not found');
        }
        
        if (!is2FAEnabled(user)) {
          throw new Error('2FA is not enabled for this user');
        }
        
        let valid = false;
        
        if (input.isBackupCode) {
          // Verify backup code
          const result = verifyBackupCode(input.token, user.twoFactorBackupCodes);
          valid = result.valid;
          
          if (valid && result.remainingCodes) {
            // Update backup codes (remove used one)
            await db.updateBackupCodes(user.id, JSON.stringify(result.remainingCodes));
          }
        } else {
          // Verify TOTP token
          valid = verify2FAToken(input.token, user.twoFactorSecret!);
        }
        
        if (!valid) {
          throw new Error('Invalid verification code');
        }
        
        // Create session
        const sessionData = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: user.role || 'user',
          }
        };
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionData, cookieOptions);
        
        // Update last signed in
        await db.updateLastSignedIn(user.id);
        
        return {
          success: true,
          user: sessionData.user,
        };
      }),
    
    // Session management endpoints
    getActiveSessions: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');

      try {
        const sessions = await getActiveSessions(ctx.user.id);

        // Ensure sessions is always an array
        const safeSessions = Array.isArray(sessions) ? sessions : [];

        return {
          sessions: safeSessions.map(session => ({
            id: session.id,
            sessionToken: session.sessionToken,
            ip: session.ip || 'Unknown',
            deviceType: session.deviceType || 'Unknown',
            browser: session.browser || 'Unknown',
            os: session.os || 'Unknown',
            lastActivityAt: session.lastActivity || new Date(),
            createdAt: session.createdAt,
          })),
        };
      } catch {
        // Return empty sessions instead of throwing
        return { sessions: [] };
      }
    }),
    
    terminateSession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        
        // Get the session to verify it belongs to the user
        const sessions = await getActiveSessions(ctx.user.id);
        const session = sessions.find(s => s.id === input.sessionId);
        
        if (!session) {
          throw new Error('Session not found');
        }
        
        await terminateSession(session.sessionToken);
        
        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'delete',
          entity: 'user_session',
          entityId: input.sessionId,
          metadata: { action: 'session_terminated' },
        });
        
        return { success: true };
      }),
    
    terminateAllSessions: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      
      await terminateAllSessions(ctx.user.id);
      
      // Audit log
      const audit = createAuditLogger(ctx);
      await audit.log({
        action: 'delete',
        entity: 'user_session',
        entityId: ctx.user.id,
        metadata: { action: 'all_sessions_terminated' },
      });
      
      // Clear current session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      
      return { success: true };
    }),
    
    // Get audit logs (admin only)
    getAuditLogs: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getAuditLogs(input.limit, input.offset);
      }),
    
    // Get login history (admin only)
    getLoginHistory: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        days: z.number().optional().default(30),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

        if (input.userId) {
          return await db.getRecentLoginHistory(input.userId, input.days);
        }

        // Get all login history (last N days)
        return await db.getAllLoginHistory(input.days);
      }),

    // Forgot password - request password reset
    forgotPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email);

        if (!user) {
          // Por segurança, não revelamos se o email existe ou não
          // Retornamos sucesso de qualquer forma
          return {
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
          };
        }

        try {
          // Gerar token de reset de senha
          const token = await db.generatePasswordResetToken(user.id);

          // Enviar email de reset
          const { sendPasswordResetEmail } = await import('./email');
          await sendPasswordResetEmail(user.email, token, user.name || 'Customer');

          return {
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.'
          };
        } catch {
          throw new Error('Failed to send password reset email. Please try again later.');
        }
      }),

    // Reset password with token
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
      }))
      .mutation(async ({ input }) => {
        // Verificar token e obter usuário
        const user = await db.verifyPasswordResetToken(input.token);

        if (!user) {
          throw new Error('Invalid or expired reset link. Please request a new password reset.');
        }

        try {
          // Hash nova senha
          const bcrypt = await import('bcrypt');
          const hashedPassword = await bcrypt.hash(input.newPassword, 10);

          // Atualizar senha no banco
          await db.updateUserPassword(user.id, hashedPassword);

          // Invalidar o token
          await db.invalidatePasswordResetToken(input.token);

          return { success: true, message: 'Password updated successfully. You can now sign in with your new password.' };
        } catch {
          throw new Error('Failed to reset password. Please try again.');
        }
      }),
  }),

  // Newsletter router
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: emailSchema,
        name: nameSchema.optional(),
      }))
      .mutation(async ({ input }) => {
        await db.subscribeToNewsletter(input.email, input.name);
        
        // Send confirmation email
        try {
          const { sendNewsletterConfirmationEmail } = await import('./email');
          await sendNewsletterConfirmationEmail(input.email, input.name);
        } catch (error) {
          // Error already logged by email service
          // Don't fail the subscription if email fails
        }
        
        return { success: true };
      }),
    list: protectedProcedure
      .input(z.object({
        activeOnly: z.boolean().default(true),
      }).optional())
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const subscribers = await db.getAllNewsletterSubscribers(input?.activeOnly ?? true);
        // Return subscribers as-is (id is UUID string in the database)
        return subscribers;
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.getNewsletterStats();
    }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        await db.deleteNewsletterSubscriber(input.id);
        return { success: true };
      }),
  }),

  // Email Campaigns router (Marketing)
  emailCampaigns: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.getEmailCampaigns();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getEmailCampaignById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        subject: z.string().min(1, 'Subject is required'),
        content: z.string().min(1, 'Content is required'),
        recipientType: z.enum(['newsletter', 'all_customers', 'specific']),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

        const campaign = await db.createEmailCampaign({
          subject: input.subject,
          content: input.content,
          recipientType: input.recipientType,
          status: 'draft',
          sentBy: ctx.user.id,
        });

        return campaign;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        subject: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        recipientType: z.enum(['newsletter', 'all_customers', 'specific']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

        const { id, ...updates } = input;
        return await db.updateEmailCampaign(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        await db.deleteEmailCampaign(input.id);
        return { success: true };
      }),

    getRecipientCount: protectedProcedure
      .input(z.object({
        recipientType: z.enum(['newsletter', 'all_customers']),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const recipients = await db.getEmailRecipients(input.recipientType);
        return { count: recipients.length };
      }),

    getRecipientsList: protectedProcedure
      .input(z.object({
        recipientType: z.enum(['newsletter', 'all_customers']),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const recipients = await db.getEmailRecipients(input.recipientType);
        return { recipients, count: recipients.length };
      }),

    send: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

        const campaign = await db.getEmailCampaignById(input.id);
        if (!campaign) throw new Error('Campaign not found');
        if (campaign.status === 'sent') throw new Error('Campaign already sent');

        // Get recipients
        const recipients = await db.getEmailRecipients(campaign.recipientType);
        if (recipients.length === 0) {
          throw new Error('No recipients found for this campaign');
        }

        // Update campaign status to sending
        await db.updateEmailCampaign(input.id, {
          status: 'sending',
          recipientCount: recipients.length,
        });

        // Send emails (in background-style, but we'll track progress)
        const { sendCampaignEmail } = await import('./email');
        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of recipients) {
          try {
            const success = await sendCampaignEmail(
              recipient.email,
              recipient.name,
              campaign.subject,
              campaign.content
            );
            if (success) {
              sentCount++;
            } else {
              failedCount++;
            }
          } catch {
            failedCount++;
          }

          // Small delay to avoid rate limiting (100ms between emails)
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Update campaign with final stats
        await db.updateEmailCampaign(input.id, {
          status: 'sent',
          sentCount,
          failedCount,
          sentAt: new Date(),
        });

        return {
          success: true,
          sentCount,
          failedCount,
          totalRecipients: recipients.length,
        };
      }),
  }),

  // Products router
  products: router({
    list: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.products();
      const cached = getCached(cacheKey);
      if (cached) {
        debugLog('[Products API] Returning cached products:', cached.length);
        return cached;
      }

      const products = await db.getAllProducts();
      debugLog('[Products API] Fetched from database:', products.length);

      setCached(cacheKey, products, 5 * 60 * 1000); // 5 minutes
      return products;
    }),
    featured: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.featuredProducts();
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const products = await db.getFeaturedProducts();
      setCached(cacheKey, products, 10 * 60 * 1000); // 10 minutes
      return products;
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const cacheKey = CacheKeys.product(input.id);
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const product = await db.getProductById(input.id);
        if (product) {
          setCached(cacheKey, product, 10 * 60 * 1000); // 10 minutes
        }
        return product;
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const cacheKey = CacheKeys.productBySlug(input.slug);
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const product = await db.getProductBySlug(input.slug);
        if (product) {
          setCached(cacheKey, product, 10 * 60 * 1000); // 10 minutes
        }
        return product;
      }),
    byCollection: publicProcedure
      .input(z.object({ collection: z.string() }))
      .query(async ({ input }) => {
        const cacheKey = CacheKeys.products(`collection:${input.collection}`);
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const products = await db.getProductsByCollection(input.collection);
        setCached(cacheKey, products, 5 * 60 * 1000); // 5 minutes
        return products;
      }),
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        const cacheKey = CacheKeys.products(`category:${input.category}`);
        const cached = getCached(cacheKey);
        if (cached) return cached;
        
        const products = await db.getProductsByCategory(input.category);
        setCached(cacheKey, products, 5 * 60 * 1000); // 5 minutes
        return products;
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        nameEN: z.string(),
        namePT: z.string(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        price: z.number(),
        imageUrl: z.string().optional(),
        collection: z.string().optional(),
        category: z.string().optional(),
        stock: z.number().default(0),
        featured: z.number().default(0),
        active: z.number().default(1), // Default to active = 1
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can create products
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        // Ensure active is always 1 for new products
        const productData = {
          ...input,
          active: input.active ?? 1, // Default to 1 if not provided
        };
        
        debugLog('[Admin] Creating product:', productData.name);

        const productId = await db.createProduct(productData);

        // Invalidate product caches to ensure new product appears immediately
        invalidateCache(CacheKeys.products());
        invalidateCache(CacheKeys.featuredProducts());
        if (input.collection) {
          invalidateCache(CacheKeys.products(`collection:${input.collection}`));
        }
        if (input.category) {
          invalidateCache(CacheKeys.products(`category:${input.category}`));
        }

        // Return the created product for confirmation
        const createdProduct = await db.getProductById(productId);
        
        return createdProduct || { id: productId };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          nameEN: z.string().optional(),
          namePT: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionPT: z.string().optional(),
          descriptionEN_full: z.string().optional(),
          descriptionPT_full: z.string().optional(),
          price: z.number().optional(),
          salePrice: z.number().optional(),
          imageUrl: z.string().optional(),
          mainImage: z.string().optional(),
          mainImageAlt: z.string().optional(),
          images: z.string().optional(),
          collection: z.string().optional(),
          category: z.string().optional(),
          stock: z.number().optional(),
          material: z.string().optional(),
          dimensions: z.string().optional(),
          colors: z.string().optional(),
          careInstructionsEN: z.string().optional(),
          careInstructionsPT: z.string().optional(),
          weight: z.number().optional(),
          sku: z.string().optional(),
          inStock: z.boolean().optional(),
          stockQuantity: z.number().optional(),
          featured: z.number().optional(),
          active: z.number().optional(), // Allow updating active status
          isNew: z.boolean().optional(),
          onSale: z.boolean().optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (ctx.user?.role !== 'admin') {
            throw new Error('Unauthorized');
          }
          
          debugLog('[Admin] Updating product:', input.id);

          // Clean up the data - remove undefined values
          const cleanData: Record<string, any> = {};
          for (const [key, value] of Object.entries(input.data)) {
            if (value !== undefined) {
              cleanData[key] = value;
            }
          }
          
          await db.updateProduct(input.id, cleanData);

          // Invalidate product caches
          invalidateCache(CacheKeys.product(input.id));
          invalidateCache(CacheKeys.products());
          invalidateCache(CacheKeys.featuredProducts());
          if (input.data.collection) {
            invalidateCache(CacheKeys.products(`collection:${input.data.collection}`));
          }
          if (input.data.category) {
            invalidateCache(CacheKeys.products(`category:${input.data.category}`));
          }
          
          return { success: true };
        } catch (error) {
          throw error;
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        await db.deleteProduct(input.id);
        // Invalidate product caches
        invalidateCache(CacheKeys.product(input.id));
        invalidateCache(CacheKeys.products());
        invalidateCache(CacheKeys.featuredProducts());
        return { success: true };
      }),
  }),

  // Cart router
  cart: router({
    items: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      return await db.getCartItems(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({
        productId: z.number().int().positive('Product ID must be a positive number'),
        quantity: quantitySchema,
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        return await db.addToCart(ctx.user.id, input.productId, input.quantity);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive('Cart item ID must be a positive number'),
        quantity: z.number().int().min(0, 'Quantity cannot be negative').max(1000, 'Quantity cannot exceed 1000'),
      }))
      .mutation(async ({ input }) => {
        if (input.quantity === 0) {
          await db.removeFromCart(input.id);
        } else {
          await db.updateCartItem(input.id, input.quantity);
        }
        return { success: true };
      }),
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.id);
        return { success: true };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Wishlist router
  wishlist: router({
    items: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      return await db.getWishlistItems(ctx.user.id);
    }),
    add: protectedProcedure
      .input(z.object({
        productId: z.number().int().positive('Product ID must be a positive number'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        return await db.addToWishlist(ctx.user.id, input.productId);
      }),
    remove: protectedProcedure
      .input(z.object({
        productId: z.number().int().positive('Product ID must be a positive number'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        await db.removeFromWishlist(ctx.user.id, input.productId);
        return { success: true };
      }),
    toggle: protectedProcedure
      .input(z.object({
        productId: z.number().int().positive('Product ID must be a positive number'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        const isInWishlist = await db.isInWishlist(ctx.user.id, input.productId);
        if (isInWishlist) {
          await db.removeFromWishlist(ctx.user.id, input.productId);
          return { added: false };
        } else {
          await db.addToWishlist(ctx.user.id, input.productId);
          return { added: true };
        }
      }),
    check: protectedProcedure
      .input(z.object({
        productId: z.number().int().positive('Product ID must be a positive number'),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user) return { isInWishlist: false };
        const isInWishlist = await db.isInWishlist(ctx.user.id, input.productId);
        return { isInWishlist };
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      await db.clearWishlist(ctx.user.id);
      return { success: true };
    }),
  }),

  // Coupons router
  coupons: router({
    validate: publicProcedure
      .input(z.object({
        code: couponCodeSchema,
        orderTotal: orderTotalSchema,
      }))
      .mutation(async ({ input }) => {
        const validation = await db.validateCoupon(input.code, input.orderTotal);

        if (!validation.valid) {
          return {
            valid: false,
            message: validation.message,
            discount: 0,
          };
        }

        const discount = await db.calculateDiscount(validation.coupon!, input.orderTotal);

        return {
          valid: true,
          discount,
          coupon: validation.coupon,
        };
      }),
    // Get the active coupon for the welcome popup
    getPopupCoupon: publicProcedure.query(async () => {
      return await db.getPopupCoupon();
    }),
  }),

  // Gift Cards router
  giftCards: router({
    // Validate gift card for checkout (similar to coupon)
    validate: publicProcedure
      .input(z.object({
        code: z.string().min(10, 'Gift card code must be at least 10 characters'),
      }))
      .query(async ({ input }) => {
        const validation = await db.validateGiftCard(input.code);
        return validation;
      }),

    // Apply gift card to an order
    redeem: protectedProcedure
      .input(z.object({
        code: z.string().min(10),
        orderId: z.number(),
        amount: z.number().min(1), // Amount in fils to apply
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');

        const result = await db.applyGiftCard(input.code, input.amount, input.orderId);
        return result;
      }),

    // Get gift card balance by code (for checkout display)
    getBalance: publicProcedure
      .input(z.object({
        code: z.string().min(10),
      }))
      .query(async ({ input }) => {
        const giftCard = await db.getGiftCardByCode(input.code);
        if (!giftCard) {
          return { found: false, balance: 0 };
        }
        if (giftCard.status !== 'active') {
          return { found: true, balance: 0, status: giftCard.status };
        }
        return {
          found: true,
          balance: giftCard.balanceRemaining,
          status: giftCard.status,
          validUntil: giftCard.validUntil,
        };
      }),

    // Purchase a gift card
    purchase: protectedProcedure
      .input(z.object({
        amount: z.number().positive(), // Validation done in mutation using settings
        recipientEmail: z.string().email('Invalid recipient email'),
        recipientName: z.string().max(255).optional(),
        senderName: z.string().max(255).optional(),
        message: z.string().max(500).optional(),
        deliveryType: z.enum(['immediate', 'scheduled']),
        scheduledDate: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');

        // Get min/max values from settings (default: 50-2000 AED = 5000-200000 fils)
        const minSetting = await db.getSettingByKey('gift-card-min-value');
        const maxSetting = await db.getSettingByKey('gift-card-max-value');
        const minValue = minSetting ? parseInt(minSetting.value) * 100 : 5000; // Convert AED to fils
        const maxValue = maxSetting ? parseInt(maxSetting.value) * 100 : 200000;

        if (input.amount < minValue) {
          throw new Error(`Minimum gift card value is ${minValue / 100} AED`);
        }
        if (input.amount > maxValue) {
          throw new Error(`Maximum gift card value is ${maxValue / 100} AED`);
        }

        // Parse scheduled date if provided
        let scheduledDate: Date | null = null;
        if (input.deliveryType === 'scheduled' && input.scheduledDate) {
          scheduledDate = new Date(input.scheduledDate);
          if (scheduledDate < new Date()) {
            throw new Error('Scheduled date must be in the future');
          }
        }

        // Valid for 1 year from now
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 1);

        // Create the gift card (status will be 'pending' until payment)
        const giftCard = await db.createGiftCard({
          amount: input.amount,
          balanceRemaining: input.amount,
          status: 'pending',
          purchasedBy: ctx.user.id,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName || null,
          senderName: input.senderName || ctx.user.name || null,
          message: input.message || null,
          deliveryType: input.deliveryType,
          scheduledDate,
          validUntil,
        });

        // Return the gift card for payment processing
        return {
          giftCardId: giftCard.id,
          code: giftCard.code,
          amount: input.amount, // Use input amount since createGiftCard returns only id and code
        };
      }),

    // Create Stripe checkout session for gift card purchase
    createCheckoutSession: protectedProcedure
      .input(z.object({
        giftCardId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        if (!stripe) {
          throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
        }

        const giftCard = await db.getGiftCardById(input.giftCardId);
        if (!giftCard) throw new Error('Gift card not found');
        if (giftCard.purchasedBy !== ctx.user.id) throw new Error('Unauthorized');
        if (giftCard.status !== 'pending') throw new Error('Gift card already processed');

        const baseUrl = process.env.SITE_URL || 'https://www.ileala.ae';
        const amountAED = (giftCard.amount / 100).toFixed(2);

        const session = await stripe.checkout.sessions.create({
          line_items: [{
            price_data: {
              currency: 'aed',
              product_data: {
                name: `ILE ALA Gift Card - AED ${amountAED}`,
                description: `Digital gift card for ${giftCard.recipientEmail}`,
              },
              unit_amount: giftCard.amount, // Already in fils
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${baseUrl}/gift-card/success?gc=${giftCard.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/gift-card?cancelled=true`,
          metadata: {
            giftCardId: giftCard.id.toString(),
            type: 'gift_card',
          },
        });

        if (!session.url) {
          throw new Error('Stripe session created but no checkout URL was returned');
        }

        return { sessionId: session.id, url: session.url };
      }),

    // Verify gift card payment and activate
    verifyPayment: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
        giftCardId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        if (!stripe) {
          throw new Error('Stripe is not configured');
        }

        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        if (session.payment_status === 'paid' && session.metadata?.giftCardId) {
          const giftCardId = parseInt(session.metadata.giftCardId);

          if (giftCardId !== input.giftCardId) {
            throw new Error('Gift card ID mismatch');
          }

          const giftCard = await db.getGiftCardById(giftCardId);
          if (!giftCard) throw new Error('Gift card not found');

          // Activate the gift card
          await db.activateGiftCard(giftCardId);

          // Send email immediately if deliveryType is 'immediate'
          if (giftCard.deliveryType === 'immediate') {
            try {
              const { sendGiftCardEmail } = await import('./email');
              await sendGiftCardEmail(
                giftCard.recipientEmail,
                giftCard.recipientName,
                giftCard.senderName,
                giftCard.code,
                giftCard.amount,
                giftCard.message,
                giftCard.validUntil
              );
              await db.markGiftCardDelivered(giftCardId);
            } catch (error) {
              // Log error but don't fail - email can be resent from admin
              console.error('[GiftCard] Failed to send email:', error);
            }
          }

          return {
            success: true,
            code: giftCard.code,
            recipientEmail: giftCard.recipientEmail,
            deliveryType: giftCard.deliveryType,
          };
        }

        return { success: false, message: 'Payment not completed' };
      }),

    // Get user's purchased gift cards
    myPurchases: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      const allCards = await db.getAllGiftCards();
      return allCards.filter(gc => gc.purchasedBy === ctx.user!.id);
    }),
  }),

  // Orders router
  orders: router({
    create: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number().int().positive('Product ID must be a positive number'),
          quantity: quantitySchema,
          price: z.number().min(0, 'Price cannot be negative').max(1000000, 'Price cannot exceed 1,000,000 AED'),
        })).min(1, 'Order must have at least one item').max(100, 'Order cannot have more than 100 items'),
        shippingAddress: addressSchema.refine((val) => val && val.length >= 5, 'Shipping address must be at least 5 characters'),
        customerName: nameSchema,
        customerEmail: emailSchema,
        customerPhone: phoneSchema,
        couponCode: couponCodeSchema.optional(),
        shippingCost: z.number().min(0).max(500).optional().default(0),
        giftCardCode: z.string().min(10).optional(),
        giftCardAmount: z.number().min(0).optional(), // Amount to use in fils
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');

        // Calculate subtotal
        const subtotal = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Apply coupon if provided
        let discountAmount = 0;
        let totalAmount = subtotal;

        if (input.couponCode) {
          const validation = await db.validateCoupon(input.couponCode, subtotal);
          if (validation.valid && validation.coupon) {
            discountAmount = await db.calculateDiscount(validation.coupon, subtotal);
            totalAmount = subtotal - discountAmount;
            // Increment coupon usage
            await db.incrementCouponUsage(input.couponCode);
          }
        }

        // Add shipping cost to total
        const shippingCost = input.shippingCost || 0;
        totalAmount = totalAmount + shippingCost;

        // Apply gift card if provided
        let giftCardDiscountAmount = 0;
        let validatedGiftCard: Awaited<ReturnType<typeof db.validateGiftCard>>['giftCard'] | null = null;

        if (input.giftCardCode && input.giftCardAmount && input.giftCardAmount > 0) {
          const giftCardValidation = await db.validateGiftCard(input.giftCardCode);
          if (!giftCardValidation.valid || !giftCardValidation.giftCard) {
            throw new Error(giftCardValidation.message || 'Invalid gift card');
          }

          validatedGiftCard = giftCardValidation.giftCard;

          // Ensure we don't use more than the gift card balance or the order total
          const maxGiftCardAmount = Math.min(
            input.giftCardAmount,
            validatedGiftCard.balanceRemaining,
            totalAmount * 100 // Convert to fils for comparison
          );

          giftCardDiscountAmount = maxGiftCardAmount; // In fils
          totalAmount = Math.max(0, totalAmount - (giftCardDiscountAmount / 100)); // Convert fils to AED
        }

        // Create order (shippingCost is already included in totalAmount)
        const orderId = await db.createOrder({
          userId: ctx.user.id,
          totalAmount,
          shippingAddress: input.shippingAddress,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          couponCode: input.couponCode,
          discountAmount,
          notes: shippingCost > 0 ? `Shipping: ${shippingCost} AED` : 'Free shipping (Dubai)',
          status: 'pending',
          paymentStatus: 'pending',
        });
        
        // Create order items
        for (const item of input.items) {
          await db.createOrderItem({
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.price,
          });
        }

        // Apply gift card redemption (deduct balance)
        if (input.giftCardCode && giftCardDiscountAmount > 0) {
          try {
            await db.applyGiftCard(input.giftCardCode, giftCardDiscountAmount, orderId);
            console.log(`[Order ${orderId}] Gift card ${input.giftCardCode} applied: ${giftCardDiscountAmount / 100} AED`);
          } catch (error) {
            console.error(`[Order ${orderId}] Failed to apply gift card:`, error);
            // Don't fail the order, but log the error
          }
        }

        // Clear cart
        await db.clearCart(ctx.user.id);

        return { orderId, giftCardApplied: giftCardDiscountAmount > 0 ? giftCardDiscountAmount / 100 : 0 };
      }),
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input.id);
        if (!order) throw new Error('Order not found');
        
        // Check if user owns this order or is admin
        if (order.userId !== ctx.user?.id && ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      return await db.getUserOrders(ctx.user.id);
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can list all orders
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return await db.getAllOrders();
    }),
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'])
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
    // Cancel order - users can only cancel their own pending orders
    cancel: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');

        const order = await db.getOrderById(input.orderId);
        if (!order) throw new Error('Order not found');

        // Check ownership
        if (order.userId !== ctx.user.id) {
          throw new Error('You can only cancel your own orders');
        }

        // Can only cancel pending payment orders
        if (order.paymentStatus !== 'pending') {
          throw new Error('Only orders with pending payment can be cancelled');
        }

        // Update both status and payment status to cancelled
        await db.updateOrderStatus(input.orderId, 'cancelled');
        await db.updateOrderPaymentStatus(input.orderId, 'cancelled');

        return { success: true };
      }),
  }),

  // Admin router (protected - only for admin users)
  admin: router({
    // Customers management
    customers: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getAllUsers();
      }),
    }),

    // Promote user to admin (requires secret code)
    promoteToAdmin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        secret: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Verify secret code from environment
        const adminSecret = process.env.ADMIN_PROMOTION_SECRET;
        if (!adminSecret || input.secret !== adminSecret) {
          throw new Error('Invalid secret code');
        }

        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.role === 'admin') {
          throw new Error('User is already an admin');
        }

        await db.updateUserProfile(user.id, { role: 'admin' } as any);
        return { success: true, message: `User ${input.email} has been promoted to admin` };
      }),

    // Products management
    products: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        // Admin should see ALL products, including inactive ones
        const dbInstance = await db.getDb();
        if (!dbInstance) {
          return [];
        }

        const allProducts = await dbInstance.select().from(products).orderBy(products.id);

        return allProducts;
      }),
      create: protectedProcedure
        .input(z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          nameEN: z.string(),
          namePT: z.string(),
          descriptionEN: z.string().optional(),
          descriptionPT: z.string().optional(),
          descriptionEN_full: z.string().optional(),
          descriptionPT_full: z.string().optional(),
          price: z.number(),
          salePrice: z.number().optional(),
          imageUrl: z.string().optional(),
          mainImage: z.string().optional(),
          mainImageAlt: z.string().optional(),
          images: z.string().optional(),
          collection: z.string().optional(),
          category: z.string().optional(),
          stock: z.number().default(0),
          material: z.string().optional(),
          dimensions: z.string().optional(),
          colors: z.string().optional(),
          careInstructionsEN: z.string().optional(),
          careInstructionsPT: z.string().optional(),
          weight: z.number().optional(),
          sku: z.string().optional(),
          inStock: z.boolean().optional(),
          stockQuantity: z.number().optional(),
          featured: z.union([z.number(), z.boolean()]).default(0),
          isNew: z.boolean().optional(),
          onSale: z.boolean().optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
          active: z.number().default(1),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
            if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
            
            // Generate slug from nameEN if not provided
            const slug = input.slug || input.nameEN.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '') + '-' + Date.now();
            
            // Use provided name or default to nameEN
            const name = input.name || input.nameEN;
            
          debugLog('[Admin.Products.Create] Creating product:', name);

          // Check if slug already exists
          const existingProduct = await db.getProductBySlug(slug);
          if (existingProduct) {
            throw new Error(`Product with slug "${slug}" already exists. Please use a different name.`);
          }

          const productData = {
            ...input,
            name,
            slug,
            active: input.active ?? 1,
            imageUrl: input.imageUrl || null,
            // Convert boolean fields to integers for database
            featured: typeof input.featured === 'boolean' ? (input.featured ? 1 : 0) : (input.featured ?? 0),
            inStock: input.inStock !== undefined ? (input.inStock ? 1 : 0) : 1,
            isNew: input.isNew !== undefined ? (input.isNew ? 1 : 0) : 0,
            onSale: input.onSale !== undefined ? (input.onSale ? 1 : 0) : 0,
          };

          const productId = await db.createProduct(productData);

          // Verify the product was created
          const createdProduct = await db.getProductById(productId);

          if (!createdProduct) {
            throw new Error('Product was created but could not be verified. Please check the database.');
          }
            
            // Invalidate all product caches
            invalidateCache(CacheKeys.products());
            invalidateCache(CacheKeys.featuredProducts());
            if (input.collection) {
              invalidateCache(CacheKeys.products(`collection:${input.collection}`));
            }
            if (input.category) {
              invalidateCache(CacheKeys.products(`category:${input.category}`));
            }
            
            // Return the created product (already verified above)
            return createdProduct || { id: productId };
          } catch (error) {
            throw error;
          }
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            slug: z.string().optional(),
            nameEN: z.string().optional(),
            namePT: z.string().optional(),
            descriptionEN: z.string().optional(),
            descriptionPT: z.string().optional(),
            descriptionEN_full: z.string().optional(),
            descriptionPT_full: z.string().optional(),
            price: z.number().optional(),
            salePrice: z.number().optional(),
            imageUrl: z.string().nullable().optional(),
            mainImage: z.string().optional(),
            mainImageAlt: z.string().optional(),
            images: z.string().optional(),
            collection: z.string().optional(),
            category: z.string().optional(),
            stock: z.number().optional(),
            material: z.string().optional(),
            dimensions: z.string().optional(),
            colors: z.string().optional(),
            careInstructionsEN: z.string().optional(),
            careInstructionsPT: z.string().optional(),
            weight: z.number().optional(),
            sku: z.string().optional(),
            inStock: z.union([z.boolean(), z.number()]).optional(),
            stockQuantity: z.number().optional(),
            featured: z.union([z.number(), z.boolean()]).optional(),
            isNew: z.union([z.boolean(), z.number()]).optional(),
            onSale: z.union([z.boolean(), z.number()]).optional(),
            seoTitle: z.string().optional(),
            seoDescription: z.string().optional(),
            active: z.number().optional(),
          }),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const { id, data } = input;

          // Convert boolean fields to integers for database
          const updates: Record<string, any> = { ...data };
          if (typeof data.featured === 'boolean') updates.featured = data.featured ? 1 : 0;
          if (typeof data.inStock === 'boolean') updates.inStock = data.inStock ? 1 : 0;
          if (typeof data.isNew === 'boolean') updates.isNew = data.isNew ? 1 : 0;
          if (typeof data.onSale === 'boolean') updates.onSale = data.onSale ? 1 : 0;

          debugLog('[Admin.Products.Update] Updating product:', id);

          // Get product before update to check collection/category for cache invalidation
          const productBeforeUpdate = await db.getProductById(id);

          if (!productBeforeUpdate) {
            throw new Error(`Product with id ${id} not found`);
          }

          await db.updateProduct(id, updates);

          // Invalidate all product caches
          invalidateCache(CacheKeys.product(id));
          invalidateCache(CacheKeys.products());
          invalidateCache(CacheKeys.featuredProducts());
          
          // Invalidate collection/category caches if they changed
          if (updates.collection || productBeforeUpdate?.collection) {
            const collection = updates.collection || productBeforeUpdate?.collection;
            if (collection) {
              invalidateCache(CacheKeys.products(`collection:${collection}`));
            }
          }
          if (updates.category || productBeforeUpdate?.category) {
            const category = updates.category || productBeforeUpdate?.category;
            if (category) {
              invalidateCache(CacheKeys.products(`category:${category}`));
            }
          }
          
          // If slug might have changed, invalidate by slug cache
          if (updates.nameEN && productBeforeUpdate) {
            const oldSlug = productBeforeUpdate.slug;
            invalidateCache(CacheKeys.productBySlug(oldSlug));
          }
          
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          
          // Get product before delete to check collection/category for cache invalidation
          const productBeforeDelete = await db.getProductById(input.id);
          
          await db.deleteProduct(input.id);
          
          // Invalidate all product caches
          invalidateCache(CacheKeys.product(input.id));
          invalidateCache(CacheKeys.products());
          invalidateCache(CacheKeys.featuredProducts());
          
          // Invalidate collection/category caches
          if (productBeforeDelete?.collection) {
            invalidateCache(CacheKeys.products(`collection:${productBeforeDelete.collection}`));
          }
          if (productBeforeDelete?.category) {
            invalidateCache(CacheKeys.products(`category:${productBeforeDelete.category}`));
          }
          if (productBeforeDelete?.slug) {
            invalidateCache(CacheKeys.productBySlug(productBeforeDelete.slug));
          }
          
          return { success: true };
        }),
      // Migration utility to fix prices (convert fils to AED) and sync imageUrl
      // Debug endpoint to see all products with their status
      debugProducts: protectedProcedure
        .query(async ({ ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

          const dbInstance = await db.getDb();
          if (!dbInstance) throw new Error('Database not available');

          const allProducts = await dbInstance.select().from(products);
          return allProducts.map(p => ({
            id: p.id,
            name: p.nameEN || p.name,
            active: p.active,
            category: p.category,
            collection: p.collection,
            imageUrl: p.imageUrl,
            mainImage: p.mainImage,
          }));
        }),

      fixPricesAndImages: protectedProcedure
        .mutation(async ({ ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

          const dbInstance = await db.getDb();
          if (!dbInstance) throw new Error('Database not available');

          // Get all products
          const allProducts = await dbInstance.select().from(products);
          let fixedCount = 0;
          const changes: { id: number; name: string; oldPrice: number; newPrice: number; imageFixed: boolean; activeFixed: boolean }[] = [];

          for (const product of allProducts) {
            const updates: Record<string, any> = {};
            let priceFixed = false;
            let imageFixed = false;
            let activeFixed = false;

            // Fix price if it looks like it's in fils (> 1000 and divisible by 100)
            if (product.price > 1000 && product.price % 100 === 0) {
              updates.price = Math.round(product.price / 100);
              priceFixed = true;
            }

            // Fix salePrice if needed
            if (product.salePrice && product.salePrice > 1000 && product.salePrice % 100 === 0) {
              updates.salePrice = Math.round(product.salePrice / 100);
            }

            // Sync imageUrl with mainImage if missing
            if (!product.imageUrl && product.mainImage) {
              updates.imageUrl = product.mainImage;
              imageFixed = true;
            } else if (product.imageUrl && !product.mainImage) {
              updates.mainImage = product.imageUrl;
              imageFixed = true;
            }

            // Fix active status - ensure all products are active (1)
            if (product.active !== 1) {
              updates.active = 1;
              activeFixed = true;
            }

            if (Object.keys(updates).length > 0) {
              await dbInstance.update(products).set(updates).where(eq(products.id, product.id));
              fixedCount++;
              changes.push({
                id: product.id,
                name: product.nameEN || product.name,
                oldPrice: product.price,
                newPrice: updates.price || product.price,
                imageFixed,
                activeFixed,
              });
            }
          }

          // Invalidate all caches
          invalidateCache(CacheKeys.products());
          invalidateCache(CacheKeys.featuredProducts());

          return {
            success: true,
            fixedCount,
            changes,
            message: `Fixed ${fixedCount} products`
          };
        }),
    }),

    // Orders management
    orders: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getAllOrders();
      }),
      updateStatus: protectedProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          await db.updateOrderStatus(input.id, input.status);
          return { success: true };
        }),
    }),
    
    // Image upload
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        
        // Decode base64
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // 🔒 SECURITY: Validate upload
        const validation = validateUpload(input.fileName, input.contentType, buffer.length);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // 🔒 SECURITY: Validate image buffer (check magic numbers)
        const bufferValidation = validateImageBuffer(buffer);
        if (!bufferValidation.valid) {
          throw new Error(bufferValidation.error);
        }

        // Generate safe filename
        const safeFilename = generateSafeFilename(input.fileName);
        const key = `products/${safeFilename}`;
        
        // Upload to Cloudinary
        const result = await storagePut(key, buffer, input.contentType);

        // Determine folder based on filename prefix
        let folder = 'general';
        if (safeFilename.startsWith('email-')) folder = 'email-marketing';
        else if (key.startsWith('products/')) folder = 'products';
        else if (safeFilename.includes('artisan')) folder = 'artisans';
        else if (safeFilename.includes('banner')) folder = 'banners';

        // Save to media library for tracking
        try {
          await db.createMedia({
            filename: safeFilename,
            url: result.url,
            type: input.contentType,
            folder: folder,
          });
        } catch {
          // Don't fail the upload if media tracking fails
        }

        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'create',
          entity: 'media',
          metadata: {
            filename: safeFilename,
            size: buffer.length,
            contentType: input.contentType,
          },
        });

        return { url: result.url, key: result.key };
      }),
    
    // Coupons management
    coupons: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getAllCoupons();
      }),
      create: protectedProcedure
        .input(z.object({
          code: z.string(),
          discountType: z.enum(['percentage', 'fixed']),
          discountValue: z.number(),
          minPurchaseAmount: z.number().default(0),
          maxUses: z.number().default(0),
          active: z.number().default(1),
          validFrom: z.date().optional(),
          validUntil: z.date().optional(),
          imageUrl: z.string().optional(),
          showInPopup: z.number().default(0),
          titleEN: z.string().optional(),
          titlePT: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionPT: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          // If setting this coupon as popup, disable others first
          if (input.showInPopup === 1) {
            await db.disableAllPopupCoupons();
          }
          const couponId = await db.createCoupon(input as any);
          return { id: couponId };
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          code: z.string().optional(),
          discountType: z.enum(['percentage', 'fixed']).optional(),
          discountValue: z.number().optional(),
          minPurchaseAmount: z.number().optional(),
          maxUses: z.number().optional(),
          active: z.number().optional(),
          validUntil: z.date().optional(),
          imageUrl: z.string().optional().nullable(),
          showInPopup: z.number().optional(),
          titleEN: z.string().optional().nullable(),
          titlePT: z.string().optional().nullable(),
          descriptionEN: z.string().optional().nullable(),
          descriptionPT: z.string().optional().nullable(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const { id, ...updates } = input;
          // If setting this coupon as popup, disable others first
          if (updates.showInPopup === 1) {
            await db.disableAllPopupCoupons();
          }
          await db.updateCoupon(id, updates as any);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          await db.deleteCoupon(input.id);
          return { success: true };
        }),
    }),

    // Gift Cards management
    giftCards: router({
      list: protectedProcedure
        .input(z.object({
          status: z.enum(['all', 'pending', 'active', 'used', 'expired', 'cancelled']).default('all'),
        }).optional())
        .query(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const allCards = await db.getAllGiftCards();
          if (!input?.status || input.status === 'all') {
            return allCards;
          }
          return allCards.filter(gc => gc.status === input.status);
        }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const giftCard = await db.getGiftCardById(input.id);
          if (!giftCard) throw new Error('Gift card not found');
          return giftCard;
        }),

      cancel: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

          const giftCard = await db.getGiftCardById(input.id);
          if (!giftCard) throw new Error('Gift card not found');

          if (giftCard.status === 'used') {
            throw new Error('Cannot cancel a gift card that has been fully used');
          }

          await db.cancelGiftCard(input.id);

          // Audit log
          const audit = createAuditLogger(ctx);
          await audit.log({
            action: 'update',
            entity: 'gift_card',
            entityId: input.id,
            metadata: {
              previousStatus: giftCard.status,
              newStatus: 'cancelled',
              code: giftCard.code,
            },
          });

          return { success: true };
        }),

      // Delete a gift card (only pending/cancelled ones)
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

          const giftCard = await db.getGiftCardById(input.id);
          if (!giftCard) throw new Error('Gift card not found');

          // Only allow deleting pending or cancelled gift cards
          if (giftCard.status !== 'pending' && giftCard.status !== 'cancelled') {
            throw new Error('Can only delete pending or cancelled gift cards');
          }

          await db.deleteGiftCard(input.id);

          // Audit log
          const audit = createAuditLogger(ctx);
          await audit.log({
            action: 'delete',
            entity: 'gift_card',
            entityId: input.id,
            metadata: {
              code: giftCard.code,
              status: giftCard.status,
              amount: giftCard.amount,
            },
          });

          return { success: true };
        }),

      // Delete all pending gift cards
      deleteAllPending: protectedProcedure
        .mutation(async ({ ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

          const allCards = await db.getAllGiftCards();
          const pendingCards = allCards.filter(gc => gc.status === 'pending');

          let deleted = 0;
          for (const card of pendingCards) {
            await db.deleteGiftCard(card.id);
            deleted++;
          }

          // Audit log
          const audit = createAuditLogger(ctx);
          await audit.log({
            action: 'delete',
            entity: 'gift_card',
            entityId: 0,
            metadata: {
              action: 'delete_all_pending',
              count: deleted,
            },
          });

          return { success: true, deleted };
        }),

      resendEmail: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');

          const giftCard = await db.getGiftCardById(input.id);
          if (!giftCard) throw new Error('Gift card not found');

          if (giftCard.status !== 'active') {
            throw new Error('Can only resend email for active gift cards');
          }

          try {
            const { sendGiftCardEmail } = await import('./email');
            await sendGiftCardEmail(
              giftCard.recipientEmail,
              giftCard.recipientName,
              giftCard.senderName,
              giftCard.code,
              giftCard.amount,
              giftCard.message,
              giftCard.validUntil
            );
            await db.markGiftCardDelivered(input.id);

            // Audit log
            const audit = createAuditLogger(ctx);
            await audit.log({
              action: 'update',
              entity: 'gift_card',
              entityId: input.id,
              metadata: {
                action: 'resend_email',
                recipientEmail: giftCard.recipientEmail,
              },
            });

            return { success: true };
          } catch (error) {
            throw new Error('Failed to resend gift card email');
          }
        }),

      stats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const allCards = await db.getAllGiftCards();

        const stats = {
          total: allCards.length,
          pending: allCards.filter(gc => gc.status === 'pending').length,
          active: allCards.filter(gc => gc.status === 'active').length,
          used: allCards.filter(gc => gc.status === 'used').length,
          expired: allCards.filter(gc => gc.status === 'expired').length,
          cancelled: allCards.filter(gc => gc.status === 'cancelled').length,
          totalValue: allCards.reduce((sum, gc) => sum + gc.amount, 0),
          totalRedeemed: allCards.reduce((sum, gc) => sum + (gc.amount - gc.balanceRemaining), 0),
          totalPending: allCards.filter(gc => gc.status === 'active').reduce((sum, gc) => sum + gc.balanceRemaining, 0),
        };

        return stats;
      }),
    }),

    // Loyalty Program Admin Routes
    loyalty: router({
      // Get all loyalty members
      list: protectedProcedure
        .input(z.object({
          tier: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          return await db.getAllLoyaltyMembers(input);
        }),

      // Get loyalty program stats
      stats: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getLoyaltyStats();
      }),

      // Get all tier configurations
      tiers: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.getAllTierBenefits();
      }),

      // Get member details
      getMember: protectedProcedure
        .input(z.object({ memberId: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const sqlClient = await db.getSql();
          if (!sqlClient) throw new Error('Database not available');

          const members = await sqlClient`
            SELECT lm.*, u.name, u.email
            FROM loyalty_members lm
            JOIN users u ON lm."userId" = u.id
            WHERE lm.id = ${input.memberId}
          `;
          return members[0] || null;
        }),

      // Get member activity log
      getMemberActivity: protectedProcedure
        .input(z.object({ memberId: z.number(), limit: z.number().optional() }))
        .query(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          return await db.getMemberActivityLog(input.memberId, input.limit || 50);
        }),

      // Update tier benefits
      updateTier: protectedProcedure
        .input(z.object({
          tier: z.string(),
          displayName: z.string().optional(),
          minSpend: z.number().optional(),
          maxSpend: z.number().nullable().optional(),
          color: z.string().optional(),
          iconUrl: z.string().nullable().optional(),
          freeStandardShipping: z.number().min(0).max(1).optional(),
          freeExpressShipping: z.number().min(0).max(1).optional(),
          earlyAccess: z.number().min(0).max(1).optional(),
          earlyAccessHours: z.number().optional(),
          birthdayReward: z.number().min(0).max(1).optional(),
          exclusiveProducts: z.number().min(0).max(1).optional(),
          prioritySupport: z.number().min(0).max(1).optional(),
          personalConcierge: z.number().min(0).max(1).optional(),
          eventInvites: z.number().min(0).max(1).optional(),
          surpriseGifts: z.number().min(0).max(1).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const { tier, ...data } = input;
          const updated = await db.updateTierBenefits(tier, data);
          return { success: !!updated, tier: updated };
        }),

      // Manually change member tier
      changeMemberTier: protectedProcedure
        .input(z.object({
          memberId: z.number(),
          newTier: z.enum(['green', 'silver', 'gold', 'platinum']),
          reason: z.string().min(1),
          sendEmail: z.boolean().optional().default(false),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          if (!ctx.user?.id) throw new Error('Admin ID required');

          // Get member info before changing tier (for email)
          const memberBefore = await db.getLoyaltyMemberById(input.memberId);
          const oldTier = memberBefore?.tier || 'green';

          const result = await db.adminChangeMemberTier(input.memberId, input.newTier, ctx.user.id, input.reason);

          // Send upgrade email if requested and tier actually changed
          if (input.sendEmail && result.success && oldTier !== input.newTier) {
            try {
              // Get user email
              const member = await db.getLoyaltyMemberById(input.memberId);
              if (member?.userId) {
                const user = await db.getUserById(member.userId);
                if (user?.email) {
                  const { sendTierUpgradeEmail } = await import('./email');
                  await sendTierUpgradeEmail(
                    user.email,
                    user.firstName || user.email.split('@')[0],
                    input.newTier,
                    oldTier
                  );
                  logger.info(`[Loyalty] Manual tier upgrade email sent to ${user.email} (${oldTier} -> ${input.newTier})`);
                }
              }
            } catch (emailError) {
              logger.error('[Loyalty] Failed to send manual tier upgrade email:', emailError);
              // Don't fail the tier change if email fails
            }
          }

          return result;
        }),

      // Update member status (active/inactive)
      updateMemberStatus: protectedProcedure
        .input(z.object({
          memberId: z.number(),
          active: z.number().min(0).max(1),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const success = await db.updateMemberStatus(input.memberId, input.active);
          return { success };
        }),

      // Add member manually by email
      addMember: protectedProcedure
        .input(z.object({
          email: z.string().email(),
          tier: z.enum(['green', 'silver', 'gold', 'platinum']).optional().default('green'),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          return await db.addLoyaltyMemberByEmail(input.email, input.tier);
        }),

      // Delete member
      deleteMember: protectedProcedure
        .input(z.object({
          memberId: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          return await db.deleteLoyaltyMember(input.memberId);
        }),

      // Update member spending values manually
      updateMemberSpending: protectedProcedure
        .input(z.object({
          memberId: z.number(),
          totalSpentCurrentYear: z.number().min(0).optional(),
          totalSpentAllTime: z.number().min(0).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          if (!ctx.user?.id) throw new Error('Admin ID required');

          const sqlClient = await db.getSql();
          if (!sqlClient) throw new Error('Database not available');

          // Build update object
          const updates: Record<string, any> = {};
          if (input.totalSpentCurrentYear !== undefined) {
            updates.totalSpentCurrentYear = input.totalSpentCurrentYear;
          }
          if (input.totalSpentAllTime !== undefined) {
            updates.totalSpentAllTime = input.totalSpentAllTime;
          }

          if (Object.keys(updates).length === 0) {
            return { success: false, message: 'No values to update' };
          }

          // Update member spending
          await sqlClient`
            UPDATE loyalty_members
            SET
              "totalSpentCurrentYear" = COALESCE(${updates.totalSpentCurrentYear ?? null}, "totalSpentCurrentYear"),
              "totalSpentAllTime" = COALESCE(${updates.totalSpentAllTime ?? null}, "totalSpentAllTime"),
              "updatedAt" = NOW()
            WHERE id = ${input.memberId}
          `;

          // Log the activity
          await sqlClient`
            INSERT INTO loyalty_activity_log ("memberId", "activityType", description, metadata, "createdAt")
            VALUES (
              ${input.memberId},
              'manual_adjustment',
              ${'Spending values updated manually by admin'},
              ${JSON.stringify({ adminId: ctx.user.id, updates })},
              NOW()
            )
          `;

          logger.info(`[Loyalty] Admin ${ctx.user.id} updated spending for member ${input.memberId}:`, updates);

          return { success: true, message: 'Spending updated successfully' };
        }),
    }),
  }),

  // Loyalty Program Public Routes (for logged-in users)
  loyalty: router({
    // Get my loyalty status
    myStatus: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');

      const member = await db.getOrCreateLoyaltyMember(ctx.user.id);
      if (!member) return null;

      const benefits = await db.getTierBenefits(member.tier);
      const nextTierInfo = await db.getNextTierInfo(ctx.user.id);
      const allTiers = await db.getAllTierBenefits();

      return {
        member,
        benefits,
        nextTierInfo,
        allTiers,
      };
    }),

    // Get tier benefits (public info - for non-authenticated users to see tiers)
    getTierBenefits: publicProcedure.query(async () => {
      return await db.getAllTierBenefits();
    }),

    // Update my birthday
    updateBirthday: protectedProcedure
      .input(z.object({ birthday: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        const success = await db.updateMemberBirthday(ctx.user.id, new Date(input.birthday));
        return { success };
      }),

    // Update my WhatsApp (for Platinum concierge)
    updateWhatsApp: protectedProcedure
      .input(z.object({ whatsappNumber: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');

        // Verify member is Platinum
        const member = await db.getLoyaltyMemberByUserId(ctx.user.id);
        if (!member || member.tier !== 'platinum') {
          throw new Error('WhatsApp concierge is only available for Platinum members');
        }

        const success = await db.updateMemberWhatsApp(ctx.user.id, input.whatsappNumber);
        return { success };
      }),

    // Claim birthday gift
    claimBirthdayGift: protectedProcedure.mutation(async ({ ctx }) => {
      if (!ctx.user) throw new Error('Not authenticated');
      return await db.claimBirthdayGift(ctx.user.id);
    }),

    // Get my activity history
    myActivity: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error('Not authenticated');

        const member = await db.getLoyaltyMemberByUserId(ctx.user.id);
        if (!member) return [];

        return await db.getMemberActivityLog(member.id, input?.limit || 20);
      }),

    // Check if user has free shipping benefit
    checkFreeShipping: protectedProcedure
      .input(z.object({ shippingType: z.enum(['standard', 'express']) }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return { hasFreeShipping: false, tier: null };
        const hasFreeShipping = await db.memberHasFreeShipping(ctx.user.id, input.shippingType);
        const member = await db.getLoyaltyMemberByUserId(ctx.user.id);
        return { hasFreeShipping, tier: member?.tier || null };
      }),
  }),

  // Stripe payment router
  payment: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        
        const order = await db.getOrderById(input.orderId);
        if (!order) throw new Error('Order not found');
        
        if (order.userId !== ctx.user.id) {
          throw new Error('Unauthorized');
        }
        
        const items = await db.getOrderItems(input.orderId);
        const baseUrl = process.env.SITE_URL || process.env.VITE_FRONTEND_FORGE_API_URL || 'https://ileala.ae';

        const lineItems = items.map(item => {
          // Price is stored in AED in the database
          // Stripe requires the smallest currency unit (fils for AED), so multiply by 100
          const unitAmount = Math.round(item.priceAtPurchase * 100);

          // Ensure image URL is absolute
          let imageUrl = item.product?.imageUrl || item.product?.mainImage;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
          }

          return {
            price_data: {
              currency: 'aed',
              product_data: {
                name: item.product?.nameEN || 'Product',
                description: item.product?.descriptionEN || undefined,
                images: imageUrl ? [imageUrl] : [],
              },
              unit_amount: unitAmount,
            },
            quantity: item.quantity,
          };
        });

        if (!stripe) {
          throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
        }

        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: 'payment',
          success_url: `${baseUrl}/order-confirmation/${input.orderId}?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/orders`,
          // Pre-fill customer email from order
          customer_email: order.customerEmail || ctx.user.email || undefined,
          // Allow phone number collection (editable)
          phone_number_collection: {
            enabled: true,
          },
          metadata: {
            orderId: input.orderId.toString(),
          },
        });

        if (!session.url) {
          throw new Error('Stripe session created but no checkout URL was returned');
        }

        return { sessionId: session.id, url: session.url };
      }),
    verifyPayment: protectedProcedure
      .input(z.object({
        sessionId: z.string(),
      }))
      .query(async ({ input, ctx }) => {
        if (!stripe) {
          throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
        }

        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        if (session.payment_status === 'paid' && session.metadata?.orderId) {
          const orderId = parseInt(session.metadata.orderId);
          await db.updateOrderPaymentStatus(orderId, 'paid');

          // Send order confirmation email
          try {
            const order = await db.getOrderById(orderId);
            if (order && order.customerEmail) {
              const orderItems = await db.getOrderItems(orderId);
              const { sendOrderConfirmationEmail } = await import('./email');
              await sendOrderConfirmationEmail(
                order.customerEmail,
                order.customerName || 'Customer',
                orderId,
                order.totalAmount,
                orderItems.map((item: any) => ({
                  name: item.product?.nameEN || 'Product',
                  quantity: item.quantity,
                  price: item.priceAtPurchase,
                }))
              );

              // Update loyalty program and check for tier upgrade
              if (order.userId) {
                try {
                  // Convert AED to fils (multiply by 100) for loyalty tracking
                  const amountInFils = Math.round(order.totalAmount * 100);
                  const loyaltyResult = await db.updateMemberSpending(order.userId, amountInFils, orderId);

                  // If tier changed, send congratulations email
                  if (loyaltyResult.tierChanged && loyaltyResult.newTier && loyaltyResult.member) {
                    const { sendTierUpgradeEmail } = await import('./email');
                    await sendTierUpgradeEmail(
                      order.customerEmail,
                      order.customerName || 'Valued Customer',
                      loyaltyResult.newTier,
                      loyaltyResult.member.previousTier || 'green'
                    );
                    logger.info(`[Loyalty] Tier upgrade email sent to ${order.customerEmail} (${loyaltyResult.member.previousTier} -> ${loyaltyResult.newTier})`);
                  }
                } catch (loyaltyError) {
                  logger.error('[Loyalty] Failed to update member spending or send tier email:', loyaltyError);
                  // Don't fail payment verification if loyalty update fails
                }
              }
            }
          } catch {
            // Don't fail payment verification if email fails
          }
        }

        return {
          paymentStatus: session.payment_status,
          orderId: session.metadata?.orderId,
        };
      }),
  }),
  // CMS routes for managing artisans and site content
  cms: router({
    // Artisans management
    artisans: router({
      list: protectedProcedure
        .query(async () => {
          return await db.listArtisans();
        }),
      create: protectedProcedure
        .input(z.object({
          name: z.string().min(1),
          bio: z.string().optional(),
          bioEN: z.string().optional(),
          bioPT: z.string().optional(),
          photoUrl: z.string().optional(),
          specialty: z.string().optional(),
          location: z.string().optional(),
          email: z.string().optional(), // Removed .email() validation due to over-restrictive regex causing errors
          phone: z.string().optional(),
          socialMedia: z.string().optional(),
          featured: z.number().default(0),
        }))
        .mutation(async ({ input }) => {
          return await db.createArtisan(input);
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          bio: z.string().optional(),
          bioEN: z.string().optional(),
          bioPT: z.string().optional(),
          photoUrl: z.string().optional(),
          specialty: z.string().optional(),
          location: z.string().optional(),
          email: z.string().optional(), // Removed .email() validation due to over-restrictive regex causing errors
          phone: z.string().optional(),
          socialMedia: z.string().optional(),
          featured: z.number().optional(),
          active: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return await db.updateArtisan(id, data);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          return await db.deleteArtisan(input.id);
        }),
    }),
    // Site content management
    content: router({
      list: protectedProcedure
        .query(async () => {
          return await db.listSiteContent();
        }),
      getByKey: publicProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ input }) => {
          return await db.getSiteContentByKey(input.key);
        }),
      upsert: protectedProcedure
        .input(z.object({
          key: z.string().min(1),
          contentType: z.string().min(1),
          contentEN: z.string().optional(),
          contentPT: z.string().optional(),
          metadata: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          return await db.upsertSiteContent(input);
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          return await db.deleteSiteContent(input.id);
        }),
    }),
  }),
  // Media management router
  media: router({
    list: protectedProcedure
      .query(async () => {
        return await db.getAllMedia();
      }),
    create: protectedProcedure
      .input(z.object({
        url: z.string().url(),
        filename: z.string().min(1),
        type: z.string().min(1),
        folder: z.string().optional(),
        altText: z.string().optional(),
        caption: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createMedia(input);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteMedia(input.id);
      }),
  }),
  // Hero Slides management
  heroSlides: router({
    list: protectedProcedure.query(async () => {
      return await db.listHeroSlides();
    }),
    listActive: publicProcedure.query(async () => {
      return await db.listActiveHeroSlides();
    }),
    create: protectedProcedure
      .input(z.object({
        imageUrl: z.string().min(1),
        altText: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        subtitleEN: z.string().optional(),
        subtitlePT: z.string().optional(),
        linkUrl: z.string().optional(),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await db.createHeroSlide(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        altText: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        subtitleEN: z.string().optional(),
        subtitlePT: z.string().optional(),
        linkUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateHeroSlide(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteHeroSlide(input.id);
      }),
  }),
  // Homepage Videos management
  homepageVideos: router({
    list: protectedProcedure.query(async () => {
      return await db.listHomepageVideos();
    }),
    listActive: publicProcedure.query(async () => {
      return await db.listActiveHomepageVideos();
    }),
    create: protectedProcedure
      .input(z.object({
        videoUrl: z.string().min(1),
        thumbnailUrl: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await db.createHomepageVideo(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateHomepageVideo(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteHomepageVideo(input.id);
      }),
  }),
  // Homepage Cards management
  homepageCards: router({
    list: protectedProcedure.query(async () => {
      return await db.listHomepageCards();
    }),
    listActive: publicProcedure.query(async () => {
      return await db.listActiveHomepageCards();
    }),
    create: protectedProcedure
      .input(z.object({
        imageUrl: z.string().min(1),
        titleEN: z.string().min(1),
        titlePT: z.string().min(1),
        linkUrl: z.string().min(1),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await db.createHomepageCard(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        imageUrl: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        linkUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateHomepageCard(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteHomepageCard(input.id);
      }),
  }),
  // Homepage seed endpoint
  homepageSeed: router({
    run: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.seedHomepageContent();
    }),
  }),
  // Page Banners management
  pageBanners: router({
    list: protectedProcedure.query(async () => {
      return await db.listPageBanners();
    }),
    get: publicProcedure
      .input(z.object({ pageSlug: z.string() }))
      .query(async ({ input }) => {
        return await db.getPageBanner(input.pageSlug);
      }),
    create: protectedProcedure
      .input(z.object({
        pageSlug: z.string().min(1),
        imageUrl: z.string().min(1),
        altText: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        subtitleEN: z.string().optional(),
        subtitlePT: z.string().optional(),
        overlayOpacity: z.number().default(30),
        active: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        return await db.createPageBanner(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        pageSlug: z.string().optional(),
        imageUrl: z.string().optional(),
        altText: z.string().optional(),
        titleEN: z.string().optional(),
        titlePT: z.string().optional(),
        subtitleEN: z.string().optional(),
        subtitlePT: z.string().optional(),
        overlayOpacity: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updatePageBanner(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePageBanner(input.id);
      }),
    seed: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.seedPageBanners();
    }),
  }),
  // Public artisans list
  artisans: router({
    listActive: publicProcedure.query(async () => {
      return await db.listActiveArtisans();
    }),
  }),
  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.getAllUsers();
    }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        // Prevent deleting yourself
        if (ctx.user?.id === input.id) throw new Error('Cannot delete your own account');
        await db.deleteUser(input.id);
        return { success: true };
      }),
    updateRole: protectedProcedure
      .input(z.object({ 
        id: z.number(), 
        role: z.enum(['user', 'admin']) 
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        // Prevent changing your own role
        if (ctx.user?.id === input.id) throw new Error('Cannot change your own role');
        await db.updateUserRole(input.id, input.role);
        return { success: true };
      }),
  }),
  categories: router({
    list: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.products('categories');
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const categories = await db.getAllCategories();
      setCached(cacheKey, categories, 10 * 60 * 1000); // 10 minutes
      return categories;
    }),
    listActive: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.products('categories:active');
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const categories = await db.getActiveCategories();
      setCached(cacheKey, categories, 10 * 60 * 1000); // 10 minutes
      return categories;
    }),
    create: protectedProcedure
      .input(z.object({
        slug: z.string(),
        nameEN: z.string(),
        namePT: z.string(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        imageUrl: z.string().optional(),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        
        const result = await db.createCategory(input);

        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'create',
          entity: 'category',
          entityId: result?.id,
          changes: { after: input },
        });

        return result;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        nameEN: z.string().optional(),
        namePT: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        imageUrl: z.string().optional(),
        parentId: z.number().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const { id, ...data } = input;
        
        // Get current data for audit
        const before = await db.getCategoryById(id);
        
        const result = await db.updateCategory(id, data);
        
        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'update',
          entity: 'category',
          entityId: id,
          changes: { before, after: data },
        });
        
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        
        // Get current data for audit
        const before = await db.getCategoryById(input.id);
        
        await db.deleteCategory(input.id);
        
        // Audit log
        const audit = createAuditLogger(ctx);
        await audit.log({
          action: 'delete',
          entity: 'category',
          entityId: input.id,
          changes: { before },
        });
        
        return { success: true };
      }),
  }),
  collections: router({
    list: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.products('collections');
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const collections = await db.getAllCollections();
      setCached(cacheKey, collections, 10 * 60 * 1000); // 10 minutes
      return collections;
    }),
    listActive: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.products('collections:active');
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const collections = await db.getActiveCollections();
      setCached(cacheKey, collections, 10 * 60 * 1000); // 10 minutes
      return collections;
    }),
    create: protectedProcedure
      .input(z.object({
        slug: z.string(),
        nameEN: z.string(),
        namePT: z.string(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        imageUrl: z.string().optional(),
        displayOrder: z.number().default(0),
        active: z.number().default(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.createCollection(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        nameEN: z.string().optional(),
        namePT: z.string().optional(),
        descriptionEN: z.string().optional(),
        descriptionPT: z.string().optional(),
        imageUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        active: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        const { id, ...data } = input;
        return await db.updateCollection(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        await db.deleteCollection(input.id);
        return { success: true };
      }),
  }),
  settings: router({
    // Public endpoint for frontend to fetch site settings
    public: publicProcedure.query(async () => {
      const settings = await db.getAllSettings();
      // Return as key-value object for easy access
      const settingsMap: Record<string, string> = {};
      for (const setting of settings) {
        settingsMap[setting.key] = setting.value;
      }
      return settingsMap;
    }),
    // Get a specific setting by key (public)
    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const setting = await db.getSettingByKey(input.key);
        return setting || null;
      }),
    // Admin only - list all settings with metadata
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.getAllSettings();
    }),
    upsert: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        return await db.upsertSetting(input.key, input.value, input.description, input.category);
      }),
    delete: protectedProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        await db.deleteSetting(input.key);
        return { success: true };
      }),
  }),
  
  // DEBUG: Temporary endpoint to investigate 2FA issue
  debug: router({
    user2FAStatus: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {        const user = await db.getUserByEmail(input.email);
        if (!user) {
          return { error: 'User not found' };
        }
        
        return {
          userId: user.id,
          email: user.email,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorEnabledType: typeof user.twoFactorEnabled,
          twoFactorEnabledValue: JSON.stringify(user.twoFactorEnabled),
          twoFactorSecret: user.twoFactorSecret ? 'EXISTS' : 'NULL',
          twoFactorSecretLength: user.twoFactorSecret?.length || 0,
          allFields: Object.keys(user),
          checks: {
            strictEqual1: user.twoFactorEnabled === 1,
            looseEqual1: user.twoFactorEnabled == 1,
            strictEqualTrue: user.twoFactorEnabled === true,
            looseEqualTrue: user.twoFactorEnabled == true,
            strictEqualString1: user.twoFactorEnabled === '1',
            numberConversion: Number(user.twoFactorEnabled) === 1,
          },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
