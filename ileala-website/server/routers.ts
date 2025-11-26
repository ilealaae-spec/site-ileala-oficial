import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from 'stripe';
import { storagePut } from './storage';
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
    login: publicProcedure
      .input(z.object({
        email: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // Hardcoded emergency credentials
        if (email === 'ceo@ileala.ae' && password === 'IleAla@2025') {
          // Create or update admin user
          const openId = 'emergency-admin-001';
          await db.upsertUser({
            openId,
            email,
            name: 'Emergency Admin',
            role: 'admin',
            loginMethod: 'emergency',
            lastSignedIn: new Date(),
          });

          // Create session
          const token = await sdk.createSessionToken(openId, {
            name: 'Emergency Admin',
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

          return { success: true };
        }

        throw new Error('Invalid credentials');
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        email: emailSchema,
        password: z.string().min(1, 'Password is required'),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // Check for emergency admin credentials first
        if (email === 'ceo@ileala.ae' && password === 'IleAla@2025') {
          // Create or update emergency admin user
          const openId = 'emergency-admin-001';
          await db.upsertUser({
            openId,
            email,
            name: 'Emergency Admin',
            role: 'admin',
            loginMethod: 'emergency',
            lastSignedIn: new Date(),
          });

          // Get the user from database to get the ID
          const emergencyUser = await db.getUserByEmail(email);
          
          if (emergencyUser) {
            // Create session data
            const sessionData = {
              id: emergencyUser.id,
              email: emergencyUser.email,
              name: emergencyUser.name || 'Emergency Admin',
              role: 'admin',
              loginMethod: 'emergency',
            };

            // Set cookie
            const cookieOptions = getSessionCookieOptions(ctx.req);
            const finalCookieOptions = {
              ...cookieOptions,
              maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            };
            
            ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), finalCookieOptions);

            return { 
              success: true, 
              user: {
                id: emergencyUser.id,
                email: emergencyUser.email,
                name: emergencyUser.name || 'Emergency Admin',
                role: 'admin',
              }
            };
          }
        }

        // Verify credentials
        const user = await db.verifyUserCredentials(email, password);
        
        if (!user) {
          throw new Error('Invalid email or password');
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
        
        console.log('[Auth] Setting cookie:', {
          name: COOKIE_NAME,
          options: finalCookieOptions,
          sessionData,
        });
        
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), finalCookieOptions);
        
        console.log('[Auth] Cookie set successfully');

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
        
        // Generate unique filename
        const timestamp = Date.now();
        const ext = input.fileName.split('.').pop();
        const key = `products/${timestamp}-${input.fileName}`;
        
        // Upload to S3
        const result = await storagePut(key, buffer, input.contentType);
        
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
});

export type AppRouter = typeof appRouter;
