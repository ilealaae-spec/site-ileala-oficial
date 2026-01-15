#!/usr/bin/env tsx
/**
 * Script para corrigir acesso ao painel de admin
 * 
 * Este script:
 * 1. Verifica se o usuário admin existe
 * 2. Cria/atualiza o usuário admin se necessário
 * 3. Desabilita 2FA se estiver bloqueando o acesso
 * 4. Garante que o usuário tem role 'admin'
 * 5. Define a senha correta
 */

import * as db from './ileala-website/server/db';
import { eq } from 'drizzle-orm';
import { users } from './ileala-website/drizzle/schema';

const ADMIN_EMAIL = 'ceo@ileala.ae';
const ADMIN_PASSWORD = 'IleAla@2025';
const ADMIN_NAME = 'CEO Admin';

async function fixAdminAccess() {
  console.log('🔧 Iniciando correção de acesso ao painel de admin...\n');

  try {
    // 1. Verificar conexão com banco de dados
    console.log('1️⃣ Verificando conexão com banco de dados...');
    const database = await db.getDb();
    if (!database) {
      console.error('❌ Erro: Não foi possível conectar ao banco de dados');
      console.error('   Verifique se a variável DATABASE_URL está configurada');
      process.exit(1);
    }
    console.log('✅ Conexão com banco de dados estabelecida\n');

    // 2. Verificar se o usuário admin existe
    console.log('2️⃣ Verificando se o usuário admin existe...');
    let adminUser = await db.getUserByEmail(ADMIN_EMAIL);
    
    if (!adminUser) {
      console.log('⚠️  Usuário admin não encontrado. Criando...');
      
      // Criar usuário admin
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      const userId = await db.createUser({
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        password: ADMIN_PASSWORD,
      });
      
      // Atualizar role para admin
      await db.updateUserRole(userId, 'admin');
      
      // Buscar usuário criado
      adminUser = await db.getUserById(userId);
      console.log('✅ Usuário admin criado com sucesso\n');
    } else {
      console.log('✅ Usuário admin encontrado\n');
    }

    if (!adminUser) {
      throw new Error('Falha ao criar/buscar usuário admin');
    }

    // 3. Verificar e corrigir role
    console.log('3️⃣ Verificando role do usuário...');
    if (adminUser.role !== 'admin') {
      console.log('⚠️  Role não é admin. Corrigindo...');
      await db.updateUserRole(adminUser.id, 'admin');
      console.log('✅ Role atualizado para admin\n');
    } else {
      console.log('✅ Role já está como admin\n');
    }

    // 4. Verificar e desabilitar 2FA se necessário
    console.log('4️⃣ Verificando status do 2FA...');
    const is2FAEnabled = adminUser.twoFactorEnabled === 1 || adminUser.twoFactorEnabled === true;
    
    if (is2FAEnabled) {
      console.log('⚠️  2FA está habilitado. Desabilitando...');
      
      // Desabilitar 2FA diretamente no banco
      const database = await db.getDb();
      if (!database) {
        throw new Error('Database not available');
      }
      
      await database.update(users)
        .set({ 
          twoFactorEnabled: 0,
          twoFactorSecret: null,
          twoFactorBackupCodes: null,
        })
        .where(eq(users.id, adminUser.id));
      
      console.log('✅ 2FA desabilitado\n');
    } else {
      console.log('✅ 2FA já está desabilitado\n');
    }

    // 5. Verificar e atualizar senha se necessário
    console.log('5️⃣ Verificando senha...');
    if (!adminUser.password) {
      console.log('⚠️  Usuário não tem senha. Definindo...');
      await db.updateUserPassword(adminUser.id, ADMIN_PASSWORD);
      console.log('✅ Senha definida\n');
    } else {
      const bcrypt = await import('bcryptjs');
      const passwordMatches = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password);
      
      if (!passwordMatches) {
        console.log('⚠️  Senha não corresponde. Atualizando...');
        await db.updateUserPassword(adminUser.id, ADMIN_PASSWORD);
        console.log('✅ Senha atualizada\n');
      } else {
        console.log('✅ Senha está correta\n');
      }
    }

    // 6. Resumo final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Credenciais de acesso:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
    console.log('🌐 URLs de acesso:');
    console.log(`   Site principal: https://ileala.ae/login`);
    console.log(`   Admin direto: https://admin.ileala.ae/admin`);
    console.log(`   Login emergência: https://ileala.ae/admin-emergency-login\n`);
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Se ainda não conseguir acessar, verifique:');
    console.log('     1. Se o servidor está rodando no Railway');
    console.log('     2. Se as variáveis de ambiente estão configuradas');
    console.log('     3. Se há erros no console do navegador');
    console.log('     4. Se os cookies estão sendo bloqueados\n');

  } catch (error) {
    console.error('\n❌ ERRO durante a correção:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Executar script
fixAdminAccess()
  .then(() => {
    console.log('✅ Script executado com sucesso');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

