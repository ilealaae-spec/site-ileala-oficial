/**
 * Check Cushion Products in Sanity
 */

import { createClient } from '@sanity/client';

const SANITY_PROJECT_ID = 'anyz9zel';
const SANITY_DATASET = 'production';
const SANITY_TOKEN = 'sk6iqqVnbdN3tUjAOzZzJ7GtCQfAarRVB8igHgsHg0x8MDAfBKtm4weUmpJ4NjdtYXi1Fj6EU6MqRvWLOZAxN1hD3naDDtOEGAQTFLqgY7W1HlZ1qVT3BmtWWSootPwYrbyHSwflvIJ4trqjdig6ObqpbCHkL9gH6otMbqRh57Gc2No8kML0';

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

async function checkCushions() {
  console.log('🔍 Checking Cushion products in Sanity...\n');
  
  const cushionNames = [
    'Abstract Explosion Cushion',
    'Cubist Dream cushion',
    'Sea of ​​Colors Cushion'
  ];
  
  for (const name of cushionNames) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Searching for: ${name}`);
    console.log('='.repeat(60));
    
    try {
      // Try exact match first
      let query = `*[_type == "product" && name == "${name}"] {
        _id,
        name,
        slug,
        images,
        "imageCount": count(images),
        "firstImage": images[0]
      }`;
      
      let products = await sanityClient.fetch(query);
      
      // If not found, try partial match
      if (products.length === 0) {
        console.log('   Not found with exact match, trying partial...');
        query = `*[_type == "product" && name match "*${name.split(' ')[0]}*"] {
          _id,
          name,
          slug,
          images,
          "imageCount": count(images),
          "firstImage": images[0]
        }`;
        products = await sanityClient.fetch(query);
      }
      
      if (products.length === 0) {
        console.log('   ❌ NOT FOUND in Sanity!');
      } else {
        products.forEach((product: any) => {
          console.log(`\n   ✅ FOUND: ${product.name}`);
          console.log(`   - ID: ${product._id}`);
          console.log(`   - Slug: ${product.slug?.current || 'N/A'}`);
          console.log(`   - Image Count: ${product.imageCount || 0}`);
          
          if (product.firstImage) {
            console.log(`   - First Image:`);
            console.log(`     ${JSON.stringify(product.firstImage, null, 2)}`);
          } else {
            console.log(`   - ❌ NO IMAGES in Sanity!`);
          }
          
          if (product.images && product.images.length > 0) {
            console.log(`\n   📸 All Images (${product.images.length}):`);
            product.images.forEach((img: any, idx: number) => {
              console.log(`     ${idx + 1}. ${JSON.stringify(img, null, 2)}`);
            });
          }
        });
      }
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Search completed!');
  console.log('='.repeat(60));
}

checkCushions();
