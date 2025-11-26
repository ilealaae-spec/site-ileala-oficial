import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import * as dotenv from 'dotenv';

dotenv.config({ path: './ileala-website/.env' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
  apiVersion: '2024-01-01',
});

const builder = imageUrlBuilder(client);

function urlFor(source: any) {
  return builder.image(source);
}

async function fetchAllImages() {
  console.log('🔍 Buscando TODAS as imagens do Sanity...\n');

  // Buscar todos os documentos que têm imagens
  const query = `*[_type == "sanity.imageAsset"] {
    _id,
    _type,
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

  const images = await client.fetch(query);

  console.log(`✅ Total de imagens encontradas: ${images.length}\n`);

  // Categorizar imagens
  const categorized: any = {
    banners: [],
    about: [],
    foundation: [],
    icons: [],
    other: []
  };

  images.forEach((img: any) => {
    const filename = img.originalFilename?.toLowerCase() || '';
    
    if (filename.includes('banner') || filename.includes('hero')) {
      categorized.banners.push(img);
    } else if (filename.includes('about') || filename.includes('team') || filename.includes('founder')) {
      categorized.about.push(img);
    } else if (filename.includes('foundation') || filename.includes('charity')) {
      categorized.foundation.push(img);
    } else if (filename.includes('icon') || filename.includes('logo')) {
      categorized.icons.push(img);
    } else {
      categorized.other.push(img);
    }
  });

  console.log('📊 Categorização:');
  console.log(`  🎨 Banners: ${categorized.banners.length}`);
  console.log(`  👤 About: ${categorized.about.length}`);
  console.log(`  🏛️ Foundation: ${categorized.foundation.length}`);
  console.log(`  🔷 Icons: ${categorized.icons.length}`);
  console.log(`  📦 Other: ${categorized.other.length}\n`);

  // Mostrar todas as imagens
  console.log('📸 TODAS AS IMAGENS:\n');
  
  Object.keys(categorized).forEach(category => {
    if (categorized[category].length > 0) {
      console.log(`\n=== ${category.toUpperCase()} (${categorized[category].length}) ===`);
      categorized[category].forEach((img: any, index: number) => {
        console.log(`${index + 1}. ${img.originalFilename || 'Sem nome'}`);
        console.log(`   URL: ${img.url}`);
        console.log(`   Size: ${(img.size / 1024).toFixed(2)} KB`);
        console.log(`   Dimensions: ${img.metadata?.dimensions?.width}x${img.metadata?.dimensions?.height}`);
        console.log('');
      });
    }
  });

  return { images, categorized };
}

fetchAllImages()
  .then(({ images, categorized }) => {
    console.log(`\n✅ Busca completa! ${images.length} imagens encontradas.`);
  })
  .catch(error => {
    console.error('❌ Erro:', error.message);
  });
