import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function categorizeImages() {
  try {
    console.log('🔍 Buscando imagens com folder "general"...\n');
    
    const images = await sql`
      SELECT id, url, filename, folder, "mimeType"
      FROM media 
      WHERE folder = 'general'
      ORDER BY filename
    `;
    
    console.log(`📊 Total de imagens: ${images.length}\n`);
    
    // Categorize by filename patterns
    const categories: Record<string, any[]> = {
      banners: [],
      about: [],
      foundation: [],
      icons: [],
      other: [],
    };
    
    for (const img of images) {
      const filename = img.filename.toLowerCase();
      const url = img.url.toLowerCase();
      
      // Categorization rules
      if (
        filename.includes('banner') || 
        filename.includes('hero') || 
        filename.includes('slide') ||
        url.includes('banner') ||
        url.includes('hero')
      ) {
        categories.banners.push(img);
      } else if (
        filename.includes('about') || 
        filename.includes('team') || 
        filename.includes('story') ||
        url.includes('about')
      ) {
        categories.about.push(img);
      } else if (
        filename.includes('foundation') || 
        filename.includes('charity') || 
        filename.includes('social') ||
        url.includes('foundation')
      ) {
        categories.foundation.push(img);
      } else if (
        filename.includes('icon') || 
        filename.includes('logo') || 
        filename.includes('svg') ||
        img.mimeType === 'image/svg+xml' ||
        url.includes('icon') ||
        url.includes('logo')
      ) {
        categories.icons.push(img);
      } else {
        categories.other.push(img);
      }
    }
    
    // Print categorization results
    console.log('📁 CATEGORIZAÇÃO:\n');
    console.log(`🎨 Banners: ${categories.banners.length}`);
    console.log(`ℹ️  About: ${categories.about.length}`);
    console.log(`💝 Foundation: ${categories.foundation.length}`);
    console.log(`🔷 Icons: ${categories.icons.length}`);
    console.log(`❓ Other: ${categories.other.length}\n`);
    
    // Show sample from each category
    for (const [category, items] of Object.entries(categories)) {
      if (items.length > 0) {
        console.log(`\n📂 ${category.toUpperCase()} (${items.length} items):`);
        items.slice(0, 5).forEach((item: any) => {
          console.log(`  - ${item.filename}`);
        });
        if (items.length > 5) {
          console.log(`  ... and ${items.length - 5} more`);
        }
      }
    }
    
    // Update database
    console.log('\n\n🔄 Atualizando banco de dados...\n');
    
    let updated = 0;
    for (const [category, items] of Object.entries(categories)) {
      if (category === 'other') continue; // Skip "other" category
      
      for (const item of items) {
        await sql`
          UPDATE media 
          SET folder = ${category}
          WHERE id = ${item.id}
        `;
        updated++;
      }
    }
    
    console.log(`✅ ${updated} imagens atualizadas!`);
    
    // Show "other" category for manual review
    if (categories.other.length > 0) {
      console.log(`\n⚠️  ${categories.other.length} imagens não categorizadas (permanecerão em "general"):`);
      categories.other.forEach((item: any) => {
        console.log(`  - ${item.filename}`);
        console.log(`    URL: ${item.url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

categorizeImages();
