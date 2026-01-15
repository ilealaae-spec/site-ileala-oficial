#!/usr/bin/env tsx
/**
 * Script de diagnóstico para verificar acesso ao painel admin
 * 
 * Este script verifica:
 * 1. Se o usuário existe no banco
 * 2. Se o role está correto
 * 3. Se o 2FA está desabilitado
 * 4. Se a senha está correta
 */

import * as db from './ileala-website/server/db';

const ADMIN_EMAIL = 'ceo@ileala.ae';

async function diagnostico() {
  console.log('🔍 DIAGNÓSTICO DE ACESSO AO PAINEL ADMIN\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. Verificar conexão com banco
    console.log('1️⃣ Verificando conexão com banco de dados...');
    const database = await db.getDb();
    if (!database) {
      console.error('❌ ERRO: Não foi possível conectar ao banco de dados');
      console.error('   Verifique se DATABASE_URL está configurada no Railway');
      return;
    }
    console.log('✅ Conexão estabelecida\n');

    // 2. Buscar usuário admin
    console.log('2️⃣ Buscando usuário admin...');
    const user = await db.getUserByEmail(ADMIN_EMAIL);
    
    if (!user) {
      console.error('❌ ERRO: Usuário admin não encontrado!');
      console.error(`   Email: ${ADMIN_EMAIL}`);
      console.error('\n   SOLUÇÃO: Execute o script fix-admin-access.ts para criar o usuário');
      return;
    }
    console.log('✅ Usuário encontrado\n');

    // 3. Verificar dados do usuário
    console.log('3️⃣ Verificando dados do usuário:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name || '(não definido)'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   2FA Habilitado: ${user.twoFactorEnabled === 1 || user.twoFactorEnabled === true ? 'SIM ❌' : 'NÃO ✅'}`);
    console.log(`   Tem senha: ${user.password ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log(`   Email verificado: ${user.emailVerified === 1 ? 'SIM ✅' : 'NÃO ❌'}`);
    console.log('');

    // 4. Verificar role
    console.log('4️⃣ Verificando role...');
    if (user.role !== 'admin') {
      console.error('❌ PROBLEMA: Role não é "admin"!');
      console.error(`   Role atual: "${user.role}"`);
      console.error('   SOLUÇÃO: Execute o script fix-admin-access.ts para corrigir');
    } else {
      console.log('✅ Role está correto (admin)\n');
    }

    // 5. Verificar 2FA
    console.log('5️⃣ Verificando 2FA...');
    const is2FAEnabled = user.twoFactorEnabled === 1 || user.twoFactorEnabled === true;
    if (is2FAEnabled) {
      console.error('❌ PROBLEMA: 2FA está habilitado!');
      console.error('   Isso pode estar bloqueando o acesso');
      console.error('   SOLUÇÃO: Execute o script fix-admin-access.ts para desabilitar');
    } else {
      console.log('✅ 2FA está desabilitado\n');
    }

    // 6. Verificar senha
    console.log('6️⃣ Verificando senha...');
    if (!user.password) {
      console.error('❌ PROBLEMA: Usuário não tem senha definida!');
      console.error('   SOLUÇÃO: Execute o script fix-admin-access.ts para definir senha');
    } else {
      console.log('✅ Senha está definida');
      console.log('   Para testar, tente fazer login com:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Senha: IleAla@2025\n`);
    }

    // 7. Resumo
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RESUMO DO DIAGNÓSTICO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const problemas: string[] = [];
    
    if (user.role !== 'admin') {
      problemas.push('Role não é "admin"');
    }
    
    if (is2FAEnabled) {
      problemas.push('2FA está habilitado');
    }
    
    if (!user.password) {
      problemas.push('Senha não está definida');
    }

    if (problemas.length === 0) {
      console.log('✅ TUDO OK! O usuário está configurado corretamente.\n');
      console.log('⚠️  Se ainda não conseguir acessar, verifique:');
      console.log('   1. Se o servidor está rodando no Railway');
      console.log('   2. Se a API tRPC está funcionando (verifique logs)');
      console.log('   3. Se os cookies estão sendo criados após login');
      console.log('   4. Se há erros no console do navegador (F12)\n');
    } else {
      console.log('❌ PROBLEMAS ENCONTRADOS:\n');
      problemas.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p}`);
      });
      console.log('\n🔧 SOLUÇÃO:');
      console.log('   Execute: tsx fix-admin-access.ts\n');
    }

    // 8. Instruções de teste
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 COMO TESTAR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Acesse: https://ileala.ae/login');
    console.log('2. Use as credenciais:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log('   Senha: IleAla@2025');
    console.log('3. Após login, acesse: https://admin.ileala.ae/admin');
    console.log('4. Se aparecer "Access Denied":');
    console.log('   - Abra o DevTools (F12)');
    console.log('   - Vá em Application → Cookies');
    console.log('   - Verifique se existe o cookie "__session"');
    console.log('   - Verifique o console para erros\n');

  } catch (error) {
    console.error('\n❌ ERRO durante diagnóstico:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

diagnostico()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

