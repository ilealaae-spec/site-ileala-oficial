-- Migration: Add all missing product fields from Sanity schema
-- Created: 2025-11-26

-- Add Full Description (long text)
ALTER TABLE "products" ADD COLUMN "description" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionEN_full" TEXT;
ALTER TABLE "products" ADD COLUMN "descriptionPT_full" TEXT;

-- Add Sale Price
ALTER TABLE "products" ADD COLUMN "salePrice" INTEGER;

-- Add Images (JSON array for multiple images)
ALTER TABLE "products" ADD COLUMN "mainImage" VARCHAR(512);
ALTER TABLE "products" ADD COLUMN "mainImageAlt" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "images" TEXT; -- JSON array of image objects

-- Add Specifications
ALTER TABLE "products" ADD COLUMN "material" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "dimensions" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "colors" TEXT; -- JSON array of colors
ALTER TABLE "products" ADD COLUMN "careInstructions" TEXT;
ALTER TABLE "products" ADD COLUMN "careInstructionsEN" TEXT;
ALTER TABLE "products" ADD COLUMN "careInstructionsPT" TEXT;
ALTER TABLE "products" ADD COLUMN "weight" DECIMAL(10, 2);

-- Add E-commerce fields
ALTER TABLE "products" ADD COLUMN "sku" VARCHAR(100);
ALTER TABLE "products" ADD COLUMN "inStock" BOOLEAN DEFAULT true;
ALTER TABLE "products" ADD COLUMN "stockQuantity" INTEGER DEFAULT 0;
ALTER TABLE "products" ADD COLUMN "isNew" BOOLEAN DEFAULT false;
ALTER TABLE "products" ADD COLUMN "onSale" BOOLEAN DEFAULT false;

-- Add SEO fields
ALTER TABLE "products" ADD COLUMN "seoTitle" VARCHAR(60);
ALTER TABLE "products" ADD COLUMN "seoDescription" VARCHAR(160);

-- Add indexes for better performance
CREATE INDEX "idx_products_sku" ON "products"("sku");
CREATE INDEX "idx_products_inStock" ON "products"("inStock");
CREATE INDEX "idx_products_isNew" ON "products"("isNew");
CREATE INDEX "idx_products_onSale" ON "products"("onSale");
CREATE INDEX "idx_products_featured" ON "products"("featured");

-- Add comments for documentation
COMMENT ON COLUMN "products"."description" IS 'Full product description (legacy field)';
COMMENT ON COLUMN "products"."descriptionEN_full" IS 'Full product description in English';
COMMENT ON COLUMN "products"."descriptionPT_full" IS 'Full product description in Portuguese';
COMMENT ON COLUMN "products"."salePrice" IS 'Sale price in cents (AED)';
COMMENT ON COLUMN "products"."mainImage" IS 'Main product image URL';
COMMENT ON COLUMN "products"."mainImageAlt" IS 'Alt text for main image';
COMMENT ON COLUMN "products"."images" IS 'JSON array of additional product images';
COMMENT ON COLUMN "products"."material" IS 'Product material (e.g., 100% Linen, Egyptian Cotton)';
COMMENT ON COLUMN "products"."dimensions" IS 'Product dimensions (e.g., 150x200cm, 40x40cm)';
COMMENT ON COLUMN "products"."colors" IS 'JSON array of available colors';
COMMENT ON COLUMN "products"."careInstructions" IS 'Care instructions (legacy field)';
COMMENT ON COLUMN "products"."careInstructionsEN" IS 'Care instructions in English';
COMMENT ON COLUMN "products"."careInstructionsPT" IS 'Care instructions in Portuguese';
COMMENT ON COLUMN "products"."weight" IS 'Product weight in kg for shipping calculation';
COMMENT ON COLUMN "products"."sku" IS 'Stock Keeping Unit / Product Code';
COMMENT ON COLUMN "products"."inStock" IS 'Whether product is in stock';
COMMENT ON COLUMN "products"."stockQuantity" IS 'Number of items in stock';
COMMENT ON COLUMN "products"."isNew" IS 'Show "New" badge on product';
COMMENT ON COLUMN "products"."onSale" IS 'Show "Sale" badge on product';
COMMENT ON COLUMN "products"."seoTitle" IS 'SEO title for search engines (max 60 characters)';
COMMENT ON COLUMN "products"."seoDescription" IS 'SEO description for search engines (max 160 characters)';
