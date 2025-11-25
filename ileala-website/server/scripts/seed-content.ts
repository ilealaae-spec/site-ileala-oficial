import { db } from '../db';
import { translations } from '../../client/src/lib/i18n';

// Flatten nested object to dot notation
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      flattened[newKey] = value;
    } else if (Array.isArray(value)) {
      // Skip arrays (testimonials)
      continue;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, newKey));
    }
  }
  
  return flattened;
}

async function seedContent() {
  console.log('🌱 Seeding CMS content...');
  
  const enFlat = flattenObject(translations.en);
  const ptFlat = flattenObject(translations.pt);
  
  let count = 0;
  
  for (const key of Object.keys(enFlat)) {
    const contentEn = enFlat[key];
    const contentPt = ptFlat[key] || contentEn;
    const category = key.split('.')[0];
    
    try {
      await db.cms.content.upsert({
        key,
        type: 'text',
        contentEn,
        contentPt,
        category,
      });
      count++;
      console.log(`✅ ${key}`);
    } catch (error) {
      console.error(`❌ Failed to insert ${key}:`, error);
    }
  }
  
  console.log(`\n🎉 Seeded ${count} content entries!`);
}

seedContent()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
