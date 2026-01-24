import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import embroideredWorldMap from '/images/embroidered-world-map.webp';

// Default artisans data (fallback if no database data)
const defaultArtisans = [
  {
    id: 1,
    name: 'Mr. Zeeshan',
    specialty: 'Master Tailor',
    location: 'Pakistan',
    photoUrl: '/images/artisans/zeeshan.webp',
    bioEN: 'From Pakistan, I built my career over more than twenty years, working in prestigious establishments in my country. About a year and a half ago, I arrived in Dubai — a new chapter, full of challenges and achievements. Today I am part of the ILE ALA atelier, where I can apply my experience and continue evolving every day. I take pride in the work I do and the quality we deliver. I hope to keep growing and contributing with the same commitment and dedication.',
    bioPT: 'Sou do Paquistão e construí minha carreira ao longo de mais de vinte anos, trabalhando em grandes lugares no meu país. Há cerca de um ano e meio, cheguei a Dubai — uma nova etapa, cheia de desafios e conquistas. Hoje faço parte do ateliê ILE ALA, onde posso aplicar minha experiência e continuar evoluindo todos os dias. Tenho orgulho do trabalho que realizo e da qualidade que entregamos. Espero seguir crescendo e contribuindo com o mesmo compromisso e dedicação.',
  },
  {
    id: 2,
    name: 'Mr. Sarajuddin',
    specialty: 'Master Tailor',
    location: 'India',
    photoUrl: '/images/artisans/sarajuddin.webp',
    bioEN: 'From India to Dubai, I brought with me two decades of an art cultivated with patience and devotion. I came especially to be part of the ILE ALA atelier — an opportunity I honor with every stitch, every seam. My family remains in India, but my heart is divided between two worlds: the home I left behind and the dream I build here. Perfection is not just a goal — it is the path I have chosen to walk. Each piece that passes through my hands carries not only technique, but the essence of who I am and where I come from.',
    bioPT: 'Da Índia para Dubai, trouxe comigo duas décadas de uma arte cultivada com paciência e devoção. Vim especialmente para fazer parte do ateliê ILE ALA — uma oportunidade que honro a cada ponto, a cada costura. Minha família permanece na Índia, mas meu coração está dividido entre dois mundos: o lar que deixei e o sonho que construo aqui. A perfeição não é apenas um objetivo — é o caminho que escolhi trilhar. Cada peça que passa por minhas mãos carrega não apenas técnica, mas a essência de quem sou e de onde vim.',
  },
  {
    id: 3,
    name: 'Ge',
    specialty: 'Production & Finishing Manager',
    location: 'Madagascar',
    photoUrl: '/images/artisans/ge.webp',
    bioEN: 'I am the bridge between creation and delivery, between dream and reality. I guide, organize, and care for every detail so that each piece leaves the atelier not just perfect, but fragrant, wrapped in care, and ready to touch the heart of those who receive it. Without finishing, art remains incomplete — and this is where my work finds meaning. I am the guardian of excellence, the last hand to touch each creation before it finds its destiny. ILE ALA cannot function without sewing, but it also cannot function without those who ensure everything is impeccable. This is my mission, and I fulfill it with pride every day.',
    bioPT: 'Sou a ponte entre a criação e a entrega, entre o sonho e a realidade. Oriento, organizo e cuido de cada detalhe para que cada peça saia do ateliê não apenas perfeita, mas perfumada, envolvida em cuidado e pronta para tocar o coração de quem a recebe. Sem a finalização, a arte permanece incompleta — e é aqui que meu trabalho ganha sentido. Sou a guardiã da excelência, a última mão que toca cada criação antes que ela encontre seu destino. A ILE ALA não funciona sem a costura, mas também não funciona sem quem garante que tudo esteja impecável. Essa é minha missão, e a cumpro com orgulho todos os dias.',
  },
  {
    id: 4,
    name: 'Lola',
    specialty: 'Master of Embroidery',
    location: 'Madagascar',
    photoUrl: '/images/artisans/lola.webp',
    bioEN: 'Lola is the soul behind ILE ALA\'s exquisite napkin rings. With hands that move like poetry and eyes that see perfection in every detail, she transforms simple beads and threads into small masterpieces. Her embroidery is not just craft—it is art born from devotion. Each napkin ring she creates carries the warmth of her smile, the rhythm of her island, and the promise that beauty can be both delicate and eternal. In Madagascar, where tradition meets the ocean breeze, Lola stitches dreams into reality.',
    bioPT: 'Lola é a alma por trás dos requintados porta-guardanapos da ILE ALA. Com mãos que se movem como poesia e olhos que enxergam perfeição em cada detalhe, ela transforma simples contas e fios em pequenas obras-primas. Seu bordado não é apenas artesanato—é arte nascida da devoção. Cada porta-guardanapo que ela cria carrega o calor do seu sorriso, o ritmo da sua ilha e a promessa de que a beleza pode ser ao mesmo tempo delicada e eterna. Em Madagascar, onde a tradição encontra a brisa do oceano, Lola costura sonhos na realidade.',
  },
  {
    id: 5,
    name: 'Emily',
    specialty: 'Atelier & Showroom Caretaker',
    location: 'Madagascar',
    photoUrl: '/images/artisans/emily.webp',
    bioEN: 'Emily is the invisible hand that keeps the heart of ILE ALA beating in perfect rhythm. She is the guardian of cleanliness, the keeper of order, and the quiet force that transforms every corner into a sanctuary of beauty. Every morning, before the first stitch is sewn, before the first thread is chosen, Emily ensures that the atelier and showroom shine with impeccable care. Her work is not seen in the final product, but it is felt in every breath of fresh air, every spotless surface, every organized space. She creates the peace that allows artisans to focus on their craft, the harmony that reflects the brand\'s excellence, and the serenity that makes perfection possible. From Madagascar to Dubai, Emily brings the warmth of her island and the devotion of her heart, ensuring that every day begins with the promise of perfection.',
    bioPT: 'Emily é a mão invisível que mantém o coração da ILE ALA batendo em ritmo perfeito. Ela é a guardiã da limpeza, a zeladora da ordem e a força silenciosa que transforma cada canto em um santuário de beleza. Todas as manhãs, antes que o primeiro ponto seja costurado, antes que o primeiro fio seja escolhido, Emily garante que o ateliê e o showroom brilhem com cuidado impecável. Seu trabalho não é visto no produto final, mas é sentido em cada sopro de ar fresco, em cada superfície imaculada, em cada espaço organizado. Ela cria a paz que permite aos artesãos se concentrarem em seu ofício, a harmonia que reflete a excelência da marca e a serenidade que torna a perfeição possível. De Madagascar para Dubai, Emily traz o calor de sua ilha e a devoção de seu coração, garantindo que cada dia comece com a promessa de perfeição.',
  },
  {
    id: 6,
    name: 'Ajay',
    specialty: 'India Representative & Cultural Ambassador',
    location: 'Jaipur, India',
    photoUrl: '/images/artisans/ajay.webp',
    bioEN: 'Ajay is the bridge between ILE ALA and the soul of India. Based in Jaipur, he is our trusted guide, our friend, and the eyes through which we discover the treasures of Indian craftsmanship. Extremely helpful, reliable, and deeply connected to his culture, Ajay leads us to the most authentic corners of India — where fabrics are born from ancient techniques, where block prints tell stories, where ikats dance with color, and where embroidery is a language passed down through generations. He discovers everything ILE ALA needs: raw materials, artisans, dyeing workshops, textile factories. With Ajay, we don\'t just source materials; we immerse ourselves in culture, learn stories, and build relationships rooted in trust. Ajay is the confidence we carry in India.',
    bioPT: 'Ajay é a ponte entre a ILE ALA e a alma da Índia. Baseado em Jaipur, ele é nosso guia de confiança, nosso amigo e os olhos através dos quais descobrimos os tesouros do artesanato indiano. Extremamente prestativo, confiável e profundamente conectado à sua cultura, Ajay nos leva aos cantos mais autênticos da Índia — onde os tecidos nascem de técnicas ancestrais, onde os block prints contam histórias, onde os ikats dançam com cor e onde o bordado é uma linguagem transmitida por gerações. Ele descobre tudo o que a ILE ALA precisa: matérias-primas, artesãos, oficinas de tingimento, fábricas de tecidos. Com Ajay, não apenas adquirimos materiais; mergulhamos na cultura, aprendemos histórias e construímos relacionamentos enraizados em confiança. Ajay é a confiança que carregamos na Índia.',
  },
  {
    id: 7,
    name: 'Moët Chandon',
    specialty: 'Director of Creative Calm & Harmony',
    location: 'United Arab Emirates',
    photoUrl: '/images/artisans/moet.webp',
    bioEN: 'Moët Chandon is the heart of ILE ALA — a four-pawed Director of Calm who supervises fabrics, approves softness, and ensures serenity remains woven into every stitch. Between naps and watchful glances, she teaches us that inspiration is born from silence and beauty flourishes in peace. At ILE ALA, she is not just our muse — she is the Director of Calm, the golden guardian who reminds us that even silence can shine. Her presence transforms the atelier into a sanctuary where creativity flows effortlessly, where every thread is touched by grace, and where the art of living beautifully begins with a gentle pause. Named after the champagne that celebrates life\'s finest moments, Moët Chandon embodies the elegance, joy, and timeless sophistication that define ILE ALA. She is the soul that keeps our hearts light and our hands steady — proof that luxury is not only what we create, but how we feel while creating it.',
    bioPT: 'Moët Chandon é o coração da ILE ALA — uma Diretora de Calma de quatro patas que supervisiona tecidos, aprova maciez e garante que a serenidade permaneça tecida em cada ponto. Entre cochilos e olhares atentos, ela nos ensina que a inspiração nasce do silêncio e a beleza floresce na paz. Na ILE ALA, ela não é apenas nossa musa — é a Diretora de Calma, a guardiã dourada que nos lembra que até o silêncio pode brilhar. Sua presença transforma o ateliê em um santuário onde a criatividade flui sem esforço, onde cada fio é tocado pela graça e onde a arte de viver com beleza começa com uma pausa gentil. Batizada em homenagem ao champanhe que celebra os melhores momentos da vida, Moët Chandon personifica a elegância, a alegria e a sofisticação atemporal que definem a ILE ALA. Ela é a alma que mantém nossos corações leves e nossas mãos firmes — prova de que o luxo não é apenas o que criamos, mas como nos sentimos ao criar.',
  },
];

export default function ArtisansMap() {
  const { language } = useLanguage();
  const [selectedArtisan, setSelectedArtisan] = useState<any | null>(null);

  // Fetch artisans from database
  const { data: dbArtisans } = trpc.artisans.listActive.useQuery();

  // Use database data if available, otherwise use defaults
  const artisans = (dbArtisans && dbArtisans.length > 0) ? dbArtisans : defaultArtisans;

  // Get bio based on language
  const getBio = (artisan: any) => {
    if (language === 'en') {
      return artisan.bioEN || artisan.bio || artisan.bioPT || '';
    }
    return artisan.bioPT || artisan.bio || artisan.bioEN || '';
  };

  return (
    <div className="w-full">
      <div className="relative mb-8">
        {/* Embroidered World Map Background */}
        <div className="relative w-full" style={{ paddingBottom: '50%' }}>
          <img
            src={embroideredWorldMap}
            alt="Embroidered World Map"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Artisan Cards - Small */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {artisans.map((artisan: any) => (
          <button
            key={artisan.id}
            onClick={() => setSelectedArtisan(artisan)}
            className={`p-4 rounded-lg border-2 transition-all text-left overflow-hidden ${
              selectedArtisan?.id === artisan.id
                ? 'border-primary bg-primary/5 shadow-lg'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          >
            <div className="mb-3">
              <img
                src={artisan.photoUrl || '/images/placeholder-artisan.webp'}
                alt={artisan.name}
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
            <div className="font-semibold text-sm mb-1">{artisan.name}</div>
            <div className="text-xs text-muted-foreground">
              {artisan.specialty}
            </div>
            <div className="text-xs text-primary mt-1">{artisan.location}</div>
          </button>
        ))}
      </div>

      {/* Selected Artisan Details */}
      {selectedArtisan && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{selectedArtisan.name}</h3>
              <p className="text-primary font-medium">
                {selectedArtisan.specialty} {selectedArtisan.location && `• ${selectedArtisan.location}`}
              </p>
            </div>
            <button
              onClick={() => setSelectedArtisan(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col justify-center">
              <h4 className="text-lg font-semibold mb-3">
                {language === 'en' ? 'About the Artisan' : 'Sobre o Artesão'}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {getBio(selectedArtisan)}
              </p>

              {selectedArtisan.location && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedArtisan.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
