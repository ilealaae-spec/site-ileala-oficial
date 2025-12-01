import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from 'stripe';
import { storagePut } from './storage';
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

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
     *   Email: ceo@ileala.ae
     *   Senha: IleAla@2025
     * 
     * COMO FUNCIONA:
     *   1. Verifica se as credenciais são as de emergência (hardcoded)
     *   2. Cria/atualiza usuário admin no banco de dados
     *   3. Cria token de sessão usando SDK
     *   4. Define cookie de sessão
     *   5. Retorna sucesso
     * 
     * SEGURANÇA:
     *   - Senha hardcoded no código (repositório privado)
     *   - Sempre funciona, mesmo se banco estiver vazio
     *   - Use apenas para recuperação de emergência
     * 
     * PARA TROCAR SENHA:
     *   1. Edite esta linha de código
     *   2. Faça commit e push
     *   3. Aguarde deployment do Railway
     * 
     * DOCUMENTAÇÃO: Veja ADMIN_ACCESS.md para mais detalhes
     */
    login: publicProcedure
      .input(z.object({
        email: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // ⚠️ CREDENCIAIS DE EMERGÊNCIA HARDCODED - NÃO REMOVER!
        // Estas credenciais garantem acesso admin mesmo se o banco falhar
        if (email === 'ceo@ileala.ae' && password === 'IleAla@2025') {
          // REMOVED: Database upsert to avoid constraint conflicts
          // Emergency login works purely with session cookie, no DB required
          // This prevents "users_email_key" constraint errors
          /*
          try {
            const openId = 'emergency-admin-001';
            await db.upsertUser({
              openId,
              email,
              name: 'Emergency Admin',
              role: 'admin',
              loginMethod: 'emergency',
              lastSignedIn: new Date(),
            });
          } catch (error) {
            console.warn('[Auth] Could not upsert emergency admin user:', error);
            // Continue anyway - emergency login should work even if DB fails
          }
          */

          // Create simple JSON session instead of JWT to bypass validation issues
          const sessionData = JSON.stringify({
            id: 'emergency-admin-001',
            email: 'ceo@ileala.ae',
            name: 'Emergency Admin',
            role: 'admin',
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionData, cookieOptions);

          console.log('[Auth] Emergency login successful - JSON session created');

          // Return user object so frontend knows this is an admin
          return { 
            success: true,
            user: {
              id: 'emergency-admin-001',
              email: 'ceo@ileala.ae',
              name: 'Emergency Admin',
              role: 'admin'
            }
          };
        }

        throw new Error('Invalid credentials');
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    /**
     * ROTA PRINCIPAL DE LOGIN
     * 
     * Esta é a rota de login usada pelo frontend (Login.tsx).
     * 
     * FLUXO DE AUTENTICAÇÃO:
     *   1. Verifica PRIMEIRO se são credenciais de emergência (hardcoded)
     *   2. Se sim, cria/atualiza admin e retorna sucesso
     *   3. Se não, verifica credenciais no banco de dados
     *   4. Se válidas, cria sessão e retorna sucesso
     *   5. Se inválidas, retorna erro
     * 
     * CREDENCIAIS DE EMERGÊNCIA:
     *   Email: ceo@ileala.ae
     *   Senha: IleAla@2025
     *   Role: admin
     * 
     * POR QUE CREDENCIAIS DE EMERGÊNCIA?
     *   - Garantem acesso admin mesmo se banco estiver vazio/corrompido
     *   - Permitem recuperação de acesso em caso de problemas
     *   - Não dependem de migrações ou seeds
     * 
     * SEGURANÇA:
     *   - Credenciais hardcoded estão em repositório PRIVADO
     *   - Senhas normais são hashadas com bcrypt (10 rounds)
     *   - Sessão expira em 1 ano (pode ser ajustado)
     *   - Cookie httpOnly e secure em produção
     * 
     * COMO CRIAR ADMIN PERMANENTE:
     *   Execute: pnpm tsx scripts/create-admin.ts
     *   Ou veja: ADMIN_ACCESS.md
     * 
     * DOCUMENTAÇÃO COMPLETA: ADMIN_ACCESS.md
     */
    login: publicProcedure
      .input(z.object({
        email: emailSchema,
        password: z.string().min(1, 'Password is required'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // 🔒 SECURITY: Check rate limit before processing login
        const clientIp = getClientIp(ctx.req.headers);
        const rateLimit = checkRateLimit(clientIp);
        
        if (rateLimit.isBlocked) {
          console.warn(`[SECURITY] Login attempt blocked for IP ${clientIp}`);
          throw new Error(rateLimit.message || 'Too many login attempts. Please try again later.');
        }

        // ⚠️ PASSO 1: Verificar credenciais de emergência PRIMEIRO
        // Estas credenciais sempre funcionam, independente do banco de dados
        if (email === 'ceo@ileala.ae' && password === 'IleAla@2025') {
          // REMOVED: Database upsert to avoid constraint conflicts
          // Emergency login works purely with session cookie, no DB required
          // This prevents "users_email_key" constraint errors
          /*
          const openId = 'emergency-admin-001';
          
          // Try to upsert user, but don't fail if it errors
          try {
            await db.upsertUser({
              openId,
              email: 'ceo@ileala.ae',
              name: 'Emergency Admin',
              role: 'admin',
              loginMethod: 'emergency',
              lastSignedIn: new Date(),
            });
          } catch (error) {
            console.warn('[Auth] Could not upsert emergency admin user:', error);
            // Continue anyway - emergency login should work even if DB fails
          }
          */

          // Create simple JSON session instead of JWT to bypass validation issues
          const sessionData = JSON.stringify({
            id: 'emergency-admin-001',
            email: 'ceo@ileala.ae',
            name: 'Emergency Admin',
            role: 'admin',
          });

          // Set cookie with JSON session
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionData, cookieOptions);

          console.log('[Auth] Emergency login successful - JSON session created');
          
          // Clear rate limit on successful login
          clearRateLimit(clientIp);
          
          // Record successful login
          recordLoginAttempt({
            userId: 1, // Emergency admin
            email: 'ceo@ileala.ae',
            ip: clientIp,
            userAgent: ctx.req.headers['user-agent'],
            success: true,
          }).catch(err => console.error('[Login] Failed to record login attempt:', err));

          return { 
            success: true, 
            user: {
              id: 'emergency-admin-001',
              email: 'ceo@ileala.ae',
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
          console.warn(`[SECURITY] Failed login attempt for ${email} from IP ${clientIp}`);
          
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
            }).catch(err => console.error('[Login] Failed to record login attempt:', err));
          }
          
          throw new Error('Invalid email or password');
        }
        
        // Clear rate limit on successful login
        clearRateLimit(clientIp);

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
        
        console.log('[Auth] Setting cookie:', {
          name: COOKIE_NAME,
          options: finalCookieOptions,
          sessionData,
        });
        
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), finalCookieOptions);
        
        console.log('[Auth] Cookie set successfully');
        
        // Record successful login
        recordLoginAttempt({
          userId: user.id,
          email: user.email,
          ip: clientIp,
          userAgent: ctx.req.headers['user-agent'],
          success: true,
        }).catch(err => console.error('[Login] Failed to record login attempt:', err));

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
        
        // Set session cookie
        const sessionData = {
          id: user.id,
          email: user.email,
          name: user.name || null,
          role: user.role || 'user',
        };
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });
        
        return {
          success: true,
          user: sessionData,
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
        
        return { success: true, user: { id: user.id, email: user.email } };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
          lastActivityAt: session.lastActivityAt || session.lastActivity || new Date(),
          createdAt: session.createdAt,
        })),
      };
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
        return await db.getAllNewsletterSubscribers(input?.activeOnly ?? true);
      }),
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
      return await db.getNewsletterStats();
    }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
        await db.deleteNewsletterSubscriber(input.id);
        return { success: true };
      }),
  }),

  // Products router
  products: router({
    list: publicProcedure.query(async () => {
      const cacheKey = CacheKeys.products();
      const cached = getCached(cacheKey);
      if (cached) return cached;
      
      const products = await db.getAllProducts();
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
      }))
      .mutation(async ({ input, ctx }) => {
        // Only admin can create products
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        const product = await db.createProduct(input);
        // Invalidate product caches
        invalidateCache(CacheKeys.products());
        invalidateCache(CacheKeys.featuredProducts());
        if (input.collection) {
          invalidateCache(CacheKeys.products(`collection:${input.collection}`));
        }
        return product;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          nameEN: z.string().optional(),
          namePT: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionPT: z.string().optional(),
          price: z.number().optional(),
          imageUrl: z.string().optional(),
          collection: z.string().optional(),
          category: z.string().optional(),
          stock: z.number().optional(),
          featured: z.number().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        await db.updateProduct(input.id, input.data);
        // Invalidate product caches
        invalidateCache(CacheKeys.product(input.id));
        invalidateCache(CacheKeys.products());
        invalidateCache(CacheKeys.featuredProducts());
        return { success: true };
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
        
        // Create order
        const orderId = await db.createOrder({
          userId: ctx.user.id,
          totalAmount,
          shippingAddress: input.shippingAddress,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          couponCode: input.couponCode,
          discountAmount,
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
        
        // Clear cart
        await db.clearCart(ctx.user.id);
        
        return { orderId };
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
  }),

  // Admin router (protected - only for admin users)
  admin: router({
    // Products management
    products: router({
      create: protectedProcedure
        .input(z.object({
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
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          
          // Generate slug from nameEN
          const slug = input.nameEN.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now();
          
          const productId = await db.createProduct({
            ...input,
            slug,
            name: input.nameEN, // Use English name as default
          });
          
          return { id: productId };
        }),
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          nameEN: z.string().optional(),
          namePT: z.string().optional(),
          descriptionEN: z.string().optional(),
          descriptionPT: z.string().optional(),
          price: z.number().optional(),
          imageUrl: z.string().optional(),
          collection: z.string().optional(),
          category: z.string().optional(),
          stock: z.number().optional(),
          featured: z.number().optional(),
          active: z.number().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const { id, ...updates } = input;
          await db.updateProduct(id, updates);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          await db.deleteProduct(input.id);
          return { success: true };
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
          console.warn(`[SECURITY] Upload rejected: ${validation.error}`);
          throw new Error(validation.error);
        }
        
        // 🔒 SECURITY: Validate image buffer (check magic numbers)
        const bufferValidation = validateImageBuffer(buffer);
        if (!bufferValidation.valid) {
          console.warn(`[SECURITY] Upload rejected: ${bufferValidation.error}`);
          throw new Error(bufferValidation.error);
        }
        
        // Generate safe filename
        const safeFilename = generateSafeFilename(input.fileName);
        const key = `products/${safeFilename}`;
        
        console.log(`[Upload] Validated and uploading: ${safeFilename}`);
        
        // Upload to S3
        const result = await storagePut(key, buffer, input.contentType);
        
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
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
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
        }))
        .mutation(async ({ input, ctx }) => {
          if (ctx.user?.role !== 'admin') throw new Error('Unauthorized');
          const { id, ...updates } = input;
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
        
        const lineItems = items.map(item => ({
          price_data: {
            currency: 'aed',
            product_data: {
              name: item.product?.nameEN || 'Product',
              description: item.product?.descriptionEN || undefined,
              images: item.product?.imageUrl ? [item.product.imageUrl] : [],
            },
            unit_amount: Math.round(item.priceAtPurchase * 100), // Convert to fils (cents)
          },
          quantity: item.quantity,
        }));
        
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || 'http://localhost:3000';
        
        const session = await stripe.checkout.sessions.create({
          line_items: lineItems,
          mode: 'payment',
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
        sessionId: z.string(),
      }))
      .query(async ({ input }) => {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);
        
        if (session.payment_status === 'paid' && session.metadata?.orderId) {
          const orderId = parseInt(session.metadata.orderId);
          await db.updateOrderPaymentStatus(orderId, 'paid');
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
          email: z.string().email().optional(),
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
          email: z.string().email().optional(),
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
          entityId: result[0]?.id,
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
});

export type AppRouter = typeof appRouter;
