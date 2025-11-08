import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Gift, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function WelcomePopup() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('ileala_welcome_popup_seen');
    
    if (!hasSeenPopup) {
      // Track page visits
      const pageVisitsStr = localStorage.getItem('ileala_page_visits');
      const pageVisits = pageVisitsStr ? parseInt(pageVisitsStr) : 0;
      const newPageVisits = pageVisits + 1;
      localStorage.setItem('ileala_page_visits', newPageVisits.toString());
      
      // Show popup only after visiting at least 2 pages
      if (newPageVisits >= 2) {
        // Show popup after 3 seconds
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('ileala_welcome_popup_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error(language === 'en' ? 'Please enter your email' : 'Por favor, insira seu e-mail');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email in localStorage (in production, send to backend)
      const subscribers = JSON.parse(localStorage.getItem('ileala_subscribers') || '[]');
      subscribers.push({
        email,
        date: new Date().toISOString(),
        coupon: 'WELCOME10',
      });
      localStorage.setItem('ileala_subscribers', JSON.stringify(subscribers));

      toast.success(
        language === 'en' 
          ? 'Success! Your coupon code is: WELCOME10' 
          : 'Sucesso! Seu código de cupom é: WELCOME10',
        { duration: 8000 }
      );

      handleClose();
    } catch (error) {
      toast.error(language === 'en' ? 'Something went wrong' : 'Algo deu errado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = {
    en: {
      title: 'Welcome to ILE ALA',
      subtitle: 'Get 10% OFF your first order',
      description: 'Subscribe to our newsletter and receive an exclusive discount code for your first purchase.',
      emailPlaceholder: 'Enter your email',
      button: 'Get My Discount',
      terms: 'By subscribing, you agree to receive marketing emails from ILE ALA.',
    },
    pt: {
      title: 'Bem-vindo à ILE ALA',
      subtitle: 'Ganhe 10% OFF na sua primeira compra',
      description: 'Inscreva-se em nossa newsletter e receba um código de desconto exclusivo para sua primeira compra.',
      emailPlaceholder: 'Digite seu e-mail',
      button: 'Quero Meu Desconto',
      terms: 'Ao se inscrever, você concorda em receber e-mails de marketing da ILE ALA.',
    },
  };

  const t = content[language];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">{t.title}</DialogTitle>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          
          <div className="relative p-8 text-center">
            {/* Icon */}
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-primary" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-2">{t.title}</h2>
            
            {/* Subtitle */}
            <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-semibold mb-4">
              {t.subtitle}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {t.description}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center text-lg h-12"
                required
              />
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {language === 'en' ? 'Processing...' : 'Processando...'}
                  </span>
                ) : (
                  t.button
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-muted-foreground mt-4">
              {t.terms}
            </p>

            {/* Social Sharing */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm font-medium mb-3">
                {language === 'en' ? 'Share this offer with friends:' : 'Compartilhe esta oferta com amigos:'}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = language === 'en' 
                      ? 'Get 10% OFF at ILE ALA! Use code WELCOME10' 
                      : 'Ganhe 10% OFF na ILE ALA! Use o código WELCOME10';
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                  }}
                  className="p-2 rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                  title="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = language === 'en' 
                      ? 'Get 10% OFF at ILE ALA! Use code WELCOME10' 
                      : 'Ganhe 10% OFF na ILE ALA! Use o código WELCOME10';
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
                  }}
                  className="p-2 rounded-full bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
                  title="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = language === 'en' 
                      ? 'Get 10% OFF at ILE ALA! Use code WELCOME10' 
                      : 'Ganhe 10% OFF na ILE ALA! Use o código WELCOME10';
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
                  }}
                  className="p-2 rounded-full bg-[#0A66C2] text-white hover:opacity-90 transition-opacity"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const subject = language === 'en' ? 'Special Offer from ILE ALA' : 'Oferta Especial da ILE ALA';
                    const body = language === 'en' 
                      ? `Check out this amazing offer from ILE ALA! Get 10% OFF your first order with code WELCOME10. Visit: ${url}` 
                      : `Confira esta oferta incrível da ILE ALA! Ganhe 10% OFF na sua primeira compra com o código WELCOME10. Visite: ${url}`;
                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  }}
                  className="p-2 rounded-full bg-gray-600 text-white hover:opacity-90 transition-opacity"
                  title="Share via Email"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
