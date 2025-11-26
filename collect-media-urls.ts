/**
 * Collect all media URLs from products and artisans
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

interface MediaItem {
  url: string;
  originalName: string;
  folder: string;
  alt?: string;
  source: string;
}

async function collectMediaUrls() {
  console.log('📸 Collecting media URLs...\n');
  
  const mediaItems: MediaItem[] = [];
  
  // Get product images
  console.log('[Collection] Fetching product images...');
  const products = await client`
    SELECT id, name, "imageUrl"
    FROM products
    WHERE "imageUrl" IS NOT NULL AND "imageUrl" != ''
  `;
  
  for (const product of products) {
    if (product.imageUrl) {
      mediaItems.push({
        url: product.imageUrl,
        originalName: `${product.name.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
        folder: 'products',
        alt: product.name,
        source: `product_${product.id}`
      });
    }
  }
  
  console.log(`[Collection] ✅ Found ${products.length} product images`);
  
  // Get artisan photos
  console.log('[Collection] Fetching artisan photos...');
  const artisans = await client`
    SELECT id, name, "photoUrl"
    FROM artisans
    WHERE "photoUrl" IS NOT NULL AND "photoUrl" != ''
  `;
  
  for (const artisan of artisans) {
    if (artisan.photoUrl) {
      mediaItems.push({
        url: artisan.photoUrl,
        originalName: `${artisan.name.replace(/[^a-zA-Z0-9]/g, '_')}.webp`,
        folder: 'artisans',
        alt: artisan.name,
        source: `artisan_${artisan.id}`
      });
    }
  }
  
  console.log(`[Collection] ✅ Found ${artisans.length} artisan photos`);
  
  // Save to JSON file
  const outputPath = path.join(__dirname, 'media-urls.json');
  fs.writeFileSync(outputPath, JSON.stringify(mediaItems, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 COLLECTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total media items: ${mediaItems.length}`);
  console.log(`Product images: ${products.length}`);
  console.log(`Artisan photos: ${artisans.length}`);
  console.log(`Output file: ${outputPath}`);
  console.log('='.repeat(60));
  console.log('✅ Collection completed!');
  
  await client.end();
  
  return mediaItems;
}

collectMediaUrls();
