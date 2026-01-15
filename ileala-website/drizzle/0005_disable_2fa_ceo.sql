-- Temporarily disable 2FA for ceo@ileala.ae to test login
-- Run this in Neon SQL Editor

UPDATE users
SET "twoFactorEnabled" = 0,
    "twoFactorSecret" = NULL,
    "twoFactorBackupCodes" = NULL
WHERE email = 'ceo@ileala.ae';

-- Verify the change
SELECT id, email, role, "twoFactorEnabled" FROM users WHERE email = 'ceo@ileala.ae';
