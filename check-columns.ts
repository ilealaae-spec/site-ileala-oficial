import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: './ileala-website/.env' });

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = postgres(DATABASE_URL);

async function checkColumns() {
  const result = await sql`
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'products'
    ORDER BY ordinal_position;
  `;

  console.log('📋 Current columns in products table:\n');
  result.forEach((col: any) => {
    const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
    console.log(`- ${col.column_name}: ${col.data_type}${length}`);
  });

  await sql.end();
}

checkColumns();
