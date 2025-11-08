import { drizzle } from 'drizzle-orm/mysql2';
import { products } from './drizzle/schema.js';

const db = drizzle(process.env.DATABASE_URL);

const sampleProducts = [
  {
    name: 'Botanical Placemat',
    nameEN: 'Botanical Placemat',
    namePT: 'Jogo Americano Botanical',
    descriptionEN: 'Elegant placemat from our Botanical collection, featuring nature-inspired designs.',
    descriptionPT: 'Elegante jogo americano da nossa coleção Botanical, com designs inspirados na natureza.',
    price: 15000, // 150 AED in fils
    imageUrl: '/images/about_me_card.webp',
    collection: 'Botanica',
    category: 'Placemats',
    stock: 50,
    featured: 1,
    active: 1,
  },
  {
    name: 'La Mer Table Runner',
    nameEN: 'La Mer Table Runner',
    namePT: 'Caminho de Mesa La Mer',
    descriptionEN: 'Beautiful table runner inspired by the serenity of the sea.',
    descriptionPT: 'Lindo caminho de mesa inspirado na serenidade do mar.',
    price: 25000, // 250 AED
    imageUrl: '/images/collection_la_mer.webp',
    collection: 'La Mer',
    category: 'Table Runners',
    stock: 30,
    featured: 1,
    active: 1,
  },
  {
    name: 'Soul Stamps Napkin Set',
    nameEN: 'Soul Stamps Napkin Set (4 pieces)',
    namePT: 'Conjunto de Guardanapos Soul Stamps (4 peças)',
    descriptionEN: 'Set of 4 napkins with unique soul-inspired embroidery.',
    descriptionPT: 'Conjunto de 4 guardanapos com bordado único inspirado na alma.',
    price: 12000, // 120 AED
    imageUrl: '/images/collection_soul_stamps.webp',
    collection: 'Soul Stamps',
    category: 'Napkins',
    stock: 100,
    featured: 1,
    active: 1,
  },
  {
    name: 'Khata Ceremonial Cloth',
    nameEN: 'Khata Ceremonial Cloth',
    namePT: 'Pano Cerimonial Khata',
    descriptionEN: 'Traditional ceremonial cloth with sacred symbolism.',
    descriptionPT: 'Pano cerimonial tradicional com simbolismo sagrado.',
    price: 18000, // 180 AED
    imageUrl: '/images/collection_khata.webp',
    collection: 'Khata',
    category: 'Ceremonial',
    stock: 20,
    featured: 1,
    active: 1,
  },
  {
    name: 'Anima Cushion Cover',
    nameEN: 'Anima Cushion Cover',
    namePT: 'Capa de Almofada Anima',
    descriptionEN: 'Luxurious cushion cover where spirit takes form.',
    descriptionPT: 'Capa de almofada luxuosa onde o espírito toma forma.',
    price: 9500, // 95 AED
    imageUrl: '/images/our_collections_card.webp',
    collection: 'Anima',
    category: 'Cushions',
    stock: 75,
    featured: 0,
    active: 1,
  },
  {
    name: 'Lacea Lace Doily',
    nameEN: 'Lacea Lace Doily',
    namePT: 'Toalha de Renda Lacea',
    descriptionEN: 'Delicate lace doily showcasing the art of weaving grace.',
    descriptionPT: 'Delicada toalha de renda mostrando a arte de tecer graça.',
    price: 6500, // 65 AED
    imageUrl: '/images/our_values_card.webp',
    collection: 'Lacea',
    category: 'Doilies',
    stock: 60,
    featured: 0,
    active: 1,
  },
  {
    name: 'Terracotta Bowl',
    nameEN: 'Terracotta Serving Bowl',
    namePT: 'Tigela de Servir Terracotta',
    descriptionEN: 'Handcrafted terracotta bowl where earth meets creation.',
    descriptionPT: 'Tigela de terracotta artesanal onde a terra encontra a criação.',
    price: 22000, // 220 AED
    imageUrl: '/images/about_me_card.webp',
    collection: 'Terracotta',
    category: 'Tableware',
    stock: 25,
    featured: 1,
    active: 1,
  },
  {
    name: 'Nocturne Dinner Plate',
    nameEN: 'Nocturne Dinner Plate',
    namePT: 'Prato de Jantar Nocturne',
    descriptionEN: 'Elegant dinner plate embodying the sophistication of night.',
    descriptionPT: 'Prato de jantar elegante incorporando a sofisticação da noite.',
    price: 14500, // 145 AED
    imageUrl: '/images/collection_botanical.webp',
    collection: 'Nocturne',
    category: 'Tableware',
    stock: 40,
    featured: 1,
    active: 1,
  },
  {
    name: 'Aurora Tablecloth',
    nameEN: 'Aurora Tablecloth',
    namePT: 'Toalha de Mesa Aurora',
    descriptionEN: 'Beautiful tablecloth celebrating cycles and renewal.',
    descriptionPT: 'Linda toalha de mesa celebrando ciclos e renovação.',
    price: 35000, // 350 AED
    imageUrl: '/images/our_collections_card.webp',
    collection: 'Aurora',
    category: 'Tablecloths',
    stock: 15,
    featured: 1,
    active: 1,
  },
  {
    name: 'Botanical Napkin Rings (Set of 6)',
    nameEN: 'Botanical Napkin Rings (Set of 6)',
    namePT: 'Anéis para Guardanapos Botanical (Conjunto de 6)',
    descriptionEN: 'Set of 6 napkin rings with nature-inspired details.',
    descriptionPT: 'Conjunto de 6 anéis para guardanapos com detalhes inspirados na natureza.',
    price: 8000, // 80 AED
    imageUrl: '/images/collection_botanical.webp',
    collection: 'Botanica',
    category: 'Napkin Rings',
    stock: 80,
    featured: 0,
    active: 1,
  },
];

async function seedProducts() {
  try {
    console.log('Starting to seed products...');
    
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
      console.log(`✓ Added: ${product.nameEN}`);
    }
    
    console.log('\n✅ Successfully seeded all products!');
    console.log(`Total products added: ${sampleProducts.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
