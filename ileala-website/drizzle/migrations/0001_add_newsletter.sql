-- Create newsletter table
CREATE TABLE IF NOT EXISTS "newsletter" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255),
  "subscribed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "active" INTEGER DEFAULT 1,
  "source" VARCHAR(50) DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS "newsletter_email_idx" ON "newsletter" ("email");
CREATE INDEX IF NOT EXISTS "newsletter_active_idx" ON "newsletter" ("active");
