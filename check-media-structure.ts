import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkStructure() {
  const result = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'media' 
    ORDER BY ordinal_position
  `;
  console.log('📋 Estrutura da tabela media:');
  console.log(result);
}

checkStructure();
