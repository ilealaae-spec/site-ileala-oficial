/**
 * Migrate media URLs to media table
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

async function migrateMedia() {
  console.log('📸 Starting media migration...\n');
  
  // Load media URLs from JSON
  const mediaPath = path.join(__dirname, 'media-urls.json');
  const mediaItems: MediaItem[] = JSON.parse(fs.readFileSync(mediaPath, 'utf-8'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of mediaItems) {
    try {
      console.log(`[Migration] Processing: ${item.originalName}`);
      
      // Extract filename from URL
      const urlParts = item.url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Determine mimeType from URL
      let mimeType = 'image/jpeg';
      if (filename.endsWith('.webp')) {
        mimeType = 'image/webp';
      } else if (filename.endsWith('.png')) {
        mimeType = 'image/png';
      }
      
      // Estimate size (we don't have actual size, use 0 as placeholder)
      const size = 0;
      
      await client`
        INSERT INTO media (
          filename,
          "originalName",
          url,
          "mimeType",
          size,
          alt,
          caption,
          folder,
          "createdAt"
        ) VALUES (
          ${filename},
          ${item.originalName},
          ${item.url},
          ${mimeType},
          ${size},
          ${item.alt || null},
          ${item.source},
          ${item.folder},
          ${new Date().toISOString()}
        )
      `;
      
      successCount++;
      console.log(`[Migration] ✅ Success: ${item.originalName}`);
    } catch (error: any) {
      errorCount++;
      console.error(`[Migration] ❌ Failed: ${item.originalName}`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total media items: ${mediaItems.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(60));
  console.log('✅ Migration completed!');
  
  await client.end();
}

migrateMedia();
