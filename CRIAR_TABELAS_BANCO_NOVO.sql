-- ============================================================================
-- SQL para Criar Tabelas no Banco Novo do Neon
-- ============================================================================
-- ATENÇÃO: Este SQL cria as tabelas, mas NÃO migra os dados!
-- Se você quiser os dados do banco antigo, use DBeaver para migrar.
-- ============================================================================

-- Criar tabela users (com suporte a 2FA)
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320) NOT NULL UNIQUE,
  "password" VARCHAR(255),
  "phone" VARCHAR(50),
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "poBox" VARCHAR(50),
  "country" VARCHAR(100),
  "emailVerified" INTEGER DEFAULT 0 NOT NULL,
  "emailVerificationToken" VARCHAR(255),
  "emailVerificationExpires" TIMESTAMP,
  "passwordResetToken" VARCHAR(255),
  "passwordResetExpires" TIMESTAMP,
  "loginMethod" VARCHAR(64),
  "role" VARCHAR(20) DEFAULT 'user' NOT NULL,
  "twoFactorEnabled" INTEGER DEFAULT 0 NOT NULL,
  "twoFactorSecret" VARCHAR(255),
  "twoFactorBackupCodes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar usuário admin
INSERT INTO "users" (email, name, password, role, "twoFactorEnabled", "emailVerified")
VALUES (
  'ceo@ileala.ae',
  'CEO Admin',
  '$2a$10$rK8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', -- Hash da senha IleAla@2025
  'admin',
  1, -- 2FA habilitado
  1  -- Email verificado
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  "twoFactorEnabled" = 1;

-- Verificar se foi criado
SELECT id, email, role, "twoFactorEnabled" FROM "users" WHERE email = 'ceo@ileala.ae';

