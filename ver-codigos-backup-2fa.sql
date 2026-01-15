-- ============================================================================
-- Script SQL para Ver Códigos de Backup do 2FA
-- ============================================================================
-- Execute este script no Railway Database → Query
-- 
-- IMPORTANTE: Este script apenas MOSTRA os códigos, não os modifica
-- ============================================================================

-- Ver informações do 2FA e códigos de backup
SELECT 
  id,
  email,
  name,
  role,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorBackupCodes" IS NULL THEN 'Nenhum código de backup'
    WHEN "twoFactorBackupCodes" = '[]' THEN 'Nenhum código de backup'
    ELSE 'Códigos de backup disponíveis'
  END as status_backup_codes,
  LENGTH("twoFactorBackupCodes") as tamanho_codigos
FROM users 
WHERE email = 'ceo@ileala.ae';

-- Se quiser ver os códigos (descomente a linha abaixo)
-- ATENÇÃO: Isso expõe os códigos no log. Use com cuidado!
-- SELECT "twoFactorBackupCodes" FROM users WHERE email = 'ceo@ileala.ae';

