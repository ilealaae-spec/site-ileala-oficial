/**
 * Migrate site settings to siteSettings table
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

const settings = [
  // General Settings
  {
    key: 'site_name',
    value: 'ILE ALA',
    description: 'Site name',
    category: 'general'
  },
  {
    key: 'site_tagline',
    value: 'Luxury Home & Table Linens',
    description: 'Site tagline',
    category: 'general'
  },
  {
    key: 'site_url',
    value: 'https://www.ileala.ae',
    description: 'Site URL',
    category: 'general'
  },
  {
    key: 'default_language',
    value: 'en',
    description: 'Default language (en/pt)',
    category: 'general'
  },
  {
    key: 'default_currency',
    value: 'AED',
    description: 'Default currency',
    category: 'general'
  },
  
  // Contact Information
  {
    key: 'contact_email',
    value: 'info@ileala.ae',
    description: 'Contact email',
    category: 'contact'
  },
  {
    key: 'admin_email',
    value: 'ilealaofficial@gmail.com',
    description: 'Admin email',
    category: 'contact'
  },
  {
    key: 'location_city',
    value: 'Dubai',
    description: 'City location',
    category: 'contact'
  },
  {
    key: 'location_country',
    value: 'United Arab Emirates',
    description: 'Country location',
    category: 'contact'
  },
  
  // Social Media
  {
    key: 'social_instagram',
    value: 'https://www.instagram.com/ileala.ae/',
    description: 'Instagram URL',
    category: 'social'
  },
  {
    key: 'social_facebook',
    value: 'https://www.facebook.com/ileala.ae',
    description: 'Facebook URL',
    category: 'social'
  },
  
  // SEO
  {
    key: 'seo_title',
    value: 'ILE ALA - Luxury Home & Table Linens',
    description: 'SEO title',
    category: 'seo'
  },
  {
    key: 'seo_description',
    value: 'Discover exquisite luxury home and table linens handcrafted by skilled artisans. From elegant napkin rings to beautiful cushions, each piece tells a story of craftsmanship and beauty.',
    description: 'SEO meta description',
    category: 'seo'
  },
  {
    key: 'seo_keywords',
    value: 'luxury linens, table linens, napkin rings, home decor, Dubai, handcrafted, artisan, home accents, table essentials',
    description: 'SEO keywords',
    category: 'seo'
  },
  
  // Brand
  {
    key: 'brand_color_primary',
    value: '#006B4F',
    description: 'Primary brand color (green)',
    category: 'brand'
  },
  {
    key: 'brand_color_secondary',
    value: '#D4AF37',
    description: 'Secondary brand color (gold)',
    category: 'brand'
  },
  
  // E-commerce
  {
    key: 'shipping_enabled',
    value: 'true',
    description: 'Enable shipping',
    category: 'ecommerce'
  },
  {
    key: 'tax_enabled',
    value: 'false',
    description: 'Enable tax calculation',
    category: 'ecommerce'
  },
  {
    key: 'minimum_order',
    value: '0',
    description: 'Minimum order amount',
    category: 'ecommerce'
  }
];

async function migrateSettings() {
  console.log('⚙️ Starting settings migration...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const setting of settings) {
    try {
      console.log(`[Migration] Processing: ${setting.key}`);
      
      await client`
        INSERT INTO "siteSettings" (
          key,
          value,
          description,
          category,
          "updatedAt"
        ) VALUES (
          ${setting.key},
          ${setting.value},
          ${setting.description},
          ${setting.category},
          ${new Date().toISOString()}
        )
      `;
      
      successCount++;
      console.log(`[Migration] ✅ Success: ${setting.key}`);
    } catch (error: any) {
      errorCount++;
      console.error(`[Migration] ❌ Failed: ${setting.key}`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total settings: ${settings.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(60));
  
  // Display settings by category
  console.log('\n📋 SETTINGS BY CATEGORY:');
  console.log('='.repeat(60));
  
  const categories = [...new Set(settings.map(s => s.category))];
  for (const category of categories) {
    const categorySettings = settings.filter(s => s.category === category);
    console.log(`\n${category.toUpperCase()} (${categorySettings.length}):`);
    categorySettings.forEach(s => {
      console.log(`  • ${s.key}: ${s.value}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Migration completed!');
  
  await client.end();
}

migrateSettings();
