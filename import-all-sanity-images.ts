import { createClient } from '@sanity/client';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: './ileala-website/.env' });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
});

async function importAllImages() {
  console.log('🔍 Buscando todas as imagens do Sanity...\n');

  const query = `*[_type == "sanity.imageAsset"] {
    _id,
    url,
    originalFilename,
    size,
    mimeType,
    metadata {
      dimensions {
        width,
        height
      }
    }
  }`;

  const images = await sanityClient.fetch(query);
  console.log(`✅ ${images.length} imagens encontradas no Sanity\n`);

  // Verificar quais já existem no banco
  const existingUrls = await sql`
    SELECT url FROM media
  `;
  const existingUrlSet = new Set(existingUrls.map((row: any) => row.url));

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  console.log('📦 Importando para o banco de dados...\n');

  for (const img of images) {
    try {
      // Pular se já existe
      if (existingUrlSet.has(img.url)) {
        skipped++;
        continue;
      }

      const filename = img.originalFilename || `image-${img._id}.jpg`;
      const alt = `${filename.replace(/\.[^/.]+$/, '')}`;

      await sql`
        INSERT INTO media (
          filename,
          "originalName",
          url,
          "mimeType",
          size,
          alt,
          folder,
          "createdAt"
        ) VALUES (
          ${filename},
          ${img.originalFilename || filename},
          ${img.url},
          ${img.mimeType || 'image/jpeg'},
          ${img.size || 0},
          ${alt},
          'general',
          NOW()
        )
      `;

      imported++;
      
      if (imported % 10 === 0) {
        console.log(`  ✅ ${imported} imagens importadas...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Erro ao importar ${img.originalFilename}: ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 RESULTADO FINAL:');
  console.log(`  ✅ Importadas: ${imported}`);
  console.log(`  ⏭️  Puladas (já existiam): ${skipped}`);
  console.log(`  ❌ Falhas: ${failed}`);
  console.log(`  📦 Total no banco: ${imported + skipped}`);

  await sql.end();
}

importAllImages()
  .then(() => {
    console.log('\n🎉 Importação completa!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error.message);
    process.exit(1);
  });
