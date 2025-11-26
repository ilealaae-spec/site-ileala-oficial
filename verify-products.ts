/**
 * Verify Products in PostgreSQL
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

async function verifyProducts() {
  console.log('🔍 Querying products from PostgreSQL...\n');
  
  try {
    const products = await client`
      SELECT 
        id,
        name,
        slug,
        price,
        category,
        collection,
        stock,
        featured,
        active,
        "imageUrl",
        "createdAt"
      FROM products
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    console.log(`✅ Found ${products.length} products (showing first 10):\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Slug: ${product.slug}`);
      console.log(`   - Price: $${(product.price / 100).toFixed(2)}`);
      console.log(`   - Category: ${product.category}`);
      console.log(`   - Collection: ${product.collection}`);
      console.log(`   - Stock: ${product.stock}`);
      console.log(`   - Featured: ${product.featured ? 'Yes' : 'No'}`);
      console.log(`   - Image: ${product.imageUrl ? 'Yes' : 'No'}`);
      console.log(`   - Created: ${new Date(product.createdAt).toLocaleDateString()}`);
      console.log('');
    });
    
    // Get total count
    const countResult = await client`SELECT COUNT(*) as total FROM products`;
    console.log(`📊 Total products in database: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

verifyProducts();
