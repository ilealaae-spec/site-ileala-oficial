-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320) NOT NULL UNIQUE,
  "password" VARCHAR(255),
  "phone" VARCHAR(50),
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "poBox" VARCHAR(50),
  "country" VARCHAR(100),
  "emailVerified" INTEGER DEFAULT 0 NOT NULL,
  "emailVerificationToken" VARCHAR(255),
  "emailVerificationExpires" TIMESTAMP,
  "passwordResetToken" VARCHAR(255),
  "passwordResetExpires" TIMESTAMP,
  "loginMethod" VARCHAR(64),
  "role" VARCHAR(20) DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
  "id" SERIAL PRIMARY KEY,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "nameEN" VARCHAR(255) NOT NULL,
  "namePT" VARCHAR(255) NOT NULL,
  "descriptionEN" TEXT,
  "descriptionPT" TEXT,
  "price" INTEGER NOT NULL,
  "imageUrl" VARCHAR(512),
  "collection" VARCHAR(100),
  "category" VARCHAR(100),
  "stock" INTEGER DEFAULT 0 NOT NULL,
  "featured" INTEGER DEFAULT 0 NOT NULL,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id"),
  "status" VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "shippingAddress" TEXT,
  "customerName" VARCHAR(255),
  "customerEmail" VARCHAR(320),
  "customerPhone" VARCHAR(50),
  "paymentStatus" VARCHAR(20) DEFAULT 'pending' NOT NULL,
  "paymentIntentId" VARCHAR(255),
  "couponCode" VARCHAR(50),
  "discountAmount" INTEGER DEFAULT 0 NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create orderItems table
CREATE TABLE IF NOT EXISTS "orderItems" (
  "id" SERIAL PRIMARY KEY,
  "orderId" INTEGER REFERENCES "orders"("id") NOT NULL,
  "productId" INTEGER REFERENCES "products"("id") NOT NULL,
  "quantity" INTEGER NOT NULL,
  "priceAtPurchase" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create cartItems table
CREATE TABLE IF NOT EXISTS "cartItems" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id") NOT NULL,
  "productId" INTEGER REFERENCES "products"("id") NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" SERIAL PRIMARY KEY,
  "code" VARCHAR(50) NOT NULL UNIQUE,
  "discountType" VARCHAR(20) NOT NULL,
  "discountValue" INTEGER NOT NULL,
  "minPurchaseAmount" INTEGER DEFAULT 0 NOT NULL,
  "maxUses" INTEGER DEFAULT 0 NOT NULL,
  "usedCount" INTEGER DEFAULT 0 NOT NULL,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "validFrom" TIMESTAMP DEFAULT NOW() NOT NULL,
  "validUntil" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
