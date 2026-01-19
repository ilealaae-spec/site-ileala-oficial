import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Facebook, Phone, Mail, Send, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const { language, t } = useLanguage();
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState('');

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Successfully subscribed!' : 'Inscrito com sucesso!');
      setEmail('');
    },
    onError: (error) => {
      toast.error(error.message || (language === 'en' ? 'Failed to subscribe' : 'Falha ao inscrever'));
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeMutation.mutate({ email });
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="mb-4"
              style={{ 
                height: '60px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            <p className="text-sm text-muted-foreground">
              {settings.address}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{language === 'en' ? 'Support' : 'Suporte'}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-primary transition-colors">{language === 'en' ? 'Help' : 'Ajuda'}</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">{language === 'en' ? 'FAQ' : 'FAQ'}</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">{language === 'en' ? 'Shipping' : 'Envio'}</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">{language === 'en' ? 'Returns' : 'Devoluções'}</Link></li>
              <li><Link href="/product-care" className="hover:text-primary transition-colors">{language === 'en' ? 'Product Care' : 'Cuidados'}</Link></li>
              <li><Link href="/find-retailer" className="hover:text-primary transition-colors">{language === 'en' ? 'Retailers' : 'Revendedores'}</Link></li>
              <li><Link href="/gift-card" className="hover:text-primary transition-colors">{language === 'en' ? 'Gift Cards' : 'Vale Presente'}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.contact.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                {settings.email}
              </a>
              <p>{settings.siteUrl}</p>
              <div className="flex gap-4 mt-4">
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.home.subscribe}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t.home.subscribeText}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'en' ? 'Enter your email' : 'Digite seu email'}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  color: '#1f2937',
                }}
                className="flex-1"
                required
                disabled={subscribeMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={subscribeMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ILE ALA. All rights reserved.</p>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                {language === 'en' ? 'Privacy' : 'Privacidade'}
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                {language === 'en' ? 'Terms' : 'Termos'}
              </Link>
              <Link href="/ai-policy" className="hover:text-primary transition-colors">
                {language === 'en' ? 'AI Policy' : 'Política IA'}
              </Link>
              <Link href="/accessibility" className="hover:text-primary transition-colors">
                {language === 'en' ? 'Accessibility' : 'Acessibilidade'}
              </Link>
              <Link href="/do-not-sell" className="hover:text-primary transition-colors">
                {language === 'en' ? 'Do Not Sell' : 'Não Vender'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
