-- Add missing columns to products table
-- Run this migration on your PostgreSQL database

-- Add slug column (required, unique)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug varchar(255);
UPDATE products SET slug = LOWER(REPLACE(REPLACE("nameEN", ' ', '-'), '''', '')) || '-' || id WHERE slug IS NULL;
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON products(slug);

-- Add image related columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS "mainImage" varchar(512);
ALTER TABLE products ADD COLUMN IF NOT EXISTS "mainImageAlt" varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text;

-- Add pricing columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS "salePrice" integer;

-- Add extended description columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS "descriptionEN_full" text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "descriptionPT_full" text;

-- Add product details columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS material varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS "careInstructionsEN" text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "careInstructionsPT" text;

-- Add inventory columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight integer;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku varchar(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS "inStock" integer DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "stockQuantity" integer DEFAULT 0;

-- Add status columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isNew" integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "onSale" integer DEFAULT 0;

-- Add SEO columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS "seoTitle" varchar(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS "seoDescription" text;
