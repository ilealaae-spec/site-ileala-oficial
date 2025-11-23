import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from 'stripe';
import { storagePut } from './storage';
import { sdk } from "./_core/sdk";

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
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // Verify credentials
        const user = await db.verifyUserCredentials(email, password);
        
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Create session data
        const sessionData = {
          id: user.id,
          email: user.email,
          name: user.name || null,
          role: user.role || 'user',
        };

        // Set cookie with session data
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, JSON.stringify(sessionData), {
          ...cookieOptions,
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });

        return { success: true, user: sessionData };
      }),
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
        email: z.string().email(),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.subscribeToNewsletter(input.email, input.name);
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
      return await db.getAllProducts();
    }),
    featured: publicProcedure.query(async () => {
      return await db.getFeaturedProducts();
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductBySlug(input.slug);
      }),
    byCollection: publicProcedure
      .input(z.object({ collection: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductsByCollection(input.collection);
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
        return await db.createProduct(input);
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
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new Error('Unauthorized');
        }
        await db.deleteProduct(input.id);
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
        productId: z.number(),
        quantity: z.number().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Not authenticated');
        return await db.addToCart(ctx.user.id, input.productId, input.quantity);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.number().min(0),
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
        code: z.string(),
        orderTotal: z.number(),
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
          productId: z.number(),
          quantity: z.number(),
          price: z.number(),
        })),
        shippingAddress: z.string(),
        customerName: z.string(),
        customerEmail: z.string(),
        customerPhone: z.string().optional(),
        couponCode: z.string().optional(),
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
});

export type AppRouter = typeof appRouter;
