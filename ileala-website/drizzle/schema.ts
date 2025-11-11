import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. Optional for local auth. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Hashed password for local auth
  phone: varchar("phone", { length: 50 }),
  // Address fields
  address: text("address"), // Street address
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }), // State/Emirate
  poBox: varchar("poBox", { length: 50 }), // PO Box
  country: varchar("country", { length: 100 }),
  // Email verification
  emailVerified: int("emailVerified").default(0).notNull(), // 0 = not verified, 1 = verified
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  emailVerificationExpires: timestamp("emailVerificationExpires"),
  // Password reset
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  namePT: varchar("namePT", { length: 255 }).notNull(),
  descriptionEN: text("descriptionEN"),
  descriptionPT: text("descriptionPT"),
  price: int("price").notNull(), // Price in fils (1 AED = 100 fils)
  imageUrl: varchar("imageUrl", { length: 512 }),
  collection: varchar("collection", { length: 100 }),
  category: varchar("category", { length: 100 }),
  stock: int("stock").default(0).notNull(),
  featured: int("featured").default(0).notNull(), // 0 = false, 1 = true
  active: int("active").default(1).notNull(), // 0 = inactive, 1 = active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  totalAmount: int("totalAmount").notNull(), // Total in fils
  shippingAddress: text("shippingAddress"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: int("discountAmount").default(0).notNull(), // Discount applied in fils
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items table
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").references(() => orders.id).notNull(),
  productId: int("productId").references(() => products.id).notNull(),
  quantity: int("quantity").notNull(),
  priceAtPurchase: int("priceAtPurchase").notNull(), // Price in fils at time of purchase
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Cart items table (for logged-in users)
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  productId: int("productId").references(() => products.id).notNull(),
  quantity: int("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Coupons table
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(), // percentage or fixed amount
  discountValue: int("discountValue").notNull(), // percentage (0-100) or fixed amount in fils
  minPurchaseAmount: int("minPurchaseAmount").default(0).notNull(), // Minimum purchase required in fils
  maxUses: int("maxUses").default(0).notNull(), // 0 = unlimited
  usedCount: int("usedCount").default(0).notNull(),
  active: int("active").default(1).notNull(), // 0 = inactive, 1 = active
  validFrom: timestamp("validFrom").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;