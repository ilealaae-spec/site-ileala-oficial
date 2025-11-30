-- Create audit_logs table for security and compliance
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id"),
  "userEmail" VARCHAR(320) NOT NULL,
  "action" VARCHAR(50) NOT NULL, -- create, update, delete, login, logout
  "entity" VARCHAR(50) NOT NULL, -- product, category, collection, user, etc
  "entityId" INTEGER, -- ID of the affected entity
  "ipAddress" VARCHAR(45), -- IPv4 or IPv6
  "userAgent" TEXT,
  "changes" JSONB, -- Store before/after data for rollback
  "metadata" JSONB, -- Additional context
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_idx" ON "audit_logs" ("entity");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("createdAt");
