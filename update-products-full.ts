import { createClient } from '@sanity/client';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import imageUrlBuilder from '@sanity/image-url';
import { toHTML } from '@portabletext/to-html';

dotenv.config({ path: './ileala-website/.env' });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = postgres(DATABASE_URL);

function urlFor(source: any) {
  return builder.image(source).url();
}

async function updateProducts() {
  console.log('🚀 Fetching products from Sanity...\n');

  const products = await sanityClient.fetch(`
    *[_type == "product"] {
      _id,
      name,
      slug,
      shortDescription,
      description,
      price,
      salePrice,
      category,
      collection,
      mainImage,
      images,
      material,
      dimensions,
      colors,
      careInstructions,
      weight,
      sku,
      inStock,
      stockQuantity,
      featured,
      isNew,
      onSale,
      seoTitle,
      seoDescription
    }
  `);

  console.log(`✅ Found ${products.length} products in Sanity\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const product of products) {
    try {
      const slug = product.slug?.current;
      if (!slug) {
        console.log(`⚠️  Skipping product without slug: ${product.name}`);
        continue;
      }

      // Convert description from Portable Text to HTML
      const descriptionHTML = product.description 
        ? toHTML(product.description)
        : null;

      // Convert care instructions from Portable Text to HTML
      const careInstructionsHTML = product.careInstructions
        ? toHTML(product.careInstructions)
        : null;

      // Get main image URL
      const mainImageUrl = product.mainImage
        ? urlFor(product.mainImage)
        : null;

      const mainImageAlt = product.mainImage?.alt || product.name;

      // Get additional images
      const imagesArray = product.images?.map((img: any) => ({
        url: urlFor(img),
        alt: img.alt || product.name
      })) || [];

      const imagesJSON = imagesArray.length > 0 
        ? JSON.stringify(imagesArray)
        : null;

      // Get colors array
      const colorsJSON = product.colors && product.colors.length > 0
        ? JSON.stringify(product.colors)
        : null;

      // Update product in PostgreSQL
      await sql`
        UPDATE products SET
          description = ${descriptionHTML},
          "descriptionEN_full" = ${descriptionHTML},
          "descriptionPT_full" = ${descriptionHTML},
          "salePrice" = ${product.salePrice ? Math.round(product.salePrice * 100) : null},
          "mainImage" = ${mainImageUrl},
          "mainImageAlt" = ${mainImageAlt},
          images = ${imagesJSON},
          material = ${product.material || null},
          dimensions = ${product.dimensions || null},
          colors = ${colorsJSON},
          "careInstructions" = ${careInstructionsHTML},
          "careInstructionsEN" = ${careInstructionsHTML},
          "careInstructionsPT" = ${careInstructionsHTML},
          weight = ${product.weight || null},
          sku = ${product.sku || null},
          "inStock" = ${product.inStock !== undefined ? product.inStock : true},
          "stockQuantity" = ${product.stockQuantity || 0},
          "isNew" = ${product.isNew || false},
          "onSale" = ${product.onSale || false},
          "seoTitle" = ${product.seoTitle || null},
          "seoDescription" = ${product.seoDescription || null},
          "updatedAt" = NOW()
        WHERE slug = ${slug}
      `;

      successCount++;
      console.log(`✅ Updated: ${product.name}`);

    } catch (error: any) {
      errorCount++;
      console.error(`❌ Error updating ${product.name}:`, error.message);
    }
  }

  console.log(`\n📊 Update completed!`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  await sql.end();
}

updateProducts();
