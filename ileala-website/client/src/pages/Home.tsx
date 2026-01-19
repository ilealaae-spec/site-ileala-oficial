import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import WelcomePopup from '@/components/WelcomePopup';
import SEO from '@/components/SEO';
import Testimonials from '@/components/Testimonials';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

// Default/fallback data
const defaultSlides = [
  { id: 1, imageUrl: '/images/hero_home_table_setting.webp', altText: 'ILE ALA Luxury Table Setting', titleEN: 'ILE ALA', titlePT: 'ILE ALA' },
  { id: 2, imageUrl: '/images/hero_carousel_2.jpeg', altText: 'ILE ALA Collection - Decorative Shells', titleEN: 'ILE ALA', titlePT: 'ILE ALA' },
  { id: 3, imageUrl: '/images/hero_carousel_3.jpeg?v=4', altText: 'ILE ALA Elegant Table Setting', titleEN: 'ILE ALA', titlePT: 'ILE ALA' },
  { id: 4, imageUrl: '/images/hero_carousel_moet.jpeg', altText: 'ILE ALA Luxury Collection', titleEN: 'ILE ALA', titlePT: 'ILE ALA' },
];

const defaultVideos = [
  { id: 1, videoUrl: '/videos/video1.mp4' },
  { id: 2, videoUrl: '/videos/video2.mp4' },
  { id: 3, videoUrl: '/videos/video3.mp4' },
  { id: 4, videoUrl: '/videos/video4.mp4' },
  { id: 5, videoUrl: '/videos/video5.mp4' },
  { id: 6, videoUrl: '/videos/video6.mp4' },
];

const defaultCards = [
  { id: 1, imageUrl: '/images/about_me_card_new.png', titleEN: 'About Me', titlePT: 'Sobre Mim', linkUrl: '/about' },
  { id: 2, imageUrl: '/images/about_collections_new.webp', titleEN: 'Our Collections', titlePT: 'Nossas Coleções', linkUrl: '/collections' },
  { id: 3, imageUrl: '/images/our_values_card.webp', titleEN: 'Our Values', titlePT: 'Nossos Valores', linkUrl: '/about' },
];

export default function Home() {
  const { t, language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Fetch dynamic content from database
  const { data: dbSlides } = trpc.heroSlides.listActive.useQuery();
  const { data: dbVideos } = trpc.homepageVideos.listActive.useQuery();
  const { data: dbCards } = trpc.homepageCards.listActive.useQuery();

  // Use database data if available, otherwise use defaults
  const slides = (dbSlides && dbSlides.length > 0) ? dbSlides : defaultSlides;
  const videos = (dbVideos && dbVideos.length > 0) ? dbVideos : defaultVideos;
  const cards = (dbCards && dbCards.length > 0) ? dbCards : defaultCards;

  // Auto-play do carrossel
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Successfully subscribed to newsletter!' : 'Inscrito com sucesso na newsletter!');
      setNewsletterEmail('');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to subscribe' : 'Falha ao se inscrever'));
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error(language === 'en' ? 'Please enter a valid email' : 'Por favor, insira um email válido');
      return;
    }
    subscribeMutation.mutate({ email: newsletterEmail });
  };

  // Get localized title for cards
  const getCardTitle = (card: any) => {
    if (language === 'en') {
      return card.titleEN || card.titlePT || '';
    }
    return card.titlePT || card.titleEN || '';
  };

  return (
    <div className="w-full">
      <SEO
        title={language === 'en' ? 'Luxury Home & Table Linens' : 'Roupas de Mesa e Decoração de Luxo'}
        description={language === 'en'
          ? 'Discover ILE ALA\'s handcrafted luxury table linens, napkins, and home decor. Artisan-made in Dubai with 12 exclusive collections.'
          : 'Descubra os tecidos de mesa de luxo artesanais da ILE ALA, guardanapos e decoração para casa. Feito por artesãos em Dubai com 12 coleções exclusivas.'}
        keywords="luxury table linens, handcrafted placemats, artisan napkins, Dubai home decor, ILE ALA"
        ogImage="/images/hero_home_table_setting.webp"
      />
      <WelcomePopup />

      {/* Hero Section - Dynamic Carousel */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <Carousel
          className="w-full h-full"
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide: any) => (
              <CarouselItem key={slide.id} className="h-full pl-0">
                <div className="relative h-[70vh] min-h-[500px] w-full">
                  <img
                    src={slide.imageUrl}
                    alt={slide.altText || (language === 'en' ? slide.titleEN : slide.titlePT) || 'ILE ALA'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative container h-full flex items-center justify-center">
                    <div className="text-center text-white max-w-3xl">
                      <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        {(language === 'en' ? slide.titleEN : slide.titlePT) || 'ILE ALA'}
                      </h1>
                      <p className="text-xl md:text-2xl font-light">
                        {(language === 'en' ? slide.subtitleEN : slide.subtitlePT) || t.home.tagline}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />

          {/* Slide indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  current === index
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </section>

      {/* Essence Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
              {t.home.essence}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t.home.essenceText}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
              {t.home.essenceText2}
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6">
              {t.home.essenceText3}
            </p>
          </div>
        </div>
      </section>

      {/* About Us Cards - Dynamic */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            {t.home.aboutUs}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card: any) => (
              <Link key={card.id} href={card.linkUrl}>
                <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={card.imageUrl}
                      alt={getCardTitle(card)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-semibold mb-4">{getCardTitle(card)}</h3>
                    <Button variant="outline" className="w-full">
                      {t.home.knowButton}
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Video Gallery Section - Dynamic */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.videos.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.videos.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video: any) => (
              <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
                <video
                  className="w-full h-full object-cover"
                  src={video.videoUrl}
                  controls
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={video.thumbnailUrl || undefined}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Newsletter Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.home.subscribe}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t.home.subscribeText}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={language === 'en' ? 'Your email address' : 'Seu endereço de email'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={subscribeMutation.isPending}
                className="flex-1 px-4 py-3 rounded-md"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  color: '#1f2937',
                }}
              />
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={subscribeMutation.isPending}
                className="bg-white text-[#255238] hover:bg-white/90 font-medium"
              >
                {subscribeMutation.isPending ? (language === 'en' ? 'Sending...' : 'Enviando...') : (language === 'en' ? 'Submit' : 'Enviar')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
