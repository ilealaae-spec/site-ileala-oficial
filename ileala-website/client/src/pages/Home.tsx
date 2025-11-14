import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import WelcomePopup from '@/components/WelcomePopup';
import SEO from '@/components/SEO';
import Testimonials from '@/components/Testimonials';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const { t, language } = useLanguage();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
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
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
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
                    src="/images/about_me_card.webp" 
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
            {/* Video 1 - Handcrafting Process */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/Soie2j66UUM?loop=1&playlist=Soie2j66UUM&rel=0&modestbranding=1"
                title="Handcrafting Process"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video 2 - Textile Techniques */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/fdXanjwyVmU?loop=1&playlist=fdXanjwyVmU&rel=0&modestbranding=1"
                title="Textile Techniques"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video 3 - Product Details */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/661MX8EUMIM?loop=1&playlist=661MX8EUMIM&rel=0&modestbranding=1"
                title="Product Details"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video 4 - Table Setting Inspiration */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/oCGUnH1rq0Y?loop=1&playlist=oCGUnH1rq0Y&rel=0&modestbranding=1"
                title="Table Setting Inspiration"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video 5 - Artisan Stories */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/wQai0sF69bw?loop=1&playlist=wQai0sF69bw&rel=0&modestbranding=1"
                title="Artisan Stories"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video 6 - Collection Showcase */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/kT777vLqJn4?loop=1&playlist=kT777vLqJn4&rel=0&modestbranding=1"
                title="Collection Showcase"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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
                variant="secondary" 
                size="lg"
                disabled={subscribeMutation.isPending}
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
