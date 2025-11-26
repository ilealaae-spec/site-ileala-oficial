import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: './ileala-website/.env' });

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = postgres(DATABASE_URL);

async function addMissingFields() {
  console.log('🚀 Adding missing fields...\n');

  try {
    // Add description (legacy field)
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`;
    console.log('✅ Added: description');

    // Add salePrice
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "salePrice" INTEGER`;
    console.log('✅ Added: salePrice');

    // Add mainImage
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "mainImage" VARCHAR(512)`;
    console.log('✅ Added: mainImage');

    // Add material
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(255)`;
    console.log('✅ Added: material');

    // Add careInstructions (legacy)
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "careInstructions" TEXT`;
    console.log('✅ Added: careInstructions');

    // Add sku
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100)`;
    console.log('✅ Added: sku');

    // Add seoTitle
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS "seoTitle" VARCHAR(60)`;
    console.log('✅ Added: seoTitle');

    // Create index on sku
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku)`;
    console.log('✅ Created index: idx_products_sku');

    console.log('\n🎉 All missing fields added successfully!');

    await sql.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

addMissingFields();
