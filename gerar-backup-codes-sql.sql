-- ============================================================================
-- Script SQL para Gerar Códigos de Backup do 2FA
-- ============================================================================
-- Execute este script no Railway Database → Query
-- 
-- Este script:
-- 1. Verifica se o usuário tem 2FA habilitado
-- 2. Gera 10 códigos de backup no formato XXXX-XXXX
-- 3. Salva os códigos no banco de dados
-- 
-- IMPORTANTE: Guarde os códigos gerados em local seguro!
-- ============================================================================

-- Primeiro, verificar status atual
SELECT 
  id,
  email,
  "twoFactorEnabled",
  CASE 
    WHEN "twoFactorBackupCodes" IS NULL THEN 'Nenhum código'
    WHEN "twoFactorBackupCodes" = '[]' THEN 'Nenhum código'
    ELSE 'Códigos existentes: ' || json_array_length("twoFactorBackupCodes"::json)::text
  END as status_backup
FROM users 
WHERE email = 'ceo@ileala.ae';

-- Gerar códigos de backup (formato: XXXX-XXXX)
-- Cada código é uma string hexadecimal de 8 caracteres formatada
WITH generated_codes AS (
  SELECT 
    array_agg(
      upper(
        substring(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
        substring(md5(random()::text || clock_timestamp()::text), 5, 4)
      )
    ) as codes
  FROM generate_series(1, 10)
)
UPDATE users 
SET 
  "twoFactorBackupCodes" = (
    SELECT json_agg(code)::text 
    FROM unnest((SELECT codes FROM generated_codes)) as code
  ),
  "updatedAt" = NOW()
WHERE email = 'ceo@ileala.ae'
  AND "twoFactorEnabled" = 1;

-- Verificar se os códigos foram gerados
SELECT 
  email,
  "twoFactorEnabled",
  "twoFactorBackupCodes" as codigos_backup
FROM users 
WHERE email = 'ceo@ileala.ae';

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- 1. Execute este script completo no Railway Database → Query
-- 2. Copie os códigos de backup da última query
-- 3. Guarde os códigos em local seguro (password manager, arquivo criptografado)
-- 4. Use um código de backup quando fizer login e aparecer a tela de 2FA
-- ============================================================================

