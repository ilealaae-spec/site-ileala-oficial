-- ============================================================================
-- Script SQL para Gerar Códigos de Backup do 2FA
-- ============================================================================
-- 
-- ATENÇÃO: Este script gera códigos aleatórios, mas é melhor usar o script
-- TypeScript (gerar-codigos-backup-2fa.ts) que usa a função oficial do sistema
-- 
-- Como executar:
-- 1. Acesse o Railway Dashboard
-- 2. Vá em Database → Query
-- 3. Execute este script
-- ============================================================================

-- Primeiro, verifique se o usuário tem 2FA habilitado
SELECT 
  email,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorBackupCodes" IS NULL THEN 'Nenhum código'
    ELSE 'Códigos existentes'
  END as status
FROM users 
WHERE email = 'ceo@ileala.ae';

-- NOTA: Para gerar códigos de backup corretamente, use o script TypeScript:
-- npx tsx gerar-codigos-backup-2fa.ts
-- 
-- Ou use a função do sistema via API após fazer login no painel admin

