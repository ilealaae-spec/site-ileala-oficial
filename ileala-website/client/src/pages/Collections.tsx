import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';

const collections = [
  {
    id: 'la-mer',
    name: 'La Mer',
    image: '/images/collection_la_mer.webp',
    phrase: 'La Mer is where the gaze rests. Where gesture meets silence. Where time doesn\'t run — it flows.',
    phrasePt: 'La Mer é onde o olhar repousa. Onde o gesto encontra o silêncio. Onde o tempo não corre — ele flui.',
    essence: 'Serenity and fluidity of the sea.',
    essencePt: 'Serenidade e fluidez do mar.',
  },
  {
    id: 'anima',
    name: 'Anima',
    image: '/images/collection_anima.webp',
    phrase: 'Where spirit takes form.',
    phrasePt: 'Onde o espírito toma forma.',
    essence: 'The soul in textile form.',
    essencePt: 'A alma em forma têxtil.',
  },
  {
    id: 'botanica',
    name: 'Botanica',
    image: '/images/collection_botanical.webp',
    phrase: 'Where nature whispers through every thread.',
    phrasePt: 'Onde a natureza sussurra através de cada fio.',
    essence: 'Nature transformed into art.',
    essencePt: 'A natureza transformada em arte.',
  },
  {
    id: 'khata',
    name: 'Khata',
    image: '/images/collection_khata.webp',
    phrase: 'Threads of tradition, woven with soul.',
    phrasePt: 'Fios de tradição, tecidos com alma.',
    essence: 'The sacred and ancestral gesture.',
    essencePt: 'O gesto sagrado e ancestral.',
  },
  {
    id: 'soul-stamps',
    name: 'Soul Stamps',
    image: '/images/collection_soul_stamps.webp',
    phrase: 'Impressions of soul, traced in thread.',
    phrasePt: 'Impressões da alma, traçadas em fio.',
    essence: 'The mark of the soul in every stitch.',
    essencePt: 'A marca da alma em cada ponto.',
  },
  {
    id: 'lacea',
    name: 'Lacea',
    image: '/images/collection_lacea.webp',
    phrase: 'The art of weaving grace.',
    phrasePt: 'A arte de tecer a graça.',
    essence: 'The lightness and purity of lace.',
    essencePt: 'A leveza e a pureza da renda.',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    image: '/images/collection_terracotta.webp',
    phrase: 'Where earth meets creation.',
    phrasePt: 'Onde a terra encontra a criação.',
    essence: 'The strength of matter and origin.',
    essencePt: 'A força da matéria e da origem.',
  },
  {
    id: 'nocturne',
    name: 'Nocturne',
    image: '/images/collection_nocturne.webp',
    phrase: 'Where silence becomes elegance.',
    phrasePt: 'Onde o silêncio se torna elegância.',
    essence: 'The sophistication and mystery of the night.',
    essencePt: 'A sofisticação e o mistério da noite.',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    image: '/images/collection_aurora.webp',
    phrase: 'Where light begins again.',
    phrasePt: 'Onde a luz recomeça.',
    essence: 'The celebration of cycles and renewal.',
    essencePt: 'A celebração dos ciclos e da renovação.',
  },
  {
    id: 'tablecloths',
    name: 'Tablecloths & Runners',
    image: '/images/complementary_tablecloths.webp',
    phrase: 'The foundation of every table.',
    phrasePt: 'A base de cada mesa.',
    essence: 'Elegance that sets the stage.',
    essencePt: 'Elegância que prepara o cenário.',
  },
  {
    id: 'napkin-rings',
    name: 'Napkin Rings',
    image: '/images/complementary_napkin_rings.webp',
    phrase: 'Small details, grand impressions.',
    phrasePt: 'Pequenos detalhes, grandes impressões.',
    essence: 'The finishing touch of refinement.',
    essencePt: 'O toque final de refinamento.',
  },
  {
    id: 'hand-towels',
    name: 'Hand Towels',
    image: '/images/complementary_hand_towels.webp',
    phrase: 'Softness meets sophistication.',
    phrasePt: 'Maciez encontra sofisticação.',
    essence: 'Comfort woven into every fiber.',
    essencePt: 'Conforto tecido em cada fibra.',
  },
  {
    id: 'cushions',
    name: 'Cushions',
    image: '/images/complementary_cushions.webp',
    phrase: 'Where comfort embraces beauty.',
    phrasePt: 'Onde o conforto abraça a beleza.',
    essence: 'Artistry you can rest upon.',
    essencePt: 'Arte onde você pode descansar.',
  },
];

export default function Collections() {
  const { language, t } = useLanguage();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <img 
          src="/images/collections_hero_porcelain.webp" 
          alt="ILE ALA Collections"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container h-full flex items-center justify-center">
          <div className="text-center text-white max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{t.collections.title}</h1>
            <p className="text-xl md:text-2xl font-light">
              {t.collections.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-lg italic text-muted-foreground">
              {t.collections.intro}
            </p>
            <p className="text-lg italic text-muted-foreground">
              In the weaves, memories. In the embroidery, silence. In the art, the delicacy of those who touch the world with care.
            </p>
            <p className="text-lg italic text-muted-foreground">
              Each creation is a rite. Each table, a celebration. Each color, a story that unfolds between Dubai and the world, tradition and invention.
            </p>
            <p className="text-xl font-semibold text-primary mt-6">
              More than objects — atmospheres. More than pieces — poetry one inhabits.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden">
                  <img 
                    src={collection.image} 
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-primary">{collection.name}</h3>
                  <p className="text-sm italic text-muted-foreground mb-4">
                    {language === 'en' ? collection.phrase : collection.phrasePt}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? collection.essence : collection.essencePt}
                  </p>
                </div>
              </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
