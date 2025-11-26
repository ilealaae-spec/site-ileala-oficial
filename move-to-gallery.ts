import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function moveToGallery() {
  try {
    console.log('🔄 Movendo imagens de "general" para "gallery"...\n');
    
    // Update all images with folder = 'general' to folder = 'gallery'
    const result = await sql`
      UPDATE media 
      SET folder = 'gallery'
      WHERE folder = 'general'
    `;
    
    console.log(`✅ ${result.length} imagens movidas para "gallery"!`);
    
    // Verify the update
    const galleryImages = await sql`
      SELECT COUNT(*) as count
      FROM media 
      WHERE folder = 'gallery'
    `;
    
    const generalImages = await sql`
      SELECT COUNT(*) as count
      FROM media 
      WHERE folder = 'general'
    `;
    
    console.log(`\n📊 Resultado:`);
    console.log(`  - Gallery: ${galleryImages[0].count} imagens`);
    console.log(`  - General: ${generalImages[0].count} imagens`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

moveToGallery();
