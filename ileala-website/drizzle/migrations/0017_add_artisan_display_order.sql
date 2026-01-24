-- Migration: Add displayOrder to artisans table
-- Created: 2026-01-24
-- Description: Adds displayOrder field for manual ordering of artisans

-- Add displayOrder column
ALTER TABLE "artisans" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS "artisans_display_order_idx" ON "artisans" ("displayOrder");
