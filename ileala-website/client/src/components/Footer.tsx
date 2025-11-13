import { useLanguage } from '@/contexts/LanguageContext';
import { Instagram, Facebook } from 'lucide-react';
import { Link } from 'wouter';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground">
              Dubai, United Arab Emirates
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
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t.contact.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>www.ileala.ae</p>
              <div className="flex gap-4 mt-4">
                <a 
                  href="https://instagram.com/ileala.ae" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.facebook.com/share/17f63HzTAk/?mibextid=wwXIfr" 
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
