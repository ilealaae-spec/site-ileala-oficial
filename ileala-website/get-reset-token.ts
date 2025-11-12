import postgres from 'postgres';

const DATABASE_URL = 'postgresql://ileala_database_user:dynamicAI2024@oregon-postgres.render.com/ileala_database';

const sql = postgres(DATABASE_URL, {
  ssl: 'require'
});

async function getResetToken() {
  try {
    console.log('Connecting to database...');
    
    const result = await sql`
      SELECT email, reset_token, reset_token_expires 
      FROM users 
      WHERE email = 'ceo@ctbventure.com'
      AND reset_token IS NOT NULL
      ORDER BY reset_token_expires DESC
      LIMIT 1
    `;
    
    if (result.length > 0) {
      console.log('\n✅ Reset token found:');
      console.log('Email:', result[0].email);
      console.log('Token:', result[0].reset_token);
      console.log('Expires:', result[0].reset_token_expires);
      console.log('\n🔗 Reset URL:');
      console.log(`https://site-ileala-oficial.onrender.com/reset-password?token=${result[0].reset_token}`);
    } else {
      console.log('❌ No reset token found for this email');
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getResetToken();
