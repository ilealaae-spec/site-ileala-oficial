import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function fixAdminRole() {
  try {
    console.log('🔧 Atualizando role do usuário ceo@ileala.ae para admin...');
    
    // Verificar se o usuário existe
    const users = await sql`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = 'ceo@ileala.ae'
    `;
    
    if (users.length === 0) {
      console.log('❌ Usuário ceo@ileala.ae não encontrado!');
      return;
    }
    
    console.log('📋 Usuário encontrado:', users[0]);
    
    // Atualizar role para admin
    await sql`
      UPDATE users 
      SET role = 'admin'
      WHERE email = 'ceo@ileala.ae'
    `;
    
    console.log('✅ Role atualizado com sucesso!');
    
    // Verificar a atualização
    const updatedUsers = await sql`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = 'ceo@ileala.ae'
    `;
    
    console.log('📋 Usuário atualizado:', updatedUsers[0]);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
  }
}

fixAdminRole();
