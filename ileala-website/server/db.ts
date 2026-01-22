import { eq, sql, and } from 'drizzle-orm';
// Newsletter fix: omit name field if undefined - Build v2
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, products, Product, InsertProduct, orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, cartItems, CartItem, InsertCartItem, coupons, Coupon, InsertCoupon, newsletter, Newsletter, InsertNewsletter, categories, Category, InsertCategory, collections, Collection, InsertCollection, siteSettings, SiteSetting, InsertSiteSetting, auditLogs, AuditLog, InsertAuditLog, wishlist, WishlistItem, InsertWishlistItem, emailCampaigns, EmailCampaign, InsertEmailCampaign, giftCards, GiftCard, InsertGiftCard, loyaltyMembers, LoyaltyMember, InsertLoyaltyMember, loyaltyTierBenefits, LoyaltyTierBenefit, loyaltyActivityLog, LoyaltyActivityLog, InsertLoyaltyActivityLog } from "../drizzle/schema";
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
  return db.select().from(products)
    .where(and(
      sql`lower(${products.collection}) = lower(${collection})`,
      eq(products.active, 1)
    ));
}

export async function getProductsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(
      sql`lower(${products.category}) = lower(${category})`,
      eq(products.active, 1)
    ));
}

// v8: Product creation using raw SQL that queries actual columns first
// Updated: 2026-01-16 - Dynamically get columns from database
export async function createProduct(product: InsertProduct) {
  const sqlClient = await getSql();
  if (!sqlClient) {
    console.error('[DB] v8: Database not available for createProduct');
    throw new Error("Database not available");
  }

  // Helper to convert boolean to integer
  const boolToInt = (val: any, defaultVal: number = 0): number => {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'boolean') return val ? 1 : 0;
    return Number(val) || defaultVal;
  };

  // Build clean product object - explicitly remove id if present
  const { id, createdAt, updatedAt, ...inputProduct } = product as any;
  const p = inputProduct;

  console.log('[DB] v8: Creating product:', p.name || p.nameEN);

  try {
    // First, get the actual columns from the database
    const columnsResult = await sqlClient`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `;

    const dbColumns = columnsResult.map((r: any) => r.column_name);
    console.log('[DB] v8: Database columns:', dbColumns.join(', '));
    console.log('[DB] v8: Total columns in DB:', dbColumns.length);

    // Build the data object with all possible values
    const allData: Record<string, any> = {
      slug: p.slug,
      name: p.name || p.nameEN,
      nameEN: p.nameEN,
      namePT: p.namePT,
      descriptionEN: p.descriptionEN || null,
      descriptionPT: p.descriptionPT || null,
      price: p.price,
      imageUrl: p.imageUrl || null,
      mainImage: p.mainImage || null,
      mainImageAlt: p.mainImageAlt || null,
      images: p.images || null,
      salePrice: p.salePrice || null,
      descriptionEN_full: p.descriptionEN_full || null,
      descriptionPT_full: p.descriptionPT_full || null,
      material: p.material || null,
      dimensions: p.dimensions || null,
      colors: p.colors || null,
      careInstructionsEN: p.careInstructionsEN || null,
      careInstructionsPT: p.careInstructionsPT || null,
      weight: p.weight != null ? Math.round(Number(p.weight)) : null,
      sku: p.sku || null,
      inStock: boolToInt(p.inStock, 1),
      stockQuantity: boolToInt(p.stockQuantity, 0),
      isNew: boolToInt(p.isNew, 0),
      onSale: boolToInt(p.onSale, 0),
      seoTitle: p.seoTitle || null,
      seoDescription: p.seoDescription || null,
      collection: p.collection || null,
      category: p.category || null,
      stock: boolToInt(p.stock, 0),
      featured: boolToInt(p.featured, 0),
      active: boolToInt(p.active, 1),
      // Don't include createdAt/updatedAt - let database use defaults
    };

    // Filter to only include columns that exist in the database (except id, createdAt, updatedAt - let DB use defaults)
    const excludeCols = ['id', 'createdAt', 'updatedAt'];
    const columnsToInsert = dbColumns.filter((col: string) => !excludeCols.includes(col) && allData[col] !== undefined);
    const values = columnsToInsert.map((col: string) => allData[col]);

    // For columns in DB but not in our data, we need to provide null or defaults
    const missingCols = dbColumns.filter((col: string) => !excludeCols.includes(col) && allData[col] === undefined);
    if (missingCols.length > 0) {
      console.log('[DB] v8: Columns in DB but not in our data:', missingCols.join(', '));
      // Add null for missing columns
      missingCols.forEach((col: string) => {
        columnsToInsert.push(col);
        values.push(null);
      });
    }

    // Build the INSERT query dynamically
    const columnNames = columnsToInsert.map((col: string) => `"${col}"`).join(', ');
    const placeholders = columnsToInsert.map((_: string, i: number) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO products (${columnNames}) VALUES (${placeholders}) RETURNING id`;

    console.log('[DB] v8: Inserting with', columnsToInsert.length, 'columns');

    const result = await sqlClient.unsafe(query, values);

    if (!result || result.length === 0) {
      throw new Error('Product insertion returned no ID');
    }

    console.log('[DB] Product created successfully with ID:', result[0].id);
    return result[0].id;
  } catch (error) {
    console.error('[DB] Error creating product:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) {
    logger.error("[DB] Database not available for updateProduct");
    throw new Error("Database not available");
  }
  logger.info("[DB] Updating product:", { id, updates: Object.keys(product), imageUrl: product.imageUrl, active: product.active });
  try {
    await db.update(products).set(product).where(eq(products.id, id));
    logger.info("[DB] Product updated successfully:", { id });
    
    // Verify the update
    const updatedProduct = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (updatedProduct.length > 0) {
      logger.info("[DB] Product verification after update:", {
        id: updatedProduct[0].id,
        name: updatedProduct[0].name,
        imageUrl: updatedProduct[0].imageUrl,
        active: updatedProduct[0].active,
      });
    } else {
      logger.error("[DB] WARNING: Product not found after update!", { id });
    }
  } catch (error) {
    logger.error("[DB] Failed to update product:", error);
    throw error;
  }
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
      productId: cartItems.productId,
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

// ===== GIFT CARDS =====

/**
 * Generate a unique gift card code in format GC-XXXXXXXXXXXX
 */
export function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GC-';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new gift card
 */
export async function createGiftCard(data: {
  amount: number;
  recipientEmail: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  deliveryType: 'immediate' | 'scheduled';
  scheduledDate?: Date;
  purchasedBy?: number;
  orderId?: number;
}): Promise<{ id: number; code: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate unique code
  let code = generateGiftCardCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db.select().from(giftCards).where(eq(giftCards.code, code)).limit(1);
    if (existing.length === 0) break;
    code = generateGiftCardCode();
    attempts++;
  }

  // Set validity to 1 year from now
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  const result = await db.insert(giftCards).values({
    code,
    amount: data.amount,
    balanceRemaining: data.amount,
    status: 'pending', // Will be activated after payment
    recipientEmail: data.recipientEmail,
    recipientName: data.recipientName || null,
    senderName: data.senderName || null,
    message: data.message || null,
    deliveryType: data.deliveryType,
    scheduledDate: data.scheduledDate || null,
    purchasedBy: data.purchasedBy || null,
    orderId: data.orderId || null,
    validUntil,
  }).returning({ id: giftCards.id });

  return { id: result[0].id, code };
}

/**
 * Get gift card by code
 */
export async function getGiftCardByCode(code: string): Promise<GiftCard | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(giftCards).where(eq(giftCards.code, code.toUpperCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get gift card by ID
 */
export async function getGiftCardById(id: number): Promise<GiftCard | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(giftCards).where(eq(giftCards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Validate a gift card for use in checkout
 */
export async function validateGiftCard(code: string): Promise<{
  valid: boolean;
  message?: string;
  giftCard?: GiftCard;
}> {
  const giftCard = await getGiftCardByCode(code);

  if (!giftCard) {
    return { valid: false, message: 'Gift card not found' };
  }

  if (giftCard.status !== 'active') {
    if (giftCard.status === 'pending') {
      return { valid: false, message: 'Gift card payment not completed' };
    }
    if (giftCard.status === 'used') {
      return { valid: false, message: 'Gift card has been fully used' };
    }
    if (giftCard.status === 'expired') {
      return { valid: false, message: 'Gift card has expired' };
    }
    if (giftCard.status === 'cancelled') {
      return { valid: false, message: 'Gift card has been cancelled' };
    }
    return { valid: false, message: 'Gift card is not active' };
  }

  // Check expiration
  if (giftCard.validUntil && new Date() > new Date(giftCard.validUntil)) {
    // Update status to expired
    await updateGiftCardStatus(giftCard.id, 'expired');
    return { valid: false, message: 'Gift card has expired' };
  }

  // Check balance
  if (giftCard.balanceRemaining <= 0) {
    await updateGiftCardStatus(giftCard.id, 'used');
    return { valid: false, message: 'Gift card has no remaining balance' };
  }

  return { valid: true, giftCard };
}

/**
 * Apply gift card to an order - deducts from balance
 */
export async function applyGiftCard(
  code: string,
  amountToUse: number,
  orderId: number,
  userId?: number
): Promise<{ success: boolean; amountApplied: number; remainingBalance: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const validation = await validateGiftCard(code);
  if (!validation.valid || !validation.giftCard) {
    return { success: false, amountApplied: 0, remainingBalance: 0 };
  }

  const giftCard = validation.giftCard;
  const amountApplied = Math.min(amountToUse, giftCard.balanceRemaining);
  const newBalance = giftCard.balanceRemaining - amountApplied;

  // Update gift card balance
  await db.update(giftCards).set({
    balanceRemaining: newBalance,
    status: newBalance <= 0 ? 'used' : 'active',
    redeemedBy: userId || giftCard.redeemedBy,
    updatedAt: new Date(),
  }).where(eq(giftCards.id, giftCard.id));

  return {
    success: true,
    amountApplied,
    remainingBalance: newBalance,
  };
}

/**
 * Activate a gift card (after payment is confirmed)
 */
export async function activateGiftCard(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.update(giftCards).set({
    status: 'active',
    purchasedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(giftCards.id, id));

  return true;
}

/**
 * Update gift card status
 */
export async function updateGiftCardStatus(id: number, status: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(giftCards).set({
    status,
    updatedAt: new Date(),
  }).where(eq(giftCards.id, id));
}

/**
 * Mark gift card as delivered (email sent)
 */
export async function markGiftCardDelivered(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(giftCards).set({
    deliveredAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(giftCards.id, id));
}

/**
 * Get all gift cards (for admin)
 */
export async function getAllGiftCards(): Promise<GiftCard[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(giftCards).orderBy(sql`${giftCards.createdAt} DESC`);
}

/**
 * Get gift cards that need to be delivered (scheduled and past delivery date)
 */
export async function getPendingScheduledGiftCards(): Promise<GiftCard[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db.select().from(giftCards).where(
    and(
      eq(giftCards.status, 'active'),
      eq(giftCards.deliveryType, 'scheduled'),
      sql`${giftCards.scheduledDate} <= ${now}`,
      sql`${giftCards.deliveredAt} IS NULL`
    )
  );
}

/**
 * Cancel a gift card (admin action)
 */
export async function cancelGiftCard(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await db.update(giftCards).set({
    status: 'cancelled',
    updatedAt: new Date(),
  }).where(eq(giftCards.id, id));

  return true;
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
    if (result.length > 0) {
      logger.debug('[getUserByEmail] User fields:', Object.keys(result[0]));
      logger.debug('[getUserByEmail] twoFactorEnabled value:', result[0].twoFactorEnabled);
    }
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
    .where(eq(categories.active, 1)) // active is integer: 0 = inactive, 1 = active
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
    .where(eq(collections.active, 1)) // active is integer: 0 = inactive, 1 = active
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
    const isActive = existing && (existing.active === 1 || existing.active === true);
    if (isActive) {
      throw new Error('Email already subscribed');
    }

    // If exists but inactive, reactivate
    if (existing && !isActive) {
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
    // Generate UUID for id since the DB column uses UUID type
    await db.insert(newsletter).values({
      id: crypto.randomUUID(),
      email,
      name: name && name.trim() ? name.trim() : null,
      source,
      active: 1,
      subscribedAt: new Date(),
    } as any);
    
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

  // Get all and filter in JS since the DB uses boolean but schema uses integer
  const all = await db.select().from(newsletter);
  if (activeOnly) {
    return all.filter((s: any) => s.active === true || s.active === 1);
  }

  return all;
}

export async function getNewsletterSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(newsletter).where(eq(newsletter.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteNewsletterSubscriber(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(newsletter).where(eq(newsletter.id, id as any));
  return { success: true };
}

export async function getNewsletterStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, inactive: 0 };

  const all = await db.select().from(newsletter);
  const active = all.filter((s: any) => s.active === true || s.active === 1);
  const inactive = all.filter((s: any) => s.active === false || s.active === 0);

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
      originalName: data.filename,
      mimeType: data.type,
      size: 0,
      folder: data.folder || 'general',
      alt: data.altText || null,
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

// ==================== Hero Slides Functions ====================

export async function listHeroSlides() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { heroSlides } = await import("../drizzle/schema");
    const result = await db.select().from(heroSlides).orderBy(heroSlides.displayOrder);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list hero slides:", error);
    return [];
  }
}

export async function listActiveHeroSlides() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { heroSlides } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.select().from(heroSlides)
      .where(eq(heroSlides.active, 1))
      .orderBy(heroSlides.displayOrder);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list active hero slides:", error);
    return [];
  }
}

export async function createHeroSlide(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { heroSlides } = await import("../drizzle/schema");
    const result = await db.insert(heroSlides).values(data).returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create hero slide:", error);
    throw error;
  }
}

export async function updateHeroSlide(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { heroSlides } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.update(heroSlides)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(heroSlides.id, id))
      .returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to update hero slide:", error);
    throw error;
  }
}

export async function deleteHeroSlide(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { heroSlides } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(heroSlides).where(eq(heroSlides.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete hero slide:", error);
    throw error;
  }
}

// ==================== Homepage Videos Functions ====================

export async function listHomepageVideos() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { homepageVideos } = await import("../drizzle/schema");
    const result = await db.select().from(homepageVideos).orderBy(homepageVideos.displayOrder);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list homepage videos:", error);
    return [];
  }
}

export async function listActiveHomepageVideos() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { homepageVideos } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.select().from(homepageVideos)
      .where(eq(homepageVideos.active, 1))
      .orderBy(homepageVideos.displayOrder);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list active homepage videos:", error);
    return [];
  }
}

export async function createHomepageVideo(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { homepageVideos } = await import("../drizzle/schema");
    const result = await db.insert(homepageVideos).values(data).returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create homepage video:", error);
    throw error;
  }
}

export async function updateHomepageVideo(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { homepageVideos } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.update(homepageVideos)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(homepageVideos.id, id))
      .returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to update homepage video:", error);
    throw error;
  }
}

export async function deleteHomepageVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { homepageVideos } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(homepageVideos).where(eq(homepageVideos.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete homepage video:", error);
    throw error;
  }
}

// ==================== Homepage Cards Functions ====================

export async function listHomepageCards() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { homepageCards } = await import("../drizzle/schema");
    const result = await db.select().from(homepageCards).orderBy(homepageCards.displayOrder);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list homepage cards:", error);
    return [];
  }
}

export async function listActiveHomepageCards() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { homepageCards } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.select().from(homepageCards)
      .where(eq(homepageCards.active, 1))
      .orderBy(homepageCards.displayOrder);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list active homepage cards:", error);
    return [];
  }
}

export async function createHomepageCard(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { homepageCards } = await import("../drizzle/schema");
    const result = await db.insert(homepageCards).values(data).returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create homepage card:", error);
    throw error;
  }
}

export async function updateHomepageCard(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { homepageCards } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.update(homepageCards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(homepageCards.id, id))
      .returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to update homepage card:", error);
    throw error;
  }
}

export async function deleteHomepageCard(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { homepageCards } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(homepageCards).where(eq(homepageCards.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete homepage card:", error);
    throw error;
  }
}

// ==================== Public Artisans Function ====================

export async function listActiveArtisans() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { artisans } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.select().from(artisans)
      .where(eq(artisans.active, 1))
      .orderBy(artisans.createdAt);
    return result;
  } catch (error) {
    logger.error("[Database] Failed to list active artisans:", error);
    return [];
  }
}

// ============================================
// Two-Factor Authentication Functions
// ============================================

export async function enable2FA(userId: number, secret: string, backupCodes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.update(users)
      .set({
        twoFactorEnabled: 1,
        twoFactorSecret: secret,
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    logger.info(`[2FA] Enabled for user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error("[2FA] Failed to enable:", error);
    throw error;
  }
}

export async function disable2FA(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.update(users)
      .set({
        twoFactorEnabled: 0,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    logger.info(`[2FA] Disabled for user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error("[2FA] Failed to disable:", error);
    throw error;
  }
}

export async function updateBackupCodes(userId: number, backupCodes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { users } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.update(users)
      .set({
        twoFactorBackupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return { success: true };
  } catch (error) {
    logger.error("[2FA] Failed to update backup codes:", error);
    throw error;
  }
}

// ============================================
// Login History Functions
// ============================================

export async function createLoginHistory(data: {
  userId: number;
  ip: string;
  userAgent: string | null;
  success: number;
  failureReason?: string | null;
  location?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { loginHistory } = await import("../drizzle/schema");
    
    const result = await db.insert(loginHistory).values({
      userId: data.userId,
      ip: data.ip,
      userAgent: data.userAgent,
      success: data.success,
      failureReason: data.failureReason || null,
      location: data.location || null,
      deviceType: data.deviceType || null,
      browser: data.browser || null,
      os: data.os || null,
      notificationSent: 0,
      createdAt: new Date(),
    }).returning();
    
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create login history:", error);
    throw error;
  }
}

export async function getRecentLoginHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { loginHistory } = await import("../drizzle/schema");
    const { eq, and, gte, sql } = await import("drizzle-orm");
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await db.select()
      .from(loginHistory)
      .where(
        and(
          eq(loginHistory.userId, userId),
          gte(loginHistory.createdAt, cutoffDate)
        )
      )
      .orderBy(sql`${loginHistory.createdAt} DESC`)
      .limit(100);
    
    return result;
  } catch (error) {
    logger.error("[Database] Failed to get login history:", error);
    return [];
  }
}

export async function getRecentFailedLogins(userId: number, hours: number = 1): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { loginHistory } = await import("../drizzle/schema");
    const { eq, and, gte, sql } = await import("drizzle-orm");
    
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(loginHistory)
      .where(
        and(
          eq(loginHistory.userId, userId),
          eq(loginHistory.success, 0),
          gte(loginHistory.createdAt, cutoffDate)
        )
      );
    
    return result[0]?.count || 0;
  } catch (error) {
    logger.error("[Database] Failed to get failed logins count:", error);
    return 0;
  }
}

export async function markLoginNotificationSent(userId: number, ip: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { loginHistory } = await import("../drizzle/schema");
    const { eq, and, sql } = await import("drizzle-orm");
    
    await db.update(loginHistory)
      .set({ notificationSent: 1 })
      .where(
        and(
          eq(loginHistory.userId, userId),
          eq(loginHistory.ip, ip)
        )
      );
    
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to mark notification sent:", error);
    throw error;
  }
}

// ============================================
// Session Management Functions
// ============================================

export async function createUserSession(data: {
  userId: number;
  sessionToken: string;
  ip: string;
  userAgent: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    
    const result = await db.insert(userSessions).values({
      userId: data.userId,
      sessionToken: data.sessionToken,
      ip: data.ip,
      userAgent: data.userAgent,
      deviceType: data.deviceType || null,
      browser: data.browser || null,
      os: data.os || null,
      expiresAt: data.expiresAt,
      lastActivity: new Date(),
      createdAt: new Date(),
    }).returning();
    
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create user session:", error);
    throw error;
  }
}

export async function getUserSession(sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    const result = await db.select()
      .from(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    logger.error("[Database] Failed to get user session:", error);
    return null;
  }
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { eq, gt, sql } = await import("drizzle-orm");
    
    const now = new Date();
    
    const result = await db.select()
      .from(userSessions)
      .where(
        eq(userSessions.userId, userId)
      )
      .orderBy(sql`${userSessions.lastActivity} DESC`);
    
    // Filter out expired sessions
    return result.filter(session => new Date(session.expiresAt) > now);
  } catch (error) {
    logger.error("[Database] Failed to get user sessions:", error);
    return [];
  }
}

export async function updateSessionActivity(sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.update(userSessions)
      .set({ lastActivity: new Date() })
      .where(eq(userSessions.sessionToken, sessionToken));
    
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to update session activity:", error);
    throw error;
  }
}

export async function deleteUserSession(sessionToken: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.delete(userSessions)
      .where(eq(userSessions.sessionToken, sessionToken));
    
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete user session:", error);
    throw error;
  }
}

export async function deleteUserSessionsExcept(userId: number, exceptToken?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { eq, and, ne } = await import("drizzle-orm");
    
    if (exceptToken) {
      await db.delete(userSessions)
        .where(
          and(
            eq(userSessions.userId, userId),
            ne(userSessions.sessionToken, exceptToken)
          )
        );
    } else {
      await db.delete(userSessions)
        .where(eq(userSessions.userId, userId));
    }
    
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete user sessions:", error);
    throw error;
  }
}

export async function deleteAllUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.delete(userSessions)
      .where(eq(userSessions.userId, userId));
    
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete all user sessions:", error);
    throw error;
  }
}

export async function deleteExpiredSessions(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { userSessions } = await import("../drizzle/schema");
    const { lt, sql } = await import("drizzle-orm");
    
    const now = new Date();
    
    const result = await db.delete(userSessions)
      .where(lt(userSessions.expiresAt, now))
      .returning({ id: userSessions.id });
    
    return result.length;
  } catch (error) {
    logger.error("[Database] Failed to delete expired sessions:", error);
    return 0;
  }
}

/**
 * Get audit logs with pagination
 */
export async function getAuditLogs(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { auditLogs } = await import("../drizzle/schema");
    const { sql } = await import("drizzle-orm");
    
    const result = await db.select()
      .from(auditLogs)
      .orderBy(sql`${auditLogs.createdAt} DESC`)
      .limit(limit)
      .offset(offset);
    
    return result;
  } catch (error) {
    logger.error("[Database] Failed to get audit logs:", error);
    return [];
  }
}

/**
 * Get all login history for all users (last N days)
 */
export async function getAllLoginHistory(days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const { loginHistory } = await import("../drizzle/schema");
    const { gte, sql } = await import("drizzle-orm");
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const result = await db.select()
      .from(loginHistory)
      .where(gte(loginHistory.createdAt, cutoffDate))
      .orderBy(sql`${loginHistory.createdAt} DESC`)
      .limit(200);
    
    return result;
  } catch (error) {
    logger.error("[Database] Failed to get all login history:", error);
    return [];
  }
}

// ===== WISHLIST =====

export async function getWishlistItems(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const items = await db.select()
    .from(wishlist)
    .where(eq(wishlist.userId, userId))
    .orderBy(sql`${wishlist.createdAt} DESC`);

  // Get product details for each wishlist item
  const itemsWithProducts = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.productId);
      return {
        ...item,
        product,
      };
    })
  );

  return itemsWithProducts;
}

export async function addToWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already in wishlist
  const existing = await db.select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));

  if (existing.length > 0) {
    return existing[0]; // Already in wishlist
  }

  const result = await db.insert(wishlist)
    .values({ userId, productId })
    .returning();

  return result[0];
}

export async function removeFromWishlist(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
}

export async function isInWishlist(userId: number, productId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));

  return existing.length > 0;
}

export async function clearWishlist(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(wishlist).where(eq(wishlist.userId, userId));
}

// ===== EMAIL CAMPAIGNS =====

export async function createEmailCampaign(campaign: InsertEmailCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailCampaigns)
    .values(campaign)
    .returning();

  return result[0];
}

export async function updateEmailCampaign(id: number, updates: Partial<InsertEmailCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(emailCampaigns)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(emailCampaigns.id, id))
    .returning();

  return result[0];
}

export async function getEmailCampaigns() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select()
    .from(emailCampaigns)
    .orderBy(sql`${emailCampaigns.createdAt} DESC`);
}

export async function getEmailCampaignById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select()
    .from(emailCampaigns)
    .where(eq(emailCampaigns.id, id));

  return result[0] || null;
}

export async function deleteEmailCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(emailCampaigns).where(eq(emailCampaigns.id, id));
}

export async function getEmailRecipients(type: string): Promise<Array<{ email: string; name: string | null }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (type === 'newsletter') {
    // Get active newsletter subscribers
    const subscribers = await db.select({ email: newsletter.email, name: newsletter.name })
      .from(newsletter)
      .where(eq(newsletter.active, 1));
    return subscribers;
  } else if (type === 'all_customers') {
    // Get all users with verified emails
    const customers = await db.select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.emailVerified, 1));
    return customers;
  }

  return [];
}

// ============================================
// Seed Homepage Content
// ============================================

export async function seedHomepageContent() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { heroSlides, homepageVideos, homepageCards } = await import("../drizzle/schema");

  const results = {
    slides: 0,
    videos: 0,
    cards: 0,
  };

  try {
    // Check if data already exists
    const existingSlides = await db.select().from(heroSlides);
    const existingVideos = await db.select().from(homepageVideos);
    const existingCards = await db.select().from(homepageCards);

    // Seed Hero Slides if empty
    if (existingSlides.length === 0) {
      const defaultSlides = [
        {
          imageUrl: '/images/hero_home_table_setting.webp',
          altText: 'ILE ALA Luxury Table Setting',
          titleEN: 'ILE ALA',
          titlePT: 'ILE ALA',
          subtitleEN: 'Crafting Elegance for Your Table',
          subtitlePT: 'Criando Elegância Para Sua Mesa',
          displayOrder: 1,
          active: 1
        },
        {
          imageUrl: '/images/hero_carousel_2.jpeg',
          altText: 'ILE ALA Collection - Decorative Shells',
          titleEN: 'ILE ALA',
          titlePT: 'ILE ALA',
          subtitleEN: 'Crafting Elegance for Your Table',
          subtitlePT: 'Criando Elegância Para Sua Mesa',
          displayOrder: 2,
          active: 1
        },
        {
          imageUrl: '/images/hero_carousel_3.jpeg?v=4',
          altText: 'ILE ALA Elegant Table Setting',
          titleEN: 'ILE ALA',
          titlePT: 'ILE ALA',
          subtitleEN: 'Crafting Elegance for Your Table',
          subtitlePT: 'Criando Elegância Para Sua Mesa',
          displayOrder: 3,
          active: 1
        },
        {
          imageUrl: '/images/hero_carousel_moet.jpeg',
          altText: 'ILE ALA Luxury Collection',
          titleEN: 'ILE ALA',
          titlePT: 'ILE ALA',
          subtitleEN: 'Crafting Elegance for Your Table',
          subtitlePT: 'Criando Elegância Para Sua Mesa',
          displayOrder: 4,
          active: 1
        },
      ];

      for (const slide of defaultSlides) {
        await db.insert(heroSlides).values(slide);
        results.slides++;
      }
      logger.info(`[Seed] Created ${results.slides} hero slides`);
    }

    // Seed Homepage Videos if empty
    if (existingVideos.length === 0) {
      const defaultVideos = [
        { videoUrl: '/videos/video1.mp4', titleEN: 'Video 1', titlePT: 'Vídeo 1', displayOrder: 1, active: 1 },
        { videoUrl: '/videos/video2.mp4', titleEN: 'Video 2', titlePT: 'Vídeo 2', displayOrder: 2, active: 1 },
        { videoUrl: '/videos/video3.mp4', titleEN: 'Video 3', titlePT: 'Vídeo 3', displayOrder: 3, active: 1 },
        { videoUrl: '/videos/video4.mp4', titleEN: 'Video 4', titlePT: 'Vídeo 4', displayOrder: 4, active: 1 },
        { videoUrl: '/videos/video5.mp4', titleEN: 'Video 5', titlePT: 'Vídeo 5', displayOrder: 5, active: 1 },
        { videoUrl: '/videos/video6.mp4', titleEN: 'Video 6', titlePT: 'Vídeo 6', displayOrder: 6, active: 1 },
      ];

      for (const video of defaultVideos) {
        await db.insert(homepageVideos).values(video);
        results.videos++;
      }
      logger.info(`[Seed] Created ${results.videos} homepage videos`);
    }

    // Seed Homepage Cards if empty
    if (existingCards.length === 0) {
      const defaultCards = [
        {
          imageUrl: '/images/about_me_card_new.png',
          titleEN: 'About Me',
          titlePT: 'Sobre Mim',
          linkUrl: '/about',
          displayOrder: 1,
          active: 1
        },
        {
          imageUrl: '/images/about_collections_new.webp',
          titleEN: 'Our Collections',
          titlePT: 'Nossas Coleções',
          linkUrl: '/collections',
          displayOrder: 2,
          active: 1
        },
        {
          imageUrl: '/images/our_values_card.webp',
          titleEN: 'Our Values',
          titlePT: 'Nossos Valores',
          linkUrl: '/about',
          displayOrder: 3,
          active: 1
        },
      ];

      for (const card of defaultCards) {
        await db.insert(homepageCards).values(card);
        results.cards++;
      }
      logger.info(`[Seed] Created ${results.cards} homepage cards`);
    }

    return {
      success: true,
      message: `Seeded: ${results.slides} slides, ${results.videos} videos, ${results.cards} cards`,
      results,
      alreadyExisted: {
        slides: existingSlides.length > 0,
        videos: existingVideos.length > 0,
        cards: existingCards.length > 0,
      }
    };
  } catch (error) {
    logger.error("[Seed] Failed to seed homepage content:", error);
    throw error;
  }
}

// ============================================
// Page Banners Functions
// ============================================

export async function listPageBanners() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { pageBanners } = await import("../drizzle/schema");
    const { sql } = await import("drizzle-orm");
    return await db.select().from(pageBanners).orderBy(sql`${pageBanners.pageSlug} ASC`);
  } catch (error) {
    logger.error("[Database] Failed to list page banners:", error);
    return [];
  }
}

export async function getPageBanner(pageSlug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { pageBanners } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");
    const result = await db.select().from(pageBanners)
      .where(and(eq(pageBanners.pageSlug, pageSlug), eq(pageBanners.active, 1)));
    return result[0] || null;
  } catch (error) {
    logger.error("[Database] Failed to get page banner:", error);
    return null;
  }
}

export async function createPageBanner(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { pageBanners } = await import("../drizzle/schema");
    const result = await db.insert(pageBanners).values(data).returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to create page banner:", error);
    throw error;
  }
}

export async function updatePageBanner(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { pageBanners } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const result = await db.update(pageBanners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pageBanners.id, id))
      .returning();
    return result[0];
  } catch (error) {
    logger.error("[Database] Failed to update page banner:", error);
    throw error;
  }
}

export async function deletePageBanner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const { pageBanners } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(pageBanners).where(eq(pageBanners.id, id));
    return { success: true };
  } catch (error) {
    logger.error("[Database] Failed to delete page banner:", error);
    throw error;
  }
}

export async function seedPageBanners() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { pageBanners } = await import("../drizzle/schema");

  try {
    const existing = await db.select().from(pageBanners);
    if (existing.length > 0) {
      return { success: true, message: 'Banners already exist', count: 0 };
    }

    const defaultBanners = [
      {
        pageSlug: 'collections',
        imageUrl: '/images/collections_hero_porcelain.webp',
        altText: 'ILE ALA Collections',
        titleEN: 'Our Collections',
        titlePT: 'Nossas Coleções',
        subtitleEN: 'Discover our exclusive collections',
        subtitlePT: 'Descubra nossas coleções exclusivas',
        overlayOpacity: 30,
        active: 1
      },
      {
        pageSlug: 'table-essentials',
        imageUrl: '/images/table_essentials_hero.jpeg',
        altText: 'Table Essentials',
        titleEN: 'Table Essentials',
        titlePT: 'Essenciais de Mesa',
        subtitleEN: 'Elevate your dining experience',
        subtitlePT: 'Eleve sua experiência gastronômica',
        overlayOpacity: 30,
        active: 1
      },
      {
        pageSlug: 'pet-collection',
        imageUrl: '/images/pet_collection_logo.png?v=4',
        altText: 'Pet Collection',
        titleEN: 'Pet Collection',
        titlePT: 'Coleção Pet',
        subtitleEN: 'Luxury for your furry friends',
        subtitlePT: 'Luxo para seus amigos peludos',
        overlayOpacity: 30,
        active: 1
      },
      {
        pageSlug: 'accessories',
        imageUrl: '/images/accessories_hero.jpeg',
        altText: 'Accessories',
        titleEN: 'Accessories',
        titlePT: 'Acessórios',
        subtitleEN: 'Complete your collection',
        subtitlePT: 'Complete sua coleção',
        overlayOpacity: 30,
        active: 1
      },
      {
        pageSlug: 'home-accents',
        imageUrl: '/images/home_accents_hero.jpeg',
        altText: 'Home Accents',
        titleEN: 'Home Accents',
        titlePT: 'Decoração',
        subtitleEN: 'Transform your space',
        subtitlePT: 'Transforme seu espaço',
        overlayOpacity: 30,
        active: 1
      },
      {
        pageSlug: 'napkin-rings',
        imageUrl: '/images/napkin_rings_hero.jpeg',
        altText: 'Napkin Rings',
        titleEN: 'Napkin Rings',
        titlePT: 'Porta Guardanapos',
        subtitleEN: 'Elegant details for your table',
        subtitlePT: 'Detalhes elegantes para sua mesa',
        overlayOpacity: 30,
        active: 1
      },
      {
        pageSlug: 'about',
        imageUrl: '/images/about-galeries-lafayette.webp',
        altText: 'About ILE ALA',
        titleEN: 'About Us',
        titlePT: 'Sobre Nós',
        subtitleEN: 'Our story and values',
        subtitlePT: 'Nossa história e valores',
        overlayOpacity: 30,
        active: 1
      },
    ];

    for (const banner of defaultBanners) {
      await db.insert(pageBanners).values(banner);
    }

    logger.info(`[Seed] Created ${defaultBanners.length} page banners`);
    return { success: true, message: `Created ${defaultBanners.length} banners`, count: defaultBanners.length };
  } catch (error) {
    logger.error("[Seed] Failed to seed page banners:", error);
    throw error;
  }
}

// ============================================================================
// LOYALTY PROGRAM FUNCTIONS
// ============================================================================

// Tier thresholds in fils (1 AED = 100 fils)
const LOYALTY_TIERS = {
  green: { min: 0, max: 149900, name: 'green' },
  silver: { min: 150000, max: 399900, name: 'silver' },
  gold: { min: 400000, max: 749900, name: 'gold' },
  platinum: { min: 750000, max: Infinity, name: 'platinum' },
};

// Calculate tier based on annual spending (in fils)
export function calculateTier(totalSpentCurrentYear: number): string {
  if (totalSpentCurrentYear >= LOYALTY_TIERS.platinum.min) return 'platinum';
  if (totalSpentCurrentYear >= LOYALTY_TIERS.gold.min) return 'gold';
  if (totalSpentCurrentYear >= LOYALTY_TIERS.silver.min) return 'silver';
  return 'green';
}

// Get or create loyalty member for a user
export async function getOrCreateLoyaltyMember(userId: number): Promise<LoyaltyMember | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if member exists
    const existing = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.userId, userId)).limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new member
    const [newMember] = await db.insert(loyaltyMembers).values({
      userId,
      tier: 'green',
      totalSpentAllTime: 0,
      totalSpentCurrentYear: 0,
      yearStartDate: new Date(),
      totalOrders: 0,
      active: 1,
      joinedAt: new Date(),
    }).returning();

    // Log the activity
    await logLoyaltyActivity(newMember.id, 'member_joined', 'New member joined the loyalty program');

    return newMember;
  } catch (error) {
    logger.error("[Loyalty] Failed to get or create member:", error);
    return null;
  }
}

// Get loyalty member by user ID
export async function getLoyaltyMemberByUserId(userId: number): Promise<LoyaltyMember | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [member] = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.userId, userId)).limit(1);
    return member || null;
  } catch (error) {
    logger.error("[Loyalty] Failed to get member:", error);
    return null;
  }
}

// Get all tier benefits
export async function getAllTierBenefits(): Promise<LoyaltyTierBenefit[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const benefits = await db.select().from(loyaltyTierBenefits);
    return benefits;
  } catch (error) {
    logger.error("[Loyalty] Failed to get tier benefits:", error);
    return [];
  }
}

// Get benefits for a specific tier
export async function getTierBenefits(tier: string): Promise<LoyaltyTierBenefit | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [benefits] = await db.select().from(loyaltyTierBenefits).where(eq(loyaltyTierBenefits.tier, tier)).limit(1);
    return benefits || null;
  } catch (error) {
    logger.error("[Loyalty] Failed to get tier benefits:", error);
    return null;
  }
}

// Update member spending after a purchase
export async function updateMemberSpending(userId: number, orderAmount: number, orderId: number): Promise<{ member: LoyaltyMember | null; tierChanged: boolean; newTier: string | null }> {
  const db = await getDb();
  if (!db) return { member: null, tierChanged: false, newTier: null };

  try {
    // Get or create member
    let member = await getOrCreateLoyaltyMember(userId);
    if (!member) return { member: null, tierChanged: false, newTier: null };

    // Check if we need to reset the year
    const now = new Date();
    const yearStart = new Date(member.yearStartDate);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    let newYearSpent = member.totalSpentCurrentYear + orderAmount;
    let newYearStartDate = member.yearStartDate;

    // Reset if year has passed
    if (yearStart < oneYearAgo) {
      newYearSpent = orderAmount;
      newYearStartDate = now;
    }

    const oldTier = member.tier;
    const newTier = calculateTier(newYearSpent);
    const tierChanged = oldTier !== newTier;

    // Update member
    const [updatedMember] = await db.update(loyaltyMembers)
      .set({
        totalSpentAllTime: member.totalSpentAllTime + orderAmount,
        totalSpentCurrentYear: newYearSpent,
        yearStartDate: newYearStartDate,
        totalOrders: member.totalOrders + 1,
        tier: newTier,
        previousTier: tierChanged ? oldTier : member.previousTier,
        tierUpgradedAt: tierChanged ? now : member.tierUpgradedAt,
        updatedAt: now,
      })
      .where(eq(loyaltyMembers.id, member.id))
      .returning();

    // Log the purchase
    await logLoyaltyActivity(member.id, 'purchase', `Purchase completed`, orderId, orderAmount);

    // Log tier upgrade if changed
    if (tierChanged) {
      await logLoyaltyActivity(member.id, 'tier_upgrade', `Upgraded from ${oldTier} to ${newTier}`, null, null, oldTier, newTier);
    }

    return { member: updatedMember, tierChanged, newTier: tierChanged ? newTier : null };
  } catch (error) {
    logger.error("[Loyalty] Failed to update member spending:", error);
    return { member: null, tierChanged: false, newTier: null };
  }
}

// Log loyalty activity
export async function logLoyaltyActivity(
  memberId: number,
  activityType: string,
  description: string,
  orderId?: number | null,
  amountSpent?: number | null,
  fromTier?: string | null,
  toTier?: string | null,
  metadata?: any
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(loyaltyActivityLog).values({
      memberId,
      activityType,
      description,
      orderId: orderId || null,
      amountSpent: amountSpent || null,
      fromTier: fromTier || null,
      toTier: toTier || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (error) {
    logger.error("[Loyalty] Failed to log activity:", error);
  }
}

// Get member activity log
export async function getMemberActivityLog(memberId: number, limit: number = 50): Promise<LoyaltyActivityLog[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const activities = await db.select()
      .from(loyaltyActivityLog)
      .where(eq(loyaltyActivityLog.memberId, memberId))
      .orderBy(sql`${loyaltyActivityLog.createdAt} DESC`)
      .limit(limit);
    return activities;
  } catch (error) {
    logger.error("[Loyalty] Failed to get activity log:", error);
    return [];
  }
}

// Update member birthday
export async function updateMemberBirthday(userId: number, birthday: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(loyaltyMembers)
      .set({ birthday, updatedAt: new Date() })
      .where(eq(loyaltyMembers.userId, userId));
    return true;
  } catch (error) {
    logger.error("[Loyalty] Failed to update birthday:", error);
    return false;
  }
}

// Update member WhatsApp (for Platinum concierge)
export async function updateMemberWhatsApp(userId: number, whatsappNumber: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(loyaltyMembers)
      .set({ whatsappNumber, updatedAt: new Date() })
      .where(eq(loyaltyMembers.userId, userId));
    return true;
  } catch (error) {
    logger.error("[Loyalty] Failed to update WhatsApp:", error);
    return false;
  }
}

// Claim birthday gift
export async function claimBirthdayGift(userId: number): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) return { success: false, message: 'Database not available' };

  try {
    const member = await getLoyaltyMemberByUserId(userId);
    if (!member) return { success: false, message: 'Member not found' };

    // Check if already claimed this year
    if (member.birthdayGiftClaimed === 1) {
      return { success: false, message: 'Birthday gift already claimed this year' };
    }

    // Check tier has birthday benefit
    const benefits = await getTierBenefits(member.tier);
    if (!benefits || benefits.birthdayReward !== 1) {
      return { success: false, message: 'Birthday reward not available for your tier' };
    }

    // Mark as claimed
    await db.update(loyaltyMembers)
      .set({ birthdayGiftClaimed: 1, updatedAt: new Date() })
      .where(eq(loyaltyMembers.id, member.id));

    await logLoyaltyActivity(member.id, 'birthday_gift_claimed', 'Claimed birthday gift');

    return { success: true, message: 'Birthday gift claimed successfully!' };
  } catch (error) {
    logger.error("[Loyalty] Failed to claim birthday gift:", error);
    return { success: false, message: 'Failed to claim gift' };
  }
}

// Get all loyalty members (admin)
export async function getAllLoyaltyMembers(filters?: { tier?: string; limit?: number; offset?: number }): Promise<{ members: any[]; total: number }> {
  const db = await getDb();
  if (!db) return { members: [], total: 0 };

  try {
    let query = db.select({
      member: loyaltyMembers,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      }
    })
    .from(loyaltyMembers)
    .innerJoin(users, eq(loyaltyMembers.userId, users.id));

    if (filters?.tier && filters.tier !== 'all') {
      query = query.where(eq(loyaltyMembers.tier, filters.tier)) as any;
    }

    const allMembers = await query.orderBy(sql`${loyaltyMembers.totalSpentAllTime} DESC`);

    const startIndex = filters?.offset || 0;
    const endIndex = filters?.limit ? startIndex + filters.limit : allMembers.length;
    const paginatedMembers = allMembers.slice(startIndex, endIndex);

    return {
      members: paginatedMembers,
      total: allMembers.length
    };
  } catch (error) {
    logger.error("[Loyalty] Failed to get all members:", error);
    return { members: [], total: 0 };
  }
}

// Get loyalty program stats (admin)
export async function getLoyaltyStats(): Promise<any> {
  const db = await getDb();
  if (!db) return null;

  try {
    const sqlClient = await getSql();
    if (!sqlClient) return null;

    const stats = await sqlClient`
      SELECT
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE tier = 'green') as green_count,
        COUNT(*) FILTER (WHERE tier = 'silver') as silver_count,
        COUNT(*) FILTER (WHERE tier = 'gold') as gold_count,
        COUNT(*) FILTER (WHERE tier = 'platinum') as platinum_count,
        COALESCE(SUM("totalSpentAllTime"), 0) as total_spent_all_time,
        COALESCE(SUM("totalSpentCurrentYear"), 0) as total_spent_current_year,
        COALESCE(AVG("totalSpentAllTime"), 0) as avg_spent_per_member
      FROM loyalty_members
      WHERE active = 1
    `;

    return stats[0] || null;
  } catch (error) {
    logger.error("[Loyalty] Failed to get stats:", error);
    return null;
  }
}

// Check if member has free shipping benefit
export async function memberHasFreeShipping(userId: number, shippingType: 'standard' | 'express'): Promise<boolean> {
  try {
    const member = await getLoyaltyMemberByUserId(userId);
    if (!member) return false;

    const benefits = await getTierBenefits(member.tier);
    if (!benefits) return false;

    if (shippingType === 'standard') {
      return benefits.freeStandardShipping === 1;
    } else {
      return benefits.freeExpressShipping === 1;
    }
  } catch (error) {
    logger.error("[Loyalty] Failed to check shipping benefit:", error);
    return false;
  }
}

// Get member's next tier info
export async function getNextTierInfo(userId: number): Promise<{ nextTier: string | null; amountNeeded: number; progress: number } | null> {
  try {
    const member = await getLoyaltyMemberByUserId(userId);
    if (!member) return null;

    const currentTier = member.tier;
    const currentSpent = member.totalSpentCurrentYear;

    if (currentTier === 'platinum') {
      return { nextTier: null, amountNeeded: 0, progress: 100 };
    }

    const tiers = ['green', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    const nextTier = tiers[currentIndex + 1];

    const nextTierThreshold = LOYALTY_TIERS[nextTier as keyof typeof LOYALTY_TIERS].min;
    const currentTierThreshold = LOYALTY_TIERS[currentTier as keyof typeof LOYALTY_TIERS].min;

    const amountNeeded = Math.max(0, nextTierThreshold - currentSpent);
    const rangeSize = nextTierThreshold - currentTierThreshold;
    const progress = Math.min(100, Math.round(((currentSpent - currentTierThreshold) / rangeSize) * 100));

    return { nextTier, amountNeeded, progress };
  } catch (error) {
    logger.error("[Loyalty] Failed to get next tier info:", error);
    return null;
  }
}

// Update tier benefits (admin)
export async function updateTierBenefits(
  tier: string,
  data: {
    displayName?: string;
    minSpend?: number;
    maxSpend?: number | null;
    color?: string;
    freeStandardShipping?: number;
    freeExpressShipping?: number;
    earlyAccess?: number;
    earlyAccessHours?: number;
    birthdayReward?: number;
    exclusiveProducts?: number;
    prioritySupport?: number;
    personalConcierge?: number;
    eventInvites?: number;
    surpriseGifts?: number;
  }
): Promise<LoyaltyTierBenefit | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const [updated] = await db.update(loyaltyTierBenefits)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(loyaltyTierBenefits.tier, tier))
      .returning();

    return updated || null;
  } catch (error) {
    logger.error("[Loyalty] Failed to update tier benefits:", error);
    return null;
  }
}

// Manually change member tier (admin)
export async function adminChangeMemberTier(
  memberId: number,
  newTier: string,
  adminId: number,
  reason: string
): Promise<{ success: boolean; member: LoyaltyMember | null }> {
  const db = await getDb();
  if (!db) return { success: false, member: null };

  try {
    // Get current member
    const [currentMember] = await db.select().from(loyaltyMembers).where(eq(loyaltyMembers.id, memberId)).limit(1);
    if (!currentMember) return { success: false, member: null };

    const oldTier = currentMember.tier;
    const now = new Date();

    // Update tier
    const [updatedMember] = await db.update(loyaltyMembers)
      .set({
        tier: newTier,
        previousTier: oldTier,
        tierUpgradedAt: now,
        updatedAt: now,
      })
      .where(eq(loyaltyMembers.id, memberId))
      .returning();

    // Log activity
    await logLoyaltyActivity(
      memberId,
      oldTier < newTier ? 'manual_upgrade' : 'manual_downgrade',
      `Admin manually changed tier: ${reason}`,
      null,
      null,
      oldTier,
      newTier,
      { adminId, reason }
    );

    return { success: true, member: updatedMember };
  } catch (error) {
    logger.error("[Loyalty] Failed to change member tier:", error);
    return { success: false, member: null };
  }
}

// Update member status (active/inactive)
export async function updateMemberStatus(memberId: number, active: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(loyaltyMembers)
      .set({ active, updatedAt: new Date() })
      .where(eq(loyaltyMembers.id, memberId));
    return true;
  } catch (error) {
    logger.error("[Loyalty] Failed to update member status:", error);
    return false;
  }
}
