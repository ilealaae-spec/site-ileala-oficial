import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, Gift, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

// Maximum times to show popup per session
const MAX_POPUP_SHOWS_PER_SESSION = 2;
// Delay before showing popup again (3 minutes)
const SECOND_POPUP_DELAY = 3 * 60 * 1000;

export default function WelcomePopup() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCount, setShowCount] = useState(0);

  // Fetch the active popup coupon from database
  const { data: popupCoupon } = trpc.coupons.getPopupCoupon.useQuery();

  // Initialize show count from sessionStorage
  useEffect(() => {
    const sessionCount = parseInt(sessionStorage.getItem('ileala_popup_session_count') || '0');
    setShowCount(sessionCount);
  }, []);

  useEffect(() => {
    // Don't show if already shown max times this session
    if (showCount >= MAX_POPUP_SHOWS_PER_SESSION) {
      return;
    }

    // Check if user subscribed (don't show popup again)
    const hasSubscribed = localStorage.getItem('ileala_popup_subscribed');
    if (hasSubscribed) {
      return;
    }

    // Determine delay based on how many times shown
    const delay = showCount === 0 ? 2000 : SECOND_POPUP_DELAY;

    // Show popup after delay (only if there's an active popup coupon)
    const timer = setTimeout(() => {
      if (popupCoupon) {
        setIsOpen(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [popupCoupon, showCount]);

  const handleClose = () => {
    setIsOpen(false);
    // Increment session count
    const newCount = showCount + 1;
    setShowCount(newCount);
    sessionStorage.setItem('ileala_popup_session_count', newCount.toString());
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
      const couponCode = popupCoupon?.code || 'WELCOME10';
      const subscribers = JSON.parse(localStorage.getItem('ileala_subscribers') || '[]');
      subscribers.push({
        email,
        date: new Date().toISOString(),
        coupon: couponCode,
      });
      localStorage.setItem('ileala_subscribers', JSON.stringify(subscribers));

      toast.success(
        language === 'en'
          ? `Success! Your coupon code is: ${couponCode}`
          : `Sucesso! Seu código de cupom é: ${couponCode}`,
        { duration: 8000 }
      );

      // Mark as subscribed so popup won't show again
      localStorage.setItem('ileala_popup_subscribed', 'true');
      setIsOpen(false);
    } catch (error) {
      toast.error(language === 'en' ? 'Something went wrong' : 'Algo deu errado');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get coupon details
  const couponCode = popupCoupon?.code || 'WELCOME10';
  const discountText = popupCoupon
    ? (popupCoupon.discountType === 'percentage'
      ? `${popupCoupon.discountValue}%`
      : `${(popupCoupon.discountValue / 100).toFixed(0)} AED`)
    : '10%';

  // Dynamic content from coupon or defaults
  const content = {
    en: {
      title: popupCoupon?.titleEN || 'Welcome to ILE ALA',
      subtitle: `Get ${discountText} OFF your first order`,
      description: popupCoupon?.descriptionEN || 'Subscribe to our newsletter and receive an exclusive discount code for your first purchase.',
      emailPlaceholder: 'Enter your email',
      button: 'Get My Discount',
      terms: 'By subscribing, you agree to receive marketing emails from ILE ALA.',
    },
    pt: {
      title: popupCoupon?.titlePT || 'Bem-vindo à ILE ALA',
      subtitle: `Ganhe ${discountText} OFF na sua primeira compra`,
      description: popupCoupon?.descriptionPT || 'Inscreva-se em nossa newsletter e receba um código de desconto exclusivo para sua primeira compra.',
      emailPlaceholder: 'Digite seu e-mail',
      button: 'Quero Meu Desconto',
      terms: 'Ao se inscrever, você concorda em receber e-mails de marketing da ILE ALA.',
    },
  };

  const t = content[language];

  // Don't render if no popup coupon is configured
  if (!popupCoupon) {
    return null;
  }

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
          {/* Background - Image or Gradient */}
          {popupCoupon.imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${popupCoupon.imageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          )}
          {popupCoupon.imageUrl && <div className="absolute inset-0 bg-black/40" />}

          <div className="relative p-8 text-center">
            {/* Icon - only show if no image */}
            {!popupCoupon.imageUrl && (
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-primary" />
              </div>
            )}

            {/* Title */}
            <h2 className={`text-3xl font-bold mb-2 ${popupCoupon.imageUrl ? 'text-white' : ''}`}>{t.title}</h2>

            {/* Subtitle */}
            <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full text-lg font-semibold mb-4">
              {t.subtitle}
            </div>

            {/* Description */}
            <p className={`mb-6 max-w-sm mx-auto ${popupCoupon.imageUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
              {t.description}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center text-lg h-12 bg-white/90"
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
            <p className={`text-xs mt-4 ${popupCoupon.imageUrl ? 'text-white/70' : 'text-muted-foreground'}`}>
              {t.terms}
            </p>

            {/* Social Sharing */}
            <div className={`mt-6 pt-6 border-t ${popupCoupon.imageUrl ? 'border-white/20' : ''}`}>
              <p className={`text-sm font-medium mb-3 ${popupCoupon.imageUrl ? 'text-white' : ''}`}>
                {language === 'en' ? 'Share this offer with friends:' : 'Compartilhe esta oferta com amigos:'}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = language === 'en'
                      ? `Get ${discountText} OFF at ILE ALA! Use code ${couponCode}`
                      : `Ganhe ${discountText} OFF na ILE ALA! Use o código ${couponCode}`;
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
                      ? `Get ${discountText} OFF at ILE ALA! Use code ${couponCode}`
                      : `Ganhe ${discountText} OFF na ILE ALA! Use o código ${couponCode}`;
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
                      ? `Check out this amazing offer from ILE ALA! Get ${discountText} OFF your first order with code ${couponCode}. Visit: ${url}`
                      : `Confira esta oferta incrível da ILE ALA! Ganhe ${discountText} OFF na sua primeira compra com o código ${couponCode}. Visite: ${url}`;
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
