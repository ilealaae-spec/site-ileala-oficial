import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, Product, InsertProduct, orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, cartItems, CartItem, InsertCartItem, coupons, Coupon, InsertCoupon } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
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

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return Number(result[0].insertId);
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
    });
    return Number(result[0].insertId);
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
  const result = await db.insert(orders).values(order);
  return Number(result[0].insertId);
}

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orderItems).values(item);
  return Number(result[0].insertId);
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
  const result = await db.insert(coupons).values(coupon);
  return Number(result[0].insertId);
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
