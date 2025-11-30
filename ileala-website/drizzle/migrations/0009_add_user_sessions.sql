-- Create user_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS "user_sessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
  "ip" VARCHAR(45) NOT NULL,
  "userAgent" TEXT,
  "deviceType" VARCHAR(50),
  "browser" VARCHAR(100),
  "os" VARCHAR(100),
  "lastActivity" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "user_sessions_user_id_idx" ON "user_sessions" ("userId");
CREATE INDEX IF NOT EXISTS "user_sessions_token_idx" ON "user_sessions" ("sessionToken");
CREATE INDEX IF NOT EXISTS "user_sessions_expires_at_idx" ON "user_sessions" ("expiresAt");
