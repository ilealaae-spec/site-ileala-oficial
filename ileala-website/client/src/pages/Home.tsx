import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import WelcomePopup from '@/components/WelcomePopup';
import SEO from '@/components/SEO';
import Testimonials from '@/components/Testimonials';
import { useState, useEffect, useRef } from 'react';
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

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { t, language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Auto-play do carrossel
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000); // Muda a cada 5 segundos

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
  
  // Newsletter subscription handler - Fixed v2
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error(language === 'en' ? 'Please enter a valid email' : 'Por favor, insira um email válido');
      return;
    }
    subscribeMutation.mutate({ email: newsletterEmail });
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
      {/* Hero Section - Carousel */}
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
            {/* Slide 1 - Mesa posta luxuosa (pratos dourados, oliveiras) */}
            <CarouselItem className="h-full pl-0">
              <div className="relative h-[70vh] min-h-[500px] w-full">
                <img 
                  src="/images/hero_home_table_setting.webp" 
                  alt="ILE ALA Luxury Table Setting - Handcrafted Placemats and Elegant Tableware"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative container h-full flex items-center justify-center">
                  <div className="text-center text-white max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">ILE ALA</h1>
                    <p className="text-xl md:text-2xl font-light">
                      {t.home.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 2 - Búzios/Conchas (decorative item) */}
            <CarouselItem className="h-full pl-0">
              <div className="relative h-[70vh] min-h-[500px] w-full">
                <img 
                  src="/images/hero_carousel_2.jpeg" 
                  alt="ILE ALA Collection - Decorative Shells and Wood"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative container h-full flex items-center justify-center">
                  <div className="text-center text-white max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">ILE ALA</h1>
                    <p className="text-xl md:text-2xl font-light">
                      {t.home.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 3 - Banheiro luxuoso com mármore */}
            <CarouselItem className="h-full pl-0">
              <div className="relative h-[70vh] min-h-[500px] w-full">
                <img 
                  src="/images/hero_carousel_3.jpeg?v=2" 
                  alt="ILE ALA Elegant Design - Luxury Bathroom"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative container h-full flex items-center justify-center">
                  <div className="text-center text-white max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">ILE ALA</h1>
                    <p className="text-xl md:text-2xl font-light">
                      {t.home.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>

            {/* Slide 4 - Moët Chandon (sala verde esmeralda) - foto correta */}
            <CarouselItem className="h-full pl-0">
              <div className="relative h-[70vh] min-h-[500px] w-full">
                <img 
                  src="/images/hero_carousel_moet.jpeg" 
                  alt="ILE ALA Luxury Collection - Moët Chandon"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative container h-full flex items-center justify-center">
                  <div className="text-center text-white max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">ILE ALA</h1>
                    <p className="text-xl md:text-2xl font-light">
                      {t.home.tagline}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
          
          {/* Indicadores de slide */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {[0, 1, 2, 3].map((index) => (
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

      {/* About Us Cards */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            {t.home.aboutUs}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/about">
              <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src="/images/about_me_card_new.png" 
                    alt="About me"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-semibold mb-4">{t.home.aboutMe}</h3>
                  <Button variant="outline" className="w-full">
                    {t.home.knowButton}
                  </Button>
                </div>
              </Card>
            </Link>

            <Link href="/collections">
              <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src="/images/about_collections_new.webp" 
                    alt="Our Collections"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-semibold mb-4">{t.home.ourCollections}</h3>
                  <Button variant="outline" className="w-full">
                    {t.home.knowButton}
                  </Button>
                </div>
              </Card>
            </Link>

            <Link href="/about">
              <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src="/images/our_values_card.webp" 
                    alt="Our Values"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-semibold mb-4">{t.home.ourValues}</h3>
                  <Button variant="outline" className="w-full">
                    {t.home.knowButton}
                  </Button>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Gallery Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t.videos.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.videos.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Video 1 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                className="w-full h-full object-cover"
                src="/videos/video1.mp4"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>

            {/* Video 2 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                className="w-full h-full object-cover"
                src="/videos/video2.mp4"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>

            {/* Video 3 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                className="w-full h-full object-cover"
                src="/videos/video3.mp4"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>

            {/* Video 4 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                className="w-full h-full object-cover"
                src="/videos/video4.mp4"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>

            {/* Video 5 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                className="w-full h-full object-cover"
                src="/videos/video5.mp4"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>

            {/* Video 6 */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                className="w-full h-full object-cover"
                src="/videos/video6.mp4"
                controls
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
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
                className="flex-1 px-4 py-3 rounded-md text-foreground"
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
