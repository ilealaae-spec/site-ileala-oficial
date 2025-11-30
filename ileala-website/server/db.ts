import { eq, sql } from "drizzle-orm";
// Newsletter fix: omit name field if undefined - Build v2
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, products, Product, InsertProduct, orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, cartItems, CartItem, InsertCartItem, coupons, Coupon, InsertCoupon, newsletter, Newsletter, InsertNewsletter, categories, Category, InsertCategory, collections, Collection, InsertCollection, siteSettings, SiteSetting, InsertSiteSetting, auditLogs, AuditLog, InsertAuditLog } from "../drizzle/schema";
import { ENV } from './_core/env';
import { logger } from './_core/logger';

let _db: ReturnType<typeof drizzle> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _sql = postgres(process.env.DATABASE_URL, {
        ssl: 'require'
      });
      _db = drizzle(_sql);
    } catch (error) {
      logger.warn("[Database] Failed to connect:", error);
      _db = null;
      _sql = null;
    }
  }
  return _db;
}

export async function getSql() {
  if (!_sql && !_db) {
    await getDb();
  }
  return _sql;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    logger.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== PRODUCTS =====

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.active, 1));
}

export async function getFeaturedProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.featured, 1)).limit(8);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByCollection(collection: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.collection, collection));
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.category, category));
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product).returning({ id: products.id });
  return result[0].id;
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ active: 0 }).where(eq(products.id, id));
}

// ===== CART =====

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
  
  return items;
}

export async function addToCart(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if item already exists in cart
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);
  
  if (existing.length > 0) {
    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
    return existing[0].id;
  } else {
    // Insert new item
    const result = await db.insert(cartItems).values({
      userId,
      productId,
      quantity,
    }).returning({ id: cartItems.id });
    return result[0].id;
  }
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ===== ORDERS =====

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order).returning({ id: orders.id });
  return result[0].id;
}

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(item).returning({ id: orderItems.id });
  return result[0].id;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
      product: products,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
  
  return items;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ 
    paymentStatus: paymentStatus as any,
    paymentIntentId 
  }).where(eq(orders.id, id));
}

// ===== COUPONS =====

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function validateCoupon(code: string, orderTotal: number): Promise<{ valid: boolean; message?: string; coupon?: Coupon }> {
  const coupon = await getCouponByCode(code);
  
  if (!coupon) {
    return { valid: false, message: 'Coupon not found' };
  }
  
  if (coupon.active === 0) {
    return { valid: false, message: 'Coupon is inactive' };
  }
  
  // Check if coupon has expired
  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return { valid: false, message: 'Coupon has expired' };
  }
  
  // Check if coupon hasn't started yet
  if (new Date(coupon.validFrom) > new Date()) {
    return { valid: false, message: 'Coupon is not yet valid' };
  }
  
  // Check max uses
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, message: 'Coupon has reached maximum uses' };
  }
  
  // Check minimum purchase amount
  if (orderTotal < coupon.minPurchaseAmount) {
    const minAmount = (coupon.minPurchaseAmount / 100).toFixed(2);
    return { valid: false, message: `Minimum purchase of ${minAmount} AED required` };
  }
  
  return { valid: true, coupon };
}

export async function calculateDiscount(coupon: Coupon, orderTotal: number): Promise<number> {
  if (coupon.discountType === 'percentage') {
    return Math.floor((orderTotal * coupon.discountValue) / 100);
  } else {
    // Fixed amount discount
    return Math.min(coupon.discountValue, orderTotal);
  }
}

export async function incrementCouponUsage(code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const coupon = await getCouponByCode(code);
  if (!coupon) return;
  
  await db.update(coupons).set({ 
    usedCount: coupon.usedCount + 1 
  }).where(eq(coupons.code, code));
}

// ===== ADMIN FUNCTIONS =====

export async function getAllCoupons() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coupons);
}

export async function createCoupon(coupon: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(coupons).values(coupon).returning({ id: coupons.id });
  return result[0].id;
}

export async function updateCoupon(id: number, coupon: Partial<InsertCoupon>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(coupons).set(coupon).where(eq(coupons.id, id));
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(coupons).where(eq(coupons.id, id));
}

// ===== LOCAL AUTHENTICATION =====

export async function getUserByEmail(email: string) {
    logger.debug('[getUserByEmail] Called with email:', email);
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    logger.debug('[getUserByEmail] Executing query...');
    logger.debug('[getUserByEmail] Database object type:', typeof db);
    logger.debug('[getUserByEmail] Database object keys:', Object.keys(db).slice(0, 5));
    logger.debug('[getUserByEmail] Users table:', typeof users);
    logger.debug('[getUserByEmail] Email to search:', email);
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    logger.debug('[getUserByEmail] Query successful, result count:', result.length);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    logger.error('[getUserByEmail] Query failed!', error);
    if (error instanceof Error) {
      logger.error('[getUserByEmail] Error details:', { message: error.message, stack: error.stack });
    }
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: { 
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
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Hash password with bcrypt
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await db.insert(users).values({
    email: data.email,
    name: data.name,
    password: hashedPassword,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    poBox: data.poBox,
    country: data.country,
    loginMethod: 'local',
    role: 'user',
    lastSignedIn: new Date(),
  }).returning({ id: users.id });

  return result[0].id;
}

export async function verifyUserCredentials(email: string, password: string) {
  const db = await getDb();
  if (!db) {
    logger.warn("[Database] Cannot verify credentials: database not available");
    return null;
  }

  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }

  // Verify password with bcrypt
  const bcrypt = await import('bcryptjs');
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  // Update last signed in
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

  return user;
}

// Email verification functions
export async function generateEmailVerificationToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Generate random token
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Update user with token
  await db.update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt,
    })
    .where(eq(users.id, userId));

  return token;
}

export async function verifyEmailToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find user with this token
  const result = await db.select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // Check if token is expired
  if (!user.emailVerificationExpires || new Date() > user.emailVerificationExpires) {
    return null;
  }

  // Mark email as verified and clear token
  await db.update(users)
    .set({
      emailVerified: 1,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    })
    .where(eq(users.id, user.id));

  return user;
}

// ===== PASSWORD RESET =====

export async function generatePasswordResetToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Generate random token
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 1 hour
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Update user with token
  await db.update(users)
    .set({
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    })
    .where(eq(users.id, userId));

  return token;
}

export async function verifyPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find user with this token
  const result = await db.select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];

  // Check if token is expired
  if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
    return null;
  }

  return user;
}

export async function invalidatePasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Clear the token
  await db.update(users)
    .set({
      passwordResetToken: null,
      passwordResetExpires: null,
    })
    .where(eq(users.passwordResetToken, token));
}

export async function updateUserPassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Hash the new password
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password
  await db.update(users)
    .set({
      password: hashedPassword,
    })
    .where(eq(users.id, userId));
}

export async function updateUser(userId: number, data: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  poBox?: string;
  country?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.poBox !== undefined) updateData.poBox = data.poBox;
  if (data.country !== undefined) updateData.country = data.country;

  await db.update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const allUsers = await db.select().from(users);
  return allUsers;
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Delete user's related data first
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
  await db.delete(orders).where(eq(orders.userId, userId));
  
  // Delete the user
  await db.delete(users).where(eq(users.id, userId));
  
  return { success: true };
}

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users)
    .set({ role })
    .where(eq(users.id, userId));
  
  return { success: true };
}


// ===== CATEGORIES =====

export async function getAllCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(categories).orderBy(categories.displayOrder);
  console.log('[DEBUG] getAllCategories result:', JSON.stringify(result, null, 2));
  return result;
}

export async function getActiveCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.displayOrder);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(categories).where(eq(categories.id, id));
  return result[0] || null;
}

export async function createCategory(data: Omit<InsertCategory, 'parentId' | 'id' | 'createdAt' | 'updatedAt'>) {
  const sql = await getSql();
  if (!sql) throw new Error("Database not available");
  
  // Use SQL raw to avoid Drizzle including all schema fields
  const result = await sql`
    INSERT INTO categories (slug, "nameEN", "namePT", "descriptionEN", "descriptionPT", "imageUrl", "displayOrder", active)
    VALUES (
      ${data.slug},
      ${data.nameEN},
      ${data.namePT},
      ${data.descriptionEN || null},
      ${data.descriptionPT || null},
      ${data.imageUrl || null},
      ${data.displayOrder || 0},
      ${data.active ?? 1}
    )
    RETURNING *
  `;
  
  return result[0] as Category;
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  return result[0];
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}


// ===== COLLECTIONS =====

export async function getAllCollections() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(collections).orderBy(collections.displayOrder);
}

export async function getActiveCollections() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(collections)
    .where(eq(collections.active, true))
    .orderBy(collections.displayOrder);
}

export async function getCollectionById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(collections).where(eq(collections.id, id));
  return result[0] || null;
}

export async function createCollection(data: InsertCollection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(collections).values(data).returning();
  return result[0];
}

export async function updateCollection(id: number, data: Partial<InsertCollection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(collections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(collections.id, id))
    .returning();
  return result[0];
}

export async function deleteCollection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(collections).where(eq(collections.id, id));
  return { success: true };
}


// ===== SITE SETTINGS =====

export async function getAllSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(siteSettings);
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return result[0] || null;
}

export async function upsertSetting(key: string, value: string, description?: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSettingByKey(key);
  
  if (existing) {
    await db.update(siteSettings)
      .set({ value, description, category, updatedAt: new Date() })
      .where(eq(siteSettings.key, key));
  } else {
    await db.insert(siteSettings).values({ key, value, description, category });
  }
  
  return { success: true };
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(siteSettings).where(eq(siteSettings.key, key));
  return { success: true };
}


// ===== NEWSLETTER =====

export async function subscribeToNewsletter(email: string, name?: string, source: string = 'website') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    logger.info('[Newsletter] Attempting to subscribe:', { email, name: name ? 'provided' : 'not provided', source });
    
    // Check if already subscribed
    const existing = await getNewsletterSubscriberByEmail(email);
    if (existing && existing.active === 1) {
      throw new Error('Email already subscribed');
    }
    
    // If exists but inactive, reactivate
    if (existing && existing.active === 0) {
      await db.update(newsletter)
        .set({ 
          active: 1, 
          source,
          ...(name && name.trim() ? { name: name.trim() } : {}),
        })
        .where(eq(newsletter.email, email));
      logger.info('[Newsletter] Reactivated existing subscription');
      return { success: true };
    }
    
    // Insert new subscription using Drizzle
    await db.insert(newsletter).values({
      email,
      name: name && name.trim() ? name.trim() : null,
      source,
      active: 1,
      subscribedAt: new Date(),
    });
    
    logger.info('[Newsletter] Successfully inserted');
    return { success: true };
  } catch (error: any) {
    logger.error('[Newsletter] Error inserting:', error);
    if (error && typeof error === 'object' && 'code' in error) {
      logger.error('[Newsletter] Error details:', { code: error.code, message: error.message, detail: error.detail });
    }
    // Check if it's a duplicate email error
    if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
      throw new Error('Email already subscribed');
    }
    throw error;
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(newsletter)
    .set({ active: 0 })
    .where(eq(newsletter.email, email));
  
  return { success: true };
}

export async function getAllNewsletterSubscribers(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  
  if (activeOnly) {
    return db.select().from(newsletter).where(eq(newsletter.active, 1));
  }
  
  return db.select().from(newsletter);
}

export async function getNewsletterSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(newsletter).where(eq(newsletter.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteNewsletterSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(newsletter).where(eq(newsletter.id, id));
  return { success: true };
}

export async function getNewsletterStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, inactive: 0 };
  
  const all = await db.select().from(newsletter);
  const active = all.filter(s => s.active === 1);
  const inactive = all.filter(s => s.active === 0);
  
  return {
    total: all.length,
    active: active.length,
    inactive: inactive.length,
  };
}

// ==================== CMS Functions ====================

// Artisans functions
export async function listArtisans() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const { artisans } = await import("../drizzle/schema");
    const result = await db.select().from(artisans).orderBy(artisans.createdAt);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list artisans:", error);
    return [];
  }
}

export async function createArtisan(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { artisans } = await import("../drizzle/schema");
    const result = await db.insert(artisans).values(data).returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create artisan:", error);
    throw error;
  }
}

export async function updateArtisan(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { artisans } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.update(artisans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(artisans.id, id))
      .returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to update artisan:", error);
    throw error;
  }
}

export async function deleteArtisan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { artisans } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(artisans).where(eq(artisans.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete artisan:", error);
    throw error;
  }
}

// Site content functions
export async function listSiteContent() {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const { siteContent } = await import("../drizzle/schema");
    const result = await db.select().from(siteContent).orderBy(siteContent.key);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list site content:", error);
    return [];
  }
}

export async function getSiteContentByKey(key: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const { siteContent } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.select().from(siteContent).where(eq(siteContent.key, key)).limit(1);
    return result[0] || null;
  } catch (error) {
    logger.error("[Database] Failed to get site content by key:", error);
    return null;
  }
}

export async function upsertSiteContent(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { siteContent } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    // Check if content with this key exists
    const existing = await getSiteContentByKey(data.key);
    
    if (existing) {
      // Update existing
      const result = await db.update(siteContent)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(siteContent.id, existing.id))
        .returning();
      return result[0];
    } else {
      // Insert new
      const result = await db.insert(siteContent).values(data).returning();
      return result[0];
    }
  } catch (error) {
    logger.error("[Database] Failed to upsert site content:", error);
    throw error;
  }
}

export async function deleteSiteContent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { siteContent } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(siteContent).where(eq(siteContent.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete site content:", error);
    throw error;
  }
}


// Media management functions
export async function getAllMedia() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { media } = await import("../drizzle/schema");
    const result = await db.select().from(media).orderBy(media.createdAt);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to get all media:", error);
    throw error;
  }
}

export async function createMedia(data: {
  url: string;
  filename: string;
  type: string;
  folder?: string;
  altText?: string;
  caption?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { media } = await import("../drizzle/schema");
    const result = await db.insert(media).values({
      url: data.url,
      filename: data.filename,
      type: data.type,
      folder: data.folder || null,
      altText: data.altText || null,
      caption: data.caption || null,
      createdAt: new Date(),
    }).returning();
    
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create media:", error);
    throw error;
  }
}

export async function deleteMedia(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { media } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(media).where(eq(media.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete media:", error);
    throw error;
  }
}
