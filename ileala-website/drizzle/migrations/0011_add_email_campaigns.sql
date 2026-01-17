-- Create email_campaigns table for marketing emails
CREATE TABLE IF NOT EXISTS "email_campaigns" (
  "id" SERIAL PRIMARY KEY,
  "subject" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "recipientType" VARCHAR(50) NOT NULL,
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
  "sentBy" INTEGER REFERENCES "users"("id"),
  "sentAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
