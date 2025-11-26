/**
 * Script para criar usuário admin permanente no banco de dados
 * 
 * USO:
 *   pnpm tsx scripts/create-admin.ts
 * 
 * IMPORTANTE:
 *   - Este script cria um usuário admin com credenciais de emergência
 *   - Só precisa ser executado UMA VEZ após setup inicial
 *   - Se o usuário já existir, apenas atualiza a senha
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Credenciais do admin
const ADMIN_EMAIL = 'ceo@ileala.ae';
const ADMIN_PASSWORD = 'IleAla@2025';
const ADMIN_NAME = 'CEO Admin';

async function createAdminUser() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL não está configurada!');
    console.error('   Configure a variável de ambiente DATABASE_URL antes de executar este script.');
    process.exit(1);
  }

  console.log('🔧 Conectando ao banco de dados...');
  const sql = neon(databaseUrl);

  try {
    // Verificar se o usuário já existe
    console.log(`🔍 Verificando se o usuário ${ADMIN_EMAIL} já existe...`);
    const existingUsers = await sql`
      SELECT id, email, role FROM users WHERE email = ${ADMIN_EMAIL}
    `;

    // Hash da senha
    console.log('🔐 Gerando hash da senha...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    if (existingUsers.length > 0) {
      // Usuário já existe, atualizar senha e role
      console.log('⚠️  Usuário já existe! Atualizando senha e role...');
      
      await sql`
        UPDATE users 
        SET 
          password_hash = ${passwordHash},
          role = 'admin',
          name = ${ADMIN_NAME},
          updated_at = NOW()
        WHERE email = ${ADMIN_EMAIL}
      `;
      
      console.log('✅ Usuário admin atualizado com sucesso!');
    } else {
      // Criar novo usuário
      console.log('➕ Criando novo usuário admin...');
      
      await sql`
        INSERT INTO users (
          open_id,
          email,
          password_hash,
          name,
          role,
          login_method,
          created_at,
          updated_at
        ) VALUES (
          'admin-permanent-001',
          ${ADMIN_EMAIL},
          ${passwordHash},
          ${ADMIN_NAME},
          'admin',
          'email',
          NOW(),
          NOW()
        )
      `;
      
      console.log('✅ Usuário admin criado com sucesso!');
    }

    // Verificar o usuário criado
    console.log('\n📋 Detalhes do usuário admin:');
    const adminUser = await sql`
      SELECT id, email, name, role, login_method, created_at 
      FROM users 
      WHERE email = ${ADMIN_EMAIL}
    `;
    
    if (adminUser.length > 0) {
      console.table(adminUser[0]);
      console.log('\n🎉 SUCESSO! Você pode fazer login com:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Senha: ${ADMIN_PASSWORD}`);
      console.log(`   Role: admin`);
    }

  } catch (error) {
    console.error('\n❌ ERRO ao criar usuário admin:');
    console.error(error);
    process.exit(1);
  }
}

// Executar script
console.log('🚀 Iniciando criação de usuário admin...\n');
createAdminUser()
  .then(() => {
    console.log('\n✨ Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
