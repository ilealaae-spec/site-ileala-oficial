-- Create login_history table for tracking login attempts
CREATE TABLE IF NOT EXISTS "login_history" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "ip" VARCHAR(45) NOT NULL, -- IPv4 or IPv6
  "userAgent" TEXT,
  "success" INTEGER DEFAULT 1 NOT NULL, -- 1 = success, 0 = failed
  "failureReason" VARCHAR(255), -- Reason for failure (invalid password, 2FA failed, etc)
  "location" VARCHAR(255), -- City, Country (from IP geolocation)
  "deviceType" VARCHAR(50), -- mobile, desktop, tablet
  "browser" VARCHAR(100),
  "os" VARCHAR(100),
  "notificationSent" INTEGER DEFAULT 0 NOT NULL, -- 1 = email sent, 0 = not sent
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "login_history_user_id_idx" ON "login_history" ("userId");
CREATE INDEX IF NOT EXISTS "login_history_ip_idx" ON "login_history" ("ip");
CREATE INDEX IF NOT EXISTS "login_history_created_at_idx" ON "login_history" ("createdAt");
CREATE INDEX IF NOT EXISTS "login_history_success_idx" ON "login_history" ("success");
