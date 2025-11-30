-- Add 2FA support to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorSecret" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "twoFactorBackupCodes" TEXT; -- JSON array of backup codes

-- Create index for faster 2FA lookups
CREATE INDEX IF NOT EXISTS "users_two_factor_enabled_idx" ON "users" ("twoFactorEnabled");
