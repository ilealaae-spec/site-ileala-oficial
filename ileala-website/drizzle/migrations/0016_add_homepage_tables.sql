-- Migration: Add Homepage Tables
-- Created: 2026-01-24
-- Description: Adds hero_slides, homepage_videos, and homepage_cards tables

-- Hero Slides table - for homepage carousel
CREATE TABLE IF NOT EXISTS "hero_slides" (
  "id" SERIAL PRIMARY KEY,
  "imageUrl" VARCHAR(512) NOT NULL,
  "altText" VARCHAR(255),
  "titleEN" VARCHAR(255),
  "titlePT" VARCHAR(255),
  "subtitleEN" TEXT,
  "subtitlePT" TEXT,
  "linkUrl" VARCHAR(512),
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Homepage Videos table - for video gallery
CREATE TABLE IF NOT EXISTS "homepage_videos" (
  "id" SERIAL PRIMARY KEY,
  "videoUrl" VARCHAR(512) NOT NULL,
  "thumbnailUrl" VARCHAR(512),
  "titleEN" VARCHAR(255),
  "titlePT" VARCHAR(255),
  "descriptionEN" TEXT,
  "descriptionPT" TEXT,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Homepage Cards table - for "About Us" section cards
CREATE TABLE IF NOT EXISTS "homepage_cards" (
  "id" SERIAL PRIMARY KEY,
  "imageUrl" VARCHAR(512) NOT NULL,
  "titleEN" VARCHAR(255) NOT NULL,
  "titlePT" VARCHAR(255) NOT NULL,
  "linkUrl" VARCHAR(512) NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "active" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "hero_slides_order_idx" ON "hero_slides" ("displayOrder");
CREATE INDEX IF NOT EXISTS "homepage_videos_order_idx" ON "homepage_videos" ("displayOrder");
CREATE INDEX IF NOT EXISTS "homepage_cards_order_idx" ON "homepage_cards" ("displayOrder");
