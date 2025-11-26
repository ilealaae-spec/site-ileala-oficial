/**
 * Fetch complete product schema from Sanity
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.join(__dirname, 'ileala-website', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const client = createClient({
  projectId: 'vqt2aiv5',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN
});

async function fetchSanitySchema() {
  console.log('📋 Fetching complete product schema from Sanity...\n');
  
  try {
    // Fetch one product with ALL fields
    const query = `*[_type == "product"][0]{
      ...,
      "imageUrls": images[].asset->url,
      collection->{
        _id,
        title,
        slug
      },
      category->{
        _id,
        title,
        slug
      }
    }`;
    
    const product = await client.fetch(query);
    
    if (!product) {
      console.error('❌ No products found in Sanity!');
      return;
    }
    
    console.log('✅ Product fetched successfully!\n');
    console.log('📊 PRODUCT STRUCTURE:');
    console.log('='.repeat(60));
    
    // Display all fields
    const fields = Object.keys(product);
    console.log(`\nTotal fields: ${fields.length}\n`);
    
    for (const field of fields) {
      const value = product[field];
      const type = Array.isArray(value) ? 'array' : typeof value;
      const preview = Array.isArray(value) 
        ? `[${value.length} items]` 
        : typeof value === 'object' && value !== null
        ? JSON.stringify(value).substring(0, 50) + '...'
        : String(value).substring(0, 50);
      
      console.log(`  ${field}:`);
      console.log(`    Type: ${type}`);
      console.log(`    Value: ${preview}`);
      console.log('');
    }
    
    // Save full product to JSON
    const outputPath = path.join(__dirname, 'sanity-product-schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(product, null, 2));
    
    console.log('='.repeat(60));
    console.log(`✅ Full schema saved to: ${outputPath}`);
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('❌ Error fetching schema:', error.message);
  }
}

fetchSanitySchema();
