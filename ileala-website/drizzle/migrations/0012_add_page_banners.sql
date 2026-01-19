-- Migration: Add page_banners table for CMS management of page hero images
-- Created: 2025-01-19

CREATE TABLE IF NOT EXISTS "page_banners" (
  "id" SERIAL PRIMARY KEY,
  "pageSlug" VARCHAR(100) NOT NULL UNIQUE,
  "imageUrl" VARCHAR(512) NOT NULL,
  "altText" VARCHAR(255),
  "titleEN" VARCHAR(255),
  "titlePT" VARCHAR(255),
  "subtitleEN" TEXT,
  "subtitlePT" TEXT,
  "overlayOpacity" INTEGER DEFAULT 30,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups by pageSlug
CREATE INDEX IF NOT EXISTS "idx_page_banners_slug" ON "page_banners" ("pageSlug");
