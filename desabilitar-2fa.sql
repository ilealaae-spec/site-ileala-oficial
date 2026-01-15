-- ============================================================================
-- Script SQL para Desabilitar 2FA e Garantir Acesso Admin
-- ============================================================================
-- Execute este script diretamente no banco de dados do Railway
-- 
-- Como executar:
-- 1. Acesse o Railway Dashboard
-- 2. Vá em seu serviço → Database → Query
-- 3. Cole este script e execute
-- ============================================================================

-- Desabilitar 2FA para o usuário admin
UPDATE users 
SET 
  "twoFactorEnabled" = 0,
  "twoFactorSecret" = NULL,
  "twoFactorBackupCodes" = NULL
WHERE email = 'ceo@ileala.ae';

-- Garantir que o role é 'admin'
UPDATE users 
SET role = 'admin'
WHERE email = 'ceo@ileala.ae';

-- Verificar o resultado
SELECT 
  id,
  email,
  name,
  role,
  "twoFactorEnabled",
  "emailVerified"
FROM users 
WHERE email = 'ceo@ileala.ae';

