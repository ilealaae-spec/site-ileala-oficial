/**
 * Check Products Missing Images
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.join(__dirname, 'ileala-website', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const client = postgres(DATABASE_URL, { ssl: 'require' });

async function checkMissingImages() {
  console.log('🔍 Checking products with missing images...\n');
  
  try {
    // Products without images
    const productsWithoutImages = await client`
      SELECT 
        id,
        name,
        slug,
        price,
        category,
        collection,
        "imageUrl"
      FROM products
      WHERE "imageUrl" IS NULL OR "imageUrl" = ''
      ORDER BY name
    `;
    
    console.log(`❌ Products WITHOUT images: ${productsWithoutImages.length}\n`);
    
    if (productsWithoutImages.length > 0) {
      productsWithoutImages.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   - Slug: ${product.slug}`);
        console.log(`   - Category: ${product.category}`);
        console.log(`   - Collection: ${product.collection}`);
        console.log(`   - Image URL: ${product.imageUrl || 'NULL'}`);
        console.log('');
      });
    }
    
    // Products with images
    const productsWithImages = await client`
      SELECT 
        id,
        name,
        "imageUrl"
      FROM products
      WHERE "imageUrl" IS NOT NULL AND "imageUrl" != ''
      ORDER BY name
    `;
    
    console.log(`✅ Products WITH images: ${productsWithImages.length}\n`);
    
    // Total
    const countResult = await client`SELECT COUNT(*) as total FROM products`;
    console.log(`📊 Total products: ${countResult[0].total}`);
    console.log(`   - With images: ${productsWithImages.length}`);
    console.log(`   - Without images: ${productsWithoutImages.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkMissingImages();
