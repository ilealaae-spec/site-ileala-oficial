-- Create collections table
CREATE TABLE IF NOT EXISTS "collections" (
  "id" SERIAL PRIMARY KEY,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "nameEN" VARCHAR(255) NOT NULL,
  "namePT" VARCHAR(255) NOT NULL,
  "descriptionEN" TEXT,
  "descriptionPT" TEXT,
  "imageUrl" VARCHAR(512),
  "displayOrder" INTEGER DEFAULT 0 NOT NULL,
  "active" INTEGER DEFAULT 1 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS "collections_slug_idx" ON "collections" ("slug");
