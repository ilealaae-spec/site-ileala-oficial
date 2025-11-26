import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function testGetUser() {
  try {
    console.log('🔍 Buscando usuário ceo@ileala.ae...');
    
    // Buscar usuário por email
    const users = await sql`
      SELECT * 
      FROM users 
      WHERE email = 'ceo@ileala.ae'
    `;
    
    if (users.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const user = users[0];
    console.log('✅ Usuário encontrado:');
    console.log(JSON.stringify(user, null, 2));
    
    console.log('\n📋 Campos importantes:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Role:', user.role);
    console.log('- Login Method:', user.loginMethod || user.login_method);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testGetUser();
