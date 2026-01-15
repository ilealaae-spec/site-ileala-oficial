-- ============================================================================
-- SQL COMPLETO: Criar Tabelas e Gerar Códigos de Backup no Neon
-- ============================================================================
-- Cole este SQL completo no SQL Editor do Neon e execute
-- ============================================================================

-- 1. Criar tabela users com suporte a 2FA
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

-- 2. Criar usuário admin com senha hashada
-- Senha: IleAla@2025 (hash bcrypt gerado)
INSERT INTO "users" (email, name, password, role, "twoFactorEnabled", "emailVerified", "createdAt", "updatedAt", "lastSignedIn")
VALUES (
  'ceo@ileala.ae',
  'CEO Admin',
  '$2b$10$HvBfygcg3oXZ4lF7t6OzDuRFyjdJ/aw0KUeY1x4W/hRHYiZTEVf1.', -- Hash de IleAla@2025
  'admin',
  1, -- 2FA habilitado
  1, -- Email verificado
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  "twoFactorEnabled" = 1,
  password = '$2b$10$HvBfygcg3oXZ4lF7t6OzDuRFyjdJ/aw0KUeY1x4W/hRHYiZTEVf1.',
  "updatedAt" = NOW();

-- 4. Gerar códigos de backup do 2FA
DO $$
DECLARE
  codes_array text[];
  code_text text;
  i integer;
  user_id INTEGER;
BEGIN
  -- Buscar ID do usuário admin
  SELECT id INTO user_id FROM "users" WHERE email = 'ceo@ileala.ae';
  
  -- Gerar 10 códigos de backup
  codes_array := ARRAY[]::text[];
  FOR i IN 1..10 LOOP
    code_text := upper(
      substring(md5(random()::text || clock_timestamp()::text || i::text), 1, 4) || '-' ||
      substring(md5(random()::text || clock_timestamp()::text || i::text), 5, 4)
    );
    codes_array := array_append(codes_array, code_text);
  END LOOP;
  
  -- Atualizar códigos de backup no banco
  UPDATE "users" 
  SET 
    "twoFactorBackupCodes" = array_to_json(codes_array)::text,
    "updatedAt" = NOW()
  WHERE id = user_id
    AND "twoFactorEnabled" = 1;
END $$;

-- 5. Ver os códigos gerados (COPIE ESTA COLUNA!)
SELECT 
  id,
  email,
  name,
  role,
  "twoFactorEnabled",
  "twoFactorBackupCodes" as codigos_backup
FROM "users" 
WHERE email = 'ceo@ileala.ae';

