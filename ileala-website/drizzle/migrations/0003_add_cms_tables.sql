-- Add CMS tables for artisans, content, media, and settings

-- Artisans table
CREATE TABLE IF NOT EXISTS "artisans" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "bio" TEXT,
  "bioEN" TEXT,
  "bioPT" TEXT,
  "photoUrl" VARCHAR(512),
  "specialty" VARCHAR(255),
  "location" VARCHAR(255),
  "email" VARCHAR(320),
  "phone" VARCHAR(50),
  "socialMedia" TEXT,
  "featured" INTEGER DEFAULT 0 NOT NULL,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Site content table
CREATE TABLE IF NOT EXISTS "siteContent" (
  "id" SERIAL PRIMARY KEY,
  "key" VARCHAR(255) NOT NULL UNIQUE,
  "contentType" VARCHAR(50) NOT NULL,
  "contentEN" TEXT,
  "contentPT" TEXT,
  "metadata" TEXT,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Media library table
CREATE TABLE IF NOT EXISTS "media" (
  "id" SERIAL PRIMARY KEY,
  "filename" VARCHAR(255) NOT NULL,
  "originalName" VARCHAR(255) NOT NULL,
  "url" VARCHAR(512) NOT NULL,
  "mimeType" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "alt" VARCHAR(255),
  "caption" TEXT,
  "folder" VARCHAR(255) DEFAULT 'general',
  "uploadedBy" INTEGER REFERENCES "users"("id"),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Site settings table
CREATE TABLE IF NOT EXISTS "siteSettings" (
  "id" SERIAL PRIMARY KEY,
  "key" VARCHAR(255) NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "category" VARCHAR(100) DEFAULT 'general',
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "artisans_featured_idx" ON "artisans"("featured");
CREATE INDEX IF NOT EXISTS "artisans_active_idx" ON "artisans"("active");
CREATE INDEX IF NOT EXISTS "siteContent_key_idx" ON "siteContent"("key");
CREATE INDEX IF NOT EXISTS "siteContent_active_idx" ON "siteContent"("active");
CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media"("folder");
CREATE INDEX IF NOT EXISTS "siteSettings_key_idx" ON "siteSettings"("key");
CREATE INDEX IF NOT EXISTS "siteSettings_category_idx" ON "siteSettings"("category");
