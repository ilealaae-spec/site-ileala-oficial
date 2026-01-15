-- Create missing tables if they don't exist
-- Run this in Neon SQL Editor

-- Newsletter table
CREATE TABLE IF NOT EXISTS newsletter (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  active INTEGER DEFAULT 1 NOT NULL,
  source VARCHAR(50) DEFAULT 'website' NOT NULL
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  "nameEN" VARCHAR(255) NOT NULL,
  "namePT" VARCHAR(255) NOT NULL,
  "descriptionEN" TEXT,
  "descriptionPT" TEXT,
  "imageUrl" VARCHAR(512),
  "parentId" INTEGER REFERENCES categories(id),
  "displayOrder" INTEGER DEFAULT 0 NOT NULL,
  active INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  "nameEN" VARCHAR(255) NOT NULL,
  "namePT" VARCHAR(255) NOT NULL,
  "descriptionEN" TEXT,
  "descriptionPT" TEXT,
  "imageUrl" VARCHAR(512),
  "displayOrder" INTEGER DEFAULT 0 NOT NULL,
  active INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  "discountType" VARCHAR(20) DEFAULT 'percentage' NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "minPurchase" INTEGER DEFAULT 0,
  "maxUses" INTEGER,
  "usedCount" INTEGER DEFAULT 0 NOT NULL,
  "expiresAt" TIMESTAMP,
  active INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Artisans table
CREATE TABLE IF NOT EXISTS artisans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT,
  "imageUrl" VARCHAR(512),
  location VARCHAR(255),
  specialty VARCHAR(255),
  featured INTEGER DEFAULT 0 NOT NULL,
  active INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Site settings table
CREATE TABLE IF NOT EXISTS "siteSettings" (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS "auditLogs" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details TEXT,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User sessions table
CREATE TABLE IF NOT EXISTS "userSessions" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "lastActiveAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Cart items table
CREATE TABLE IF NOT EXISTS "cartItems" (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "productId" INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Order items table (if not exists)
CREATE TABLE IF NOT EXISTS "orderItems" (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER NOT NULL REFERENCES orders(id),
  "productId" INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  "priceAtPurchase" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
