import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import ArtisansMap from '@/components/ArtisansMap';

export default function About() {
  const { t, language } = useLanguage();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-center mb-8 text-primary">
              {t.about.title}
            </h1>
            <p className="text-xl text-center text-muted-foreground mb-12">
              {t.about.founders}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <img 
                src="/images/about-galeries-lafayette.webp" 
                alt="Elma Bichara and Tarik Ali"
                className="w-full rounded-lg shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                {t.about.intro1}
              </p>
              <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t.about.intro2 }} />
              <p className="text-lg leading-relaxed">
                {t.about.intro3}
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-primary/5 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-primary">{t.about.philosophyTitle}</h2>
              <p className="text-lg leading-relaxed">
                {t.about.philosophy1}
              </p>
              <p className="text-lg leading-relaxed mt-4">
                {t.about.philosophy2}
              </p>
            </div>

            <div className="bg-muted/30 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-primary">{t.about.whatWeDoTitle}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {t.about.description}
              </p>
              <p className="text-lg leading-relaxed">
                {t.about.whatWeDo2}
              </p>
            </div>

            <div className="bg-primary/5 p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4 text-primary">{t.about.craftTitle}</h2>
              <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: t.about.craft1 }} />
              <p className="text-lg leading-relaxed mt-4" dangerouslySetInnerHTML={{ __html: t.about.craft2 }} />
            </div>

            <div className="text-center py-8">
              <p className="text-xl font-semibold text-primary mb-2">
                {t.about.location}
              </p>
              <p className="text-lg text-muted-foreground">
                {t.about.craft3}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Instructions Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">{t.care.title}</h2>
            <p className="text-lg text-muted-foreground">{t.care.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Textiles */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t.care.textiles}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.care.textilesDesc}</p>
                </div>
              </div>
            </Card>

            {/* Embroidery */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t.care.embroidery}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.care.embroideryDesc}</p>
                </div>
              </div>
            </Card>

            {/* Storage */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t.care.storage}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.care.storageDesc}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* General Tips */}
          <div className="mt-8 max-w-4xl mx-auto">
            <Card className="p-8 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t.care.general}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.care.generalDesc}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Artisans Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-primary">{t.about.artisansTitle}</h2>
              <p className="text-lg text-muted-foreground">
                {t.about.artisansSubtitle}
              </p>
            </div>

            {/* Interactive Map */}
            <div className="mb-12">
              <ArtisansMap />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Artisan 1 - Mr. Zeeshan (Tailor) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/zeeshan.webp" 
                      alt="Mr. Zeeshan - Tailor"
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Mr. Zeeshan</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'Master Tailor • Pakistan' : 'Mestre Alfaiate • Paquistão'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en' 
                      ? 'From Pakistan, I built my career over more than twenty years, working in prestigious establishments in my country. About a year and a half ago, I arrived in Dubai — a new chapter, full of challenges and achievements. Today I am part of the ILE ALA atelier, where I can apply my experience and continue evolving every day. I take pride in the work I do and the quality we deliver. I hope to keep growing and contributing with the same commitment and dedication.'
                      : 'Sou do Paquistão e construí minha carreira ao longo de mais de vinte anos, trabalhando em grandes lugares no meu país. Há cerca de um ano e meio, cheguei a Dubai — uma nova etapa, cheia de desafios e conquistas. Hoje faço parte do ateliê ILE ALA, onde posso aplicar minha experiência e continuar evoluindo todos os dias. Tenho orgulho do trabalho que realizo e da qualidade que entregamos. Espero seguir crescendo e contribuindo com o mesmo compromisso e dedicação.'}
                  </p>
                </div>
              </Card>

              {/* Artisan 2 - Mr. Sarajuddin (India) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/sarajuddin.webp" 
                      alt="Mr. Sarajuddin - Tailor" 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Mr. Sarajuddin</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'Master Tailor • India' : 'Mestre Alfaiate • Índia'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en'
                      ? 'From India to Dubai, I brought with me two decades of an art cultivated with patience and devotion. I came especially to be part of the ILE ALA atelier — an opportunity I honor with every stitch, every seam. My family remains in India, but my heart is divided between two worlds: the home I left behind and the dream I build here. Perfection is not just a goal — it is the path I have chosen to walk. Each piece that passes through my hands carries not only technique, but the essence of who I am and where I come from.'
                      : 'Da Índia para Dubai, trouxe comigo duas décadas de uma arte cultivada com paciência e devoção. Vim especialmente para fazer parte do ateliê ILE ALA — uma oportunidade que honro a cada ponto, a cada costura. Minha família permanece na Índia, mas meu coração está dividido entre dois mundos: o lar que deixei e o sonho que construo aqui. A perfeição não é apenas um objetivo — é o caminho que escolhi trilhar. Cada peça que passa por minhas mãos carrega não apenas técnica, mas a essência de quem sou e de onde vim.'}
                  </p>
                </div>
              </Card>

              {/* Artisan 3 - Ge (Production & Finishing Manager) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/ge.webp" 
                      alt="Ge - Production Manager" 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Ge</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'Production & Finishing Manager • Madagascar' : 'Gerente de Produção e Finalização • Madagascar'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en'
                      ? 'I am the bridge between creation and delivery, between dream and reality. I guide, organize, and care for every detail so that each piece leaves the atelier not just perfect, but fragrant, wrapped in care, and ready to touch the heart of those who receive it. Without finishing, art remains incomplete — and this is where my work finds meaning. I am the guardian of excellence, the last hand to touch each creation before it finds its destiny. ILE ALA cannot function without sewing, but it also cannot function without those who ensure everything is impeccable. This is my mission, and I fulfill it with pride every day.'
                      : 'Sou a ponte entre a criação e a entrega, entre o sonho e a realidade. Oriento, organizo e cuido de cada detalhe para que cada peça saia do ateliê não apenas perfeita, mas perfumada, envolvida em cuidado e pronta para tocar o coração de quem a recebe. Sem a finalização, a arte permanece incompleta — e é aqui que meu trabalho ganha sentido. Sou a guardiã da excelência, a última mão que toca cada criação antes que ela encontre seu destino. A ILE ALA não funciona sem a costura, mas também não funciona sem quem garante que tudo esteja impecável. Essa é minha missão, e a cumpro com orgulho todos os dias.'}
                  </p>
                </div>
              </Card>

              {/* Artisan 4 - Lola (Master of Embroidery) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/lola.webp" 
                      alt="Lola - Master of Embroidery" 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Lola</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'Master of Embroidery • Madagascar' : 'Mestre do Bordado • Madagascar'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en'
                      ? 'Lola is the soul behind ILE ALA\'s exquisite napkin rings. With hands that move like poetry and eyes that see perfection in every detail, she transforms simple beads and threads into small masterpieces. Her embroidery is not just craft—it is art born from devotion. Each napkin ring she creates carries the warmth of her smile, the rhythm of her island, and the promise that beauty can be both delicate and eternal. In Madagascar, where tradition meets the ocean breeze, Lola stitches dreams into reality.'
                      : 'Lola é a alma por trás dos requintados porta-guardanapos da ILE ALA. Com mãos que se movem como poesia e olhos que enxergam perfeição em cada detalhe, ela transforma simples contas e fios em pequenas obras-primas. Seu bordado não é apenas artesanato—é arte nascida da devoção. Cada porta-guardanapo que ela cria carrega o calor do seu sorriso, o ritmo da sua ilha e a promessa de que a beleza pode ser ao mesmo tempo delicada e eterna. Em Madagascar, onde a tradição encontra a brisa do oceano, Lola costura sonhos na realidade.'}
                  </p>
                </div>
              </Card>

              {/* Artisan 5 - Emily (Atelier & Showroom Caretaker) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/emily.webp" 
                      alt="Emily - Atelier & Showroom Caretaker" 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Emily</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'Atelier & Showroom Caretaker • Madagascar' : 'Responsável pela Limpeza e Organização • Madagascar'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en'
                      ? 'Emily is the invisible hand that keeps the heart of ILE ALA beating in perfect rhythm. She is the guardian of cleanliness, the keeper of order, and the quiet force that transforms every corner into a sanctuary of beauty. Every morning, before the first stitch is sewn, before the first thread is chosen, Emily ensures that the atelier and showroom shine with impeccable care. Her work is not seen in the final product, but it is felt in every breath of fresh air, every spotless surface, every organized space. She creates the peace that allows artisans to focus on their craft, the harmony that reflects the brand\'s excellence, and the serenity that makes perfection possible. From Madagascar to Dubai, Emily brings the warmth of her island and the devotion of her heart, ensuring that every day begins with the promise of perfection.'
                      : 'Emily é a mão invisível que mantém o coração da ILE ALA batendo em ritmo perfeito. Ela é a guardiã da limpeza, a zeladora da ordem e a força silenciosa que transforma cada canto em um santuário de beleza. Todas as manhãs, antes que o primeiro ponto seja costurado, antes que o primeiro fio seja escolhido, Emily garante que o ateliê e o showroom brilhem com cuidado impecável. Seu trabalho não é visto no produto final, mas é sentido em cada sopro de ar fresco, em cada superfície imaculada, em cada espaço organizado. Ela cria a paz que permite aos artesãos se concentrarem em seu ofício, a harmonia que reflete a excelência da marca e a serenidade que torna a perfeição possível. De Madagascar para Dubai, Emily traz o calor de sua ilha e a devoção de seu coração, garantindo que cada dia comece com a promessa de perfeição.'}
                  </p>
                </div>
              </Card>

              {/* Artisan 6 - Ajay (India Representative & Cultural Ambassador) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/ajay.webp" 
                      alt="Ajay - India Representative" 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Ajay</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'India Representative & Cultural Ambassador • Jaipur, India' : 'Representante na Índia e Embaixador Cultural • Jaipur, Índia'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en'
                      ? 'Ajay is the bridge between ILE ALA and the soul of India. Based in Jaipur, he is our trusted guide, our friend, and the eyes through which we discover the treasures of Indian craftsmanship. Extremely helpful, reliable, and deeply connected to his culture, Ajay leads us to the most authentic corners of India — where fabrics are born from ancient techniques, where block prints tell stories, where ikats dance with color, and where embroidery is a language passed down through generations. He discovers everything ILE ALA needs: raw materials, artisans, dyeing workshops, textile factories. With Ajay, we don\'t just source materials; we immerse ourselves in culture, learn stories, and build relationships rooted in trust. Ajay is the confidence we carry in India.'
                      : 'Ajay é a ponte entre a ILE ALA e a alma da Índia. Baseado em Jaipur, ele é nosso guia de confiança, nosso amigo e os olhos através dos quais descobrimos os tesouros do artesanato indiano. Extremamente prestativo, confiável e profundamente conectado à sua cultura, Ajay nos leva aos cantos mais autênticos da Índia — onde os tecidos nascem de técnicas ancestrais, onde os block prints contam histórias, onde os ikats dançam com cor e onde o bordado é uma linguagem transmitida por gerações. Ele descobre tudo o que a ILE ALA precisa: matérias-primas, artesãos, oficinas de tingimento, fábricas de tecidos. Com Ajay, não apenas adquirimos materiais; mergulhamos na cultura, aprendemos histórias e construímos relacionamentos enraizados em confiança. Ajay é a confiança que carregamos na Índia.'}
                  </p>
                </div>
              </Card>

              {/* Artisan 7 - Moët Chandon (Director of Creative Calm & Harmony) */}
              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="/images/artisans/moet.webp" 
                      alt="Moët Chandon - Director of Creative Calm & Harmony" 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-xl font-semibold">Moët Chandon</h3>
                      <p className="text-sm text-primary">{language === 'en' ? 'Director of Creative Calm & Harmony • Coton de Tuléar' : 'Diretora de Calma e Harmonia Criativa • Coton de Tuléar'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'en'
                      ? 'Moët Chandon is the heart of ILE ALA — a four-pawed Director of Calm who supervises fabrics, approves softness, and ensures serenity remains woven into every stitch. Between naps and watchful glances, she teaches us that inspiration is born from silence and beauty flourishes in peace. At ILE ALA, she is not just our muse — she is the Director of Calm, the golden guardian who reminds us that even silence can shine. Her presence transforms the atelier into a sanctuary where creativity flows effortlessly, where every thread is touched by grace, and where the art of living beautifully begins with a gentle pause. Named after the champagne that celebrates life\'s finest moments, Moët Chandon embodies the elegance, joy, and timeless sophistication that define ILE ALA. She is the soul that keeps our hearts light and our hands steady — proof that luxury is not only what we create, but how we feel while creating it.'
                      : 'Moët Chandon é o coração da ILE ALA — uma Diretora de Calma de quatro patas que supervisiona tecidos, aprova maciez e garante que a serenidade permaneça tecida em cada ponto. Entre cochilos e olhares atentos, ela nos ensina que a inspiração nasce do silêncio e a beleza floresce na paz. Na ILE ALA, ela não é apenas nossa musa — é a Diretora de Calma, a guardiã dourada que nos lembra que até o silêncio pode brilhar. Sua presença transforma o ateliê em um santuário onde a criatividade flui sem esforço, onde cada fio é tocado pela graça e onde a arte de viver com beleza começa com uma pausa gentil. Batizada em homenagem ao champanhe que celebra os melhores momentos da vida, Moët Chandon personifica a elegância, a alegria e a sofisticação atemporal que definem a ILE ALA. Ela é a alma que mantém nossos corações leves e nossas mãos firmes — prova de que o luxo não é apenas o que criamos, mas como nos sentimos ao criar.'}
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Card className="p-8 bg-primary/5 border-primary/20 max-w-3xl mx-auto">
                <p className="text-lg leading-relaxed">
                  {t.about.artisansConclusion}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Impact Section - Fundação Wahibi */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
                  {language === 'en' ? 'Our Social Commitment' : 'Nosso Compromisso Social'}
                </h2>
                <div className="text-5xl md:text-6xl font-bold text-primary mb-2">5%</div>
                <p className="text-xl text-muted-foreground">
                  {language === 'en' 
                    ? 'of all ILE ALA revenue supports Fundação Wahibi'
                    : 'de todo o faturamento da ILE ALA apoia a Fundação Wahibi'}
                </p>
              </div>

              <div className="space-y-6 text-center">
                <p className="text-lg leading-relaxed italic text-muted-foreground">
                  {language === 'en'
                    ? '"Beauty is not complete when it exists only for itself. True elegance blooms when it touches lives, when it transforms the world beyond our tables and walls."'
                    : '"A beleza não é completa quando existe apenas para si mesma. A verdadeira elegância floresce quando toca vidas, quando transforma o mundo além de nossas mesas e paredes."'}
                </p>

                <div className="pt-6 border-t border-primary/20">
                  <p className="text-base leading-relaxed">
                    {language === 'en'
                      ? 'At ILE ALA, we believe that every thread we weave, every pattern we create, carries a responsibility to give back. That\'s why we commit 5% of our revenue to Fundação Wahibi, an organization dedicated to preserving cultural heritage and empowering artisan communities around the world.'
                      : 'Na ILE ALA, acreditamos que cada fio que tecemos, cada padrão que criamos, carrega uma responsabilidade de retribuir. Por isso, comprometemos 5% de nossa receita à Fundação Wahibi, uma organização dedicada a preservar o patrimônio cultural e capacitar comunidades artesanais ao redor do mundo.'}
                  </p>
                </div>

                <div className="pt-6">
                  <p className="text-base leading-relaxed">
                    {language === 'en'
                      ? 'When you choose ILE ALA, you become part of a greater story—one where luxury and purpose walk hand in hand, where beauty serves not just aesthetics, but humanity. Together, we honor the hands that craft our pieces and support the communities that keep ancient traditions alive.'
                      : 'Quando você escolhe a ILE ALA, torna-se parte de uma história maior—onde luxo e propósito caminham lado a lado, onde a beleza serve não apenas à estética, mas à humanidade. Juntos, honramos as mãos que criam nossas peças e apoiamos as comunidades que mantêm vivas as tradições ancestrais.'}
                  </p>
                </div>

                <div className="pt-8">
                  <div className="flex flex-col items-center gap-6">
                    {/* Logo da Fundação Wahibi */}
                    <a 
                      href="https://fundacaowahibi.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="transition-transform hover:scale-105"
                    >
                      <img 
                        src="/images/fundacao_wahibi_logo.webp" 
                        alt="Fundação Wahibi" 
                        className="h-24 w-auto"
                      />
                    </a>
                    
                    {/* Botão de visitar site */}
                    <a 
                      href="https://fundacaowahibi.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span>
                        {language === 'en' ? 'Visit Fundação Wahibi' : 'Visite a Fundação Wahibi'}
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {language === 'en'
                        ? 'Learn more about the Fundação Wahibi\'s work in preserving cultural heritage, empowering artisan communities, and promoting sustainable development.'
                        : 'Saiba mais sobre o trabalho da Fundação Wahibi na preservação do patrimônio cultural, capacitação de comunidades artesanais e promoção do desenvolvimento sustentável.'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-light italic leading-relaxed">
              "Outside the home, we play roles. Inside it, we are our true selves. Within these walls, we disconnect from the world, recharge our energy, and create the rituals that ground and nourish our self-care."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
