#!/usr/bin/env tsx
/**
 * Script para gerar códigos de backup do 2FA
 * 
 * Este script:
 * 1. Verifica se o usuário admin tem 2FA habilitado
 * 2. Verifica se há códigos de backup existentes
 * 3. Gera novos códigos de backup se necessário
 * 4. Mostra os códigos de backup para uso
 * 
 * IMPORTANTE: Guarde estes códigos em local seguro!
 */

import * as db from './ileala-website/server/db';
import { generateBackupCodes } from './ileala-website/server/two-factor';

const ADMIN_EMAIL = 'ceo@ileala.ae';

async function gerarCodigosBackup() {
  console.log('🔐 Gerando Códigos de Backup do 2FA\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Verificar conexão com banco
    console.log('1️⃣ Verificando conexão com banco de dados...');
    const database = await db.getDb();
    if (!database) {
      console.error('❌ Erro: Não foi possível conectar ao banco de dados');
      console.error('   Verifique se DATABASE_URL está configurada');
      process.exit(1);
    }
    console.log('✅ Conexão estabelecida\n');

    // 2. Buscar usuário admin
    console.log('2️⃣ Buscando usuário admin...');
    const user = await db.getUserByEmail(ADMIN_EMAIL);
    
    if (!user) {
      console.error('❌ Erro: Usuário admin não encontrado!');
      console.error(`   Email: ${ADMIN_EMAIL}`);
      process.exit(1);
    }
    console.log('✅ Usuário encontrado\n');

    // 3. Verificar se 2FA está habilitado
    console.log('3️⃣ Verificando status do 2FA...');
    const is2FAEnabled = user.twoFactorEnabled === 1 || user.twoFactorEnabled === true;
    
    if (!is2FAEnabled) {
      console.log('⚠️  2FA não está habilitado para este usuário.');
      console.log('   Para habilitar 2FA, use o painel admin após fazer login.\n');
      return;
    }
    console.log('✅ 2FA está habilitado\n');

    // 4. Verificar códigos de backup existentes
    console.log('4️⃣ Verificando códigos de backup existentes...');
    let backupCodes: string[] = [];
    
    if (user.twoFactorBackupCodes) {
      try {
        backupCodes = JSON.parse(user.twoFactorBackupCodes);
        console.log(`✅ Encontrados ${backupCodes.length} códigos de backup existentes\n`);
      } catch (error) {
        console.log('⚠️  Códigos de backup existentes estão corrompidos. Gerando novos...\n');
        backupCodes = [];
      }
    } else {
      console.log('⚠️  Nenhum código de backup encontrado. Gerando novos...\n');
    }

    // 5. Gerar novos códigos se necessário
    if (backupCodes.length === 0) {
      console.log('5️⃣ Gerando novos códigos de backup...');
      backupCodes = generateBackupCodes(10);
      
      // Salvar no banco
      await db.updateBackupCodes(user.id, JSON.stringify(backupCodes));
      console.log('✅ Códigos de backup gerados e salvos no banco\n');
    } else {
      console.log('5️⃣ Usando códigos de backup existentes\n');
    }

    // 6. Mostrar códigos de backup
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 CÓDIGOS DE BACKUP DO 2FA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANTE: Guarde estes códigos em local seguro!');
    console.log('   Cada código só pode ser usado UMA vez.\n');
    
    backupCodes.forEach((code, index) => {
      console.log(`   ${(index + 1).toString().padStart(2, '0')}. ${code}`);
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 COMO USAR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Faça login em: https://ileala.ae/login');
    console.log('2. Use as credenciais:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('   Senha: IleAla@2025');
    console.log('3. Quando aparecer a tela de 2FA:');
    console.log('   - Opção A: Use o código do seu app autenticador (Google Authenticator, Authy, etc.)');
    console.log('   - Opção B: Use um dos códigos de backup acima');
    console.log('4. Digite o código (6 dígitos do app ou código de backup)');
    console.log('5. Clique em "Verify & Sign In"\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 SEGURANÇA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ 2FA permanece habilitado (segurança mantida)');
    console.log('✅ Códigos de backup permitem recuperação de acesso');
    console.log('✅ Cada código de backup só pode ser usado uma vez');
    console.log('✅ Se perder todos os códigos, execute este script novamente\n');

  } catch (error) {
    console.error('\n❌ ERRO durante a geração:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

gerarCodigosBackup()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

