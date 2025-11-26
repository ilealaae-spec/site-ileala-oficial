/**
 * Migrate Artisans to PostgreSQL
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

const artisans = [
  {
    name: 'Mr. Zeeshan',
    bioEN: 'From Pakistan, I built my career over more than twenty years, working in prestigious establishments in my country. About a year and a half ago, I arrived in Dubai — a new chapter, full of challenges and achievements. Today I am part of the ILE ALA atelier, where I can apply my experience and continue evolving every day. I take pride in the work I do and the quality we deliver. I hope to keep growing and contributing with the same commitment and dedication.',
    bioPT: 'Do Paquistão, construí minha carreira ao longo de mais de vinte anos, trabalhando em estabelecimentos de prestígio em meu país. Há cerca de um ano e meio, cheguei a Dubai — um novo capítulo, cheio de desafios e conquistas. Hoje faço parte do ateliê ILE ALA, onde posso aplicar minha experiência e continuar evoluindo todos os dias. Tenho orgulho do trabalho que faço e da qualidade que entregamos. Espero continuar crescendo e contribuindo com o mesmo compromisso e dedicação.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/YjKjjRZQDLeGVfob.webp',
    specialty: 'Master Tailor',
    location: 'Pakistan',
    featured: 1
  },
  {
    name: 'Mr. Sarajuddin',
    bioEN: 'From India to Dubai, I brought with me two decades of an art cultivated with patience and devotion. I came especially to be part of the ILE ALA atelier — an opportunity I honor with every stitch, every seam. My family remains in India, but my heart is divided between two worlds: the home I left behind and the dream I build here. Perfection is not just a goal — it is the path I have chosen to walk. Each piece that passes through my hands carries not only technique, but the essence of who I am and where I come from.',
    bioPT: 'Da Índia para Dubai, trouxe comigo duas décadas de uma arte cultivada com paciência e devoção. Vim especialmente para fazer parte do ateliê ILE ALA — uma oportunidade que honro a cada ponto, a cada costura. Minha família permanece na Índia, mas meu coração está dividido entre dois mundos: o lar que deixei para trás e o sonho que construo aqui. A perfeição não é apenas um objetivo — é o caminho que escolhi percorrer. Cada peça que passa pelas minhas mãos carrega não apenas técnica, mas a essência de quem eu sou e de onde venho.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/XWUCoCDSxSVlZxHP.webp',
    specialty: 'Master Tailor',
    location: 'India',
    featured: 1
  },
  {
    name: 'Ge',
    bioEN: 'I am the bridge between creation and delivery, between dream and reality. I guide, organize, and care for every detail so that each piece leaves the atelier not just perfect, but fragrant, wrapped in care, and ready to touch the heart of those who receive it. Without finishing, art remains incomplete — and this is where my work finds meaning. I am the guardian of excellence, the last hand to touch each creation before it finds its destiny. ILE ALA cannot function without sewing, but it also cannot function without those who ensure everything is impeccable. This is my mission, and I fulfill it with pride every day.',
    bioPT: 'Sou a ponte entre criação e entrega, entre sonho e realidade. Guio, organizo e cuido de cada detalhe para que cada peça saia do ateliê não apenas perfeita, mas perfumada, envolta em cuidado e pronta para tocar o coração de quem a recebe. Sem acabamento, a arte permanece incompleta — e é aqui que meu trabalho encontra significado. Sou a guardiã da excelência, a última mão a tocar cada criação antes que ela encontre seu destino. ILE ALA não pode funcionar sem costura, mas também não pode funcionar sem aqueles que garantem que tudo esteja impecável. Esta é minha missão, e a cumpro com orgulho todos os dias.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/fcQOCbgfMFCOXrBS.webp',
    specialty: 'Production & Finishing Manager',
    location: 'Madagascar',
    featured: 1
  },
  {
    name: 'Lola',
    bioEN: 'Lola is the soul behind ILE ALA\'s exquisite napkin rings. With hands that move like poetry and eyes that see perfection in every detail, she transforms simple beads and threads into small masterpieces. Her embroidery is not just craft—it is art born from devotion. Each napkin ring she creates carries the warmth of her smile, the rhythm of her island, and the promise that beauty can be both delicate and eternal. In Madagascar, where tradition meets the ocean breeze, Lola stitches dreams into reality.',
    bioPT: 'Lola é a alma por trás dos requintados anéis de guardanapo da ILE ALA. Com mãos que se movem como poesia e olhos que veem perfeição em cada detalhe, ela transforma simples miçangas e fios em pequenas obras-primas. Seu bordado não é apenas artesanato — é arte nascida da devoção. Cada anel de guardanapo que ela cria carrega o calor de seu sorriso, o ritmo de sua ilha e a promessa de que a beleza pode ser delicada e eterna. Em Madagascar, onde a tradição encontra a brisa do oceano, Lola costura sonhos na realidade.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/mUiTHCoJiZUXHCFv.webp',
    specialty: 'Master of Embroidery',
    location: 'Madagascar',
    featured: 1
  },
  {
    name: 'Emily',
    bioEN: 'Emily is the invisible hand that keeps the heart of ILE ALA beating in perfect rhythm. She is the guardian of cleanliness, the keeper of order, and the quiet force that transforms every corner into a sanctuary of beauty. Every morning, before the first stitch is sewn, before the first thread is chosen, Emily ensures that the atelier and showroom shine with impeccable care. Her work is not seen in the final product, but it is felt in every breath of fresh air, every spotless surface, every organized space. She creates the peace that allows artisans to focus on their craft, the harmony that reflects the brand\'s excellence, and the serenity that makes perfection possible. From Madagascar to Dubai, Emily brings the warmth of her island and the devotion of her heart, ensuring that every day begins with the promise of perfection.',
    bioPT: 'Emily é a mão invisível que mantém o coração da ILE ALA batendo em ritmo perfeito. Ela é a guardiã da limpeza, a zeladora da ordem e a força silenciosa que transforma cada canto em um santuário de beleza. Todas as manhãs, antes que o primeiro ponto seja costurado, antes que o primeiro fio seja escolhido, Emily garante que o ateliê e o showroom brilhem com cuidado impecável. Seu trabalho não é visto no produto final, mas é sentido em cada sopro de ar fresco, cada superfície impecável, cada espaço organizado. Ela cria a paz que permite aos artesãos focar em seu ofício, a harmonia que reflete a excelência da marca e a serenidade que torna a perfeição possível. De Madagascar a Dubai, Emily traz o calor de sua ilha e a devoção de seu coração, garantindo que cada dia comece com a promessa de perfeição.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/MjsvsHiuNPaaFKOQ.webp',
    specialty: 'Atelier & Showroom Caretaker',
    location: 'Madagascar',
    featured: 1
  },
  {
    name: 'Ajay',
    bioEN: 'Ajay is the bridge between ILE ALA and the soul of India. Based in Jaipur, he is our trusted guide, our friend, and the eyes through which we discover the treasures of Indian craftsmanship. Extremely helpful, reliable, and deeply connected to his culture, Ajay leads us to the most authentic corners of India — where fabrics are born from ancient techniques, where block prints tell stories, where ikats dance with color, and where embroidery is a language passed down through generations. He discovers everything ILE ALA needs: raw materials, artisans, dyeing workshops, textile factories. With Ajay, we don\'t just source materials; we immerse ourselves in culture, learn stories, and build relationships rooted in trust. Ajay is the confidence we carry in India.',
    bioPT: 'Ajay é a ponte entre ILE ALA e a alma da Índia. Baseado em Jaipur, ele é nosso guia de confiança, nosso amigo e os olhos através dos quais descobrimos os tesouros do artesanato indiano. Extremamente prestativo, confiável e profundamente conectado à sua cultura, Ajay nos leva aos cantos mais autênticos da Índia — onde os tecidos nascem de técnicas antigas, onde as estampas em bloco contam histórias, onde os ikats dançam com cores e onde o bordado é uma linguagem passada através de gerações. Ele descobre tudo o que ILE ALA precisa: matérias-primas, artesãos, oficinas de tingimento, fábricas têxteis. Com Ajay, não apenas obtemos materiais; mergulhamos na cultura, aprendemos histórias e construímos relacionamentos enraizados na confiança. Ajay é a confiança que carregamos na Índia.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/ULeqkLqOaVcoKMrw.webp',
    specialty: 'India Representative & Cultural Ambassador',
    location: 'Jaipur, India',
    featured: 1
  },
  {
    name: 'Moët Chandon',
    bioEN: 'Moët Chandon is the heart of ILE ALA — a four-pawed Director of Calm who supervises fabrics, approves softness, and ensures serenity remains woven into every stitch. Between naps and watchful glances, she teaches us that inspiration is born from silence and beauty flourishes in peace. At ILE ALA, she is not just our muse — she is the Director of Calm, the golden guardian who reminds us that even silence can shine. Her presence transforms the atelier into a sanctuary where creativity flows effortlessly, where every thread is touched by grace, and where the art of living beautifully begins with a gentle pause. Named after the champagne that celebrates life\'s finest moments, Moët Chandon embodies the elegance, joy, and timeless sophistication that define ILE ALA. She is the soul that keeps our hearts light and our hands steady — proof that luxury is not only what we create, but how we feel while creating it.',
    bioPT: 'Moët Chandon é o coração da ILE ALA — uma Diretora de Calma de quatro patas que supervisiona tecidos, aprova maciez e garante que a serenidade permaneça tecida em cada ponto. Entre cochilos e olhares atentos, ela nos ensina que a inspiração nasce do silêncio e a beleza floresce na paz. Na ILE ALA, ela não é apenas nossa musa — ela é a Diretora de Calma, a guardiã dourada que nos lembra que até o silêncio pode brilhar. Sua presença transforma o ateliê em um santuário onde a criatividade flui sem esforço, onde cada fio é tocado pela graça e onde a arte de viver belamente começa com uma pausa gentil. Nomeada em homenagem ao champanhe que celebra os melhores momentos da vida, Moët Chandon incorpora a elegância, alegria e sofisticação atemporal que definem ILE ALA. Ela é a alma que mantém nossos corações leves e nossas mãos firmes — prova de que o luxo não é apenas o que criamos, mas como nos sentimos ao criar.',
    photoUrl: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663035525399/YNhwLDBWhFvcNZTb.webp',
    specialty: 'Director of Creative Calm & Harmony',
    location: 'United Arab Emirates',
    featured: 1
  }
];

async function migrateArtisans() {
  console.log('🎨 Starting artisans migration...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const artisan of artisans) {
    try {
      console.log(`[Migration] Processing: ${artisan.name}`);
      
      await client`
        INSERT INTO artisans (
          name,
          bio,
          "bioEN",
          "bioPT",
          "photoUrl",
          specialty,
          location,
          featured,
          active,
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${artisan.name},
          ${artisan.bioEN},
          ${artisan.bioEN},
          ${artisan.bioPT},
          ${artisan.photoUrl},
          ${artisan.specialty},
          ${artisan.location},
          ${artisan.featured},
          1,
          ${new Date().toISOString()},
          ${new Date().toISOString()}
        )
      `;
      
      successCount++;
      console.log(`[Migration] ✅ Success: ${artisan.name}`);
    } catch (error: any) {
      errorCount++;
      console.error(`[Migration] ❌ Failed: ${artisan.name}`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total artisans: ${artisans.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(60));
  console.log('✅ Migration completed!');
  
  await client.end();
}

migrateArtisans();
