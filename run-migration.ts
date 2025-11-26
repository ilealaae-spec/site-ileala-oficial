import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './ileala-website/.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  const sql = postgres(DATABASE_URL);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'ileala-website/drizzle/migrations/0004_add_product_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL...\n');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        await sql.unsafe(statement);
        successCount++;
        
        // Extract operation type
        const operation = statement.split(' ')[0].toUpperCase();
        if (operation === 'ALTER') {
          const match = statement.match(/ADD COLUMN "([^"]+)"/);
          if (match) {
            console.log(`✅ Added column: ${match[1]}`);
          }
        } else if (operation === 'CREATE') {
          const match = statement.match(/INDEX "([^"]+)"/);
          if (match) {
            console.log(`✅ Created index: ${match[1]}`);
          }
        } else if (operation === 'COMMENT') {
          // Skip logging comments
        }
      } catch (error: any) {
        errorCount++;
        console.error(`❌ Error: ${error.message}`);
      }
    }

    console.log(`\n📊 Migration completed!`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);

    await sql.end();

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
