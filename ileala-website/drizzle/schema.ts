import { pgTable, serial, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
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
  emailVerified: integer("emailVerified").default(0).notNull(), // 0 = not verified, 1 = verified
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  emailVerificationExpires: timestamp("emailVerificationExpires"),
  // Password reset
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  passwordResetExpires: timestamp("passwordResetExpires"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  // Two-Factor Authentication
  twoFactorEnabled: integer("twoFactorEnabled").default(0).notNull(), // 0 = disabled, 1 = enabled
  twoFactorSecret: varchar("twoFactorSecret", { length: 255 }), // TOTP secret
  twoFactorBackupCodes: text("twoFactorBackupCodes"), // JSON array of backup codes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  namePT: varchar("namePT", { length: 255 }).notNull(),
  descriptionEN: text("descriptionEN"),
  descriptionPT: text("descriptionPT"),
  price: integer("price").notNull(), // Price in fils (1 AED = 100 fils)
  imageUrl: varchar("imageUrl", { length: 512 }),
  mainImage: varchar("mainImage", { length: 512 }),
  mainImageAlt: varchar("mainImageAlt", { length: 255 }),
  images: text("images"),
  salePrice: integer("salePrice"),
  descriptionEN_full: text("descriptionEN_full"),
  descriptionPT_full: text("descriptionPT_full"),
  material: varchar("material", { length: 255 }),
  dimensions: varchar("dimensions", { length: 255 }),
  colors: varchar("colors", { length: 255 }),
  careInstructionsEN: text("careInstructionsEN"),
  careInstructionsPT: text("careInstructionsPT"),
  weight: integer("weight"),
  sku: varchar("sku", { length: 100 }),
  inStock: integer("inStock").default(1),
  stockQuantity: integer("stockQuantity").default(0),
  isNew: integer("isNew").default(0),
  onSale: integer("onSale").default(0),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  collection: varchar("collection", { length: 100 }),
  category: varchar("category", { length: 100 }),
  stock: integer("stock").default(0).notNull(),
  featured: integer("featured").default(0).notNull(), // 0 = false, 1 = true
  active: integer("active").default(1).notNull(), // 0 = inactive, 1 = active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  totalAmount: integer("totalAmount").notNull(), // Total in fils
  shippingAddress: text("shippingAddress"),
  customerName: varchar("customerName", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 50 }),
  paymentStatus: varchar("paymentStatus", { length: 20 }).default("pending").notNull(),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: integer("discountAmount").default(0).notNull(), // Discount applied in fils
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items table
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").references(() => orders.id).notNull(),
  productId: integer("productId").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: integer("priceAtPurchase").notNull(), // Price in fils at time of purchase
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Cart items table (for logged-in users)
export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  productId: integer("productId").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discountType: varchar("discountType", { length: 20 }).notNull(), // percentage or fixed amount
  discountValue: integer("discountValue").notNull(), // percentage (0-100) or fixed amount in fils
  minPurchaseAmount: integer("minPurchaseAmount").default(0).notNull(), // Minimum purchase required in fils
  maxUses: integer("maxUses").default(0).notNull(), // 0 = unlimited
  usedCount: integer("usedCount").default(0).notNull(),
  active: integer("active").default(1).notNull(), // 0 = inactive, 1 = active
  validFrom: timestamp("validFrom").defaultNow().notNull(),
  validUntil: timestamp("validUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

// Newsletter table
export const newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  active: integer("active").default(1).notNull(), // 0 = unsubscribed, 1 = active
  source: varchar("source", { length: 50 }).default("website").notNull(), // where they subscribed from
});

export type Newsletter = typeof newsletter.$inferSelect;
export type InsertNewsletter = typeof newsletter.$inferInsert;

// Artisans table - for managing artisan profiles
export const artisans = pgTable("artisans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  bioEN: text("bioEN"),
  bioPT: text("bioPT"),
  photoUrl: varchar("photoUrl", { length: 512 }),
  specialty: varchar("specialty", { length: 255 }), // e.g., "Ceramics", "Textiles"
  location: varchar("location", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  socialMedia: text("socialMedia"), // JSON string with social links
  featured: integer("featured").default(0).notNull(), // 0 = false, 1 = true
  active: integer("active").default(1).notNull(), // 0 = inactive, 1 = active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Artisan = typeof artisans.$inferSelect;
export type InsertArtisan = typeof artisans.$inferInsert;

// Site content table - for managing editable site content
export const siteContent = pgTable("siteContent", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(), // e.g., "about-hero-title", "footer-text"
  contentType: varchar("contentType", { length: 50 }).notNull(), // text, html, markdown, image
  contentEN: text("contentEN"),
  contentPT: text("contentPT"),
  metadata: text("metadata"), // JSON string for additional data
  active: integer("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

// Media library table - for managing uploaded images and files
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: integer("size").notNull(), // File size in bytes
  alt: varchar("alt", { length: 255 }), // Alt text for accessibility
  caption: text("caption"),
  folder: varchar("folder", { length: 255 }).default("general"), // Organize by folder
  uploadedBy: integer("uploadedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

// Categories table - for product categorization
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  namePT: varchar("namePT", { length: 255 }).notNull(),
  descriptionEN: text("descriptionEN"),
  descriptionPT: text("descriptionPT"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  parentId: integer("parentId").references((): any => categories.id), // For subcategories
  displayOrder: integer("displayOrder").default(0).notNull(),
  active: integer("active").default(1).notNull(), // 0 = inactive, 1 = active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Collections table - for product collections (La Mer, Anima, Botanica, etc.)
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  nameEN: varchar("nameEN", { length: 255 }).notNull(),
  namePT: varchar("namePT", { length: 255 }).notNull(),
  descriptionEN: text("descriptionEN"),
  descriptionPT: text("descriptionPT"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  displayOrder: integer("displayOrder").default(0).notNull(),
  active: integer("active").default(1).notNull(), // 0 = inactive, 1 = active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

// Site settings table - for global site configuration
export const siteSettings = pgTable("siteSettings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(), // e.g., "site-title", "contact-email"
  value: text("value").notNull(),
  description: text("description"), // What this setting controls
  category: varchar("category", { length: 100 }).default("general"), // general, seo, social, etc.
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// Audit Logs table - for security and compliance
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  userEmail: varchar("userEmail", { length: 320 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // create, update, delete, login, logout
  entity: varchar("entity", { length: 50 }).notNull(), // product, category, collection, user, etc
  entityId: integer("entityId"), // ID of the affected entity
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
  userAgent: text("userAgent"),
  changes: text("changes"), // JSON string of before/after data
  metadata: text("metadata"), // JSON string of additional context
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// Login History table
export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  ip: varchar("ip", { length: 45 }).notNull(),
  userAgent: text("userAgent"),
  success: integer("success").default(1).notNull(), // 1 = success, 0 = failed
  failureReason: varchar("failureReason", { length: 255 }),
  location: varchar("location", { length: 255 }),
  deviceType: varchar("deviceType", { length: 50 }),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  notificationSent: integer("notificationSent").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = typeof loginHistory.$inferInsert;

// User Sessions table
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  ip: varchar("ip", { length: 45 }).notNull(),
  userAgent: text("userAgent"),
  deviceType: varchar("deviceType", { length: 50 }),
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  lastActivity: timestamp("lastActivity").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// Wishlist table - for user favorite products
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer("productId").notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = typeof wishlist.$inferInsert;
