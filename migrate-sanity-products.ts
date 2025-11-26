/**
 * Sanity to PostgreSQL Product Migration Script
 * 
 * This script migrates products from Sanity CMS to the new PostgreSQL database.
 * 
 * Usage:
 *   cd ileala-website && npx tsx ../migrate-sanity-products.ts
 */

import { createClient } from '@sanity/client';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from ileala-website/.env if it exists
const envPath = path.join(__dirname, 'ileala-website', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('[Config] ✅ Loaded .env from ileala-website/');
}

// Sanity configuration
const SANITY_PROJECT_ID = 'anyz9zel';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = 'sk6iqqVnbdN3tUjAOzZzJ7GtCQfAarRVB8igHgsHg0x8MDAfBKtm4weUmpJ4NjdtYXi1Fj6EU6MqRvWLOZAxN1hD3naDDtOEGAQTFLqgY7W1HlZ1qVT3BmtWWSootPwYrbyHSwflvIJ4trqjdig6ObqpbCHkL9gH6otMbqRh57Gc2No8kML0';

// PostgreSQL configuration (from environment)
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required!');
  console.error('   Please set it in ileala-website/.env or export it');
  process.exit(1);
}

console.log('[Config] ✅ DATABASE_URL found');

// Initialize Sanity client
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Initialize PostgreSQL client
const client = postgres(DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

interface SanityProduct {
  _id: string;
  _type: string;
  _createdAt: string;
  _updatedAt: string;
  name?: string;
  slug?: { current: string };
  description?: any; // Portable Text
  price?: number;
  images?: any[];
  category?: string;
  collection?: string;
  stock?: number;
  featured?: boolean;
  [key: string]: any;
}

async function fetchSanityProducts(): Promise<SanityProduct[]> {
  console.log('[Sanity] Fetching products from Sanity...');
  
  const query = `*[_type == "product"] {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    name,
    slug,
    description,
    price,
    images,
    category,
    collection,
    stock,
    featured,
    ...
  }`;
  
  const products = await sanityClient.fetch<SanityProduct[]>(query);
  console.log(`[Sanity] ✅ Fetched ${products.length} products`);
  
  return products;
}

function convertPortableTextToHTML(portableText: any): string {
  if (!portableText) return '';
  
  // Simple conversion - for complex cases, use @portabletext/to-html
  if (Array.isArray(portableText)) {
    return portableText
      .map(block => {
        if (block._type === 'block' && block.children) {
          const text = block.children
            .map((child: any) => child.text || '')
            .join('');
          return `<p>${text}</p>`;
        }
        return '';
      })
      .join('\n');
  }
  
  return String(portableText);
}

function getSanityImageUrl(imageRef: any): string | null {
  if (!imageRef || !imageRef.asset) return null;
  
  const ref = imageRef.asset._ref || imageRef.asset.ref;
  if (!ref) return null;
  
  // Extract image ID from reference (format: image-{id}-{width}x{height}-{format})
  const parts = ref.split('-');
  if (parts.length < 4) return null;
  
  const id = parts[1];
  const dimensions = parts[2];
  const format = parts[3];
  
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}`;
}

async function migrateProducts(products: SanityProduct[]) {
  console.log('[Migration] Starting product migration...');
  
  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ product: string; error: string }> = [];
  
  for (const product of products) {
    try {
      console.log(`[Migration] Processing: ${product.name || product._id}`);
      
      // Extract data
      const name = product.name || 'Untitled Product';
      const slug = product.slug?.current || product._id;
      const description = convertPortableTextToHTML(product.description);
      const price = Math.round((product.price || 0) * 100); // Convert to cents
      const stock = product.stock || 0;
      const category = product.category || 'uncategorized';
      const collection = product.collection || 'general';
      const featured = product.featured ? 1 : 0;
      
      // Extract images
      const images: string[] = [];
      if (product.images && Array.isArray(product.images)) {
        for (const img of product.images) {
          const url = getSanityImageUrl(img);
          if (url) images.push(url);
        }
      }
      
      // Get first image URL (schema only supports one imageUrl)
      const imageUrl = images.length > 0 ? images[0] : null;
      
      // Insert into PostgreSQL using raw SQL with correct schema
      await client`
        INSERT INTO products (
          name,
          "nameEN",
          "namePT",
          slug,
          "descriptionEN",
          "descriptionPT",
          price,
          stock,
          category,
          collection,
          featured,
          "imageUrl",
          active,
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${name},
          ${name},
          ${name},
          ${slug},
          ${description},
          ${description},
          ${price},
          ${stock},
          ${category},
          ${collection},
          ${featured},
          ${imageUrl},
          1,
          ${new Date(product._createdAt).toISOString()},
          ${new Date(product._updatedAt).toISOString()}
        )
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          "nameEN" = EXCLUDED."nameEN",
          "namePT" = EXCLUDED."namePT",
          "descriptionEN" = EXCLUDED."descriptionEN",
          "descriptionPT" = EXCLUDED."descriptionPT",
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          category = EXCLUDED.category,
          collection = EXCLUDED.collection,
          featured = EXCLUDED.featured,
          "imageUrl" = EXCLUDED."imageUrl",
          "updatedAt" = EXCLUDED."updatedAt"
      `;
      
      successCount++;
      console.log(`[Migration] ✅ Success: ${name}`);
    } catch (error: any) {
      errorCount++;
      const errorMsg = error.message || String(error);
      console.error(`[Migration] ❌ Failed: ${product.name || product._id}`, errorMsg);
      errors.push({
        product: product.name || product._id,
        error: errorMsg,
      });
    }
  }
  
  return { successCount, errorCount, errors };
}

async function main() {
  console.log('🚀 Starting Sanity to PostgreSQL migration...\n');
  
  try {
    // Fetch products from Sanity
    const products = await fetchSanityProducts();
    
    if (products.length === 0) {
      console.log('⚠️  No products found in Sanity!');
      return;
    }
    
    // Migrate products
    const result = await migrateProducts(products);
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total products: ${products.length}`);
    console.log(`✅ Successful: ${result.successCount}`);
    console.log(`❌ Failed: ${result.errorCount}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach(({ product, error }) => {
        console.log(`  - ${product}: ${error}`);
      });
    }
    
    console.log('='.repeat(60));
    console.log('✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
