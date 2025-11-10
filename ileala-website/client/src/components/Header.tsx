import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Globe, ShoppingCart, Instagram, Facebook, MessageCircle } from 'lucide-react';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <img 
            src="/images/logo_ile_ala.webp" 
            alt="ILE ALA" 
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            {t.nav.home}
          </Link>
          <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
            {t.nav.about}
          </Link>
          <Link href="/collections" className="text-sm font-medium transition-colors hover:text-primary">
            {t.nav.collections}
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            {t.nav.contact}
          </Link>
          <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
            {language === 'en' ? 'Shop' : 'Loja'}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
        {/* Social Media Icons */}
        <div className="hidden lg:flex items-center gap-2 mr-2">
          <a 
            href="https://instagram.com/ileala" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a 
            href="https://facebook.com/ileala" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-4 w-4" />
          </a>
          <a 
            href="https://wa.me/971501234567" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
        <Link href="/cart" className="inline-flex">
          <Button variant="ghost" size="sm" className="relative" asChild>
            <span>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{language.toUpperCase()}</span>
        </Button>
        </div>
      </div>
    </header>
  );
}
