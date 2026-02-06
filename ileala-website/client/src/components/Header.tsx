import { useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ShoppingCart, Instagram, Facebook, User, LogOut, Package, Shield, Search, Heart, Crown } from 'lucide-react';

// Tier icons mapping
const tierIcons: Record<string, string> = {
  green: '/images/tiers/green.png',
  silver: '/images/tiers/silver.png',
  gold: '/images/tiers/gold.png',
  platinum: '/images/palmeira-black.svg',
};

const tierDisplayNames: Record<string, string> = {
  green: 'Green',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Black',
};

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [location] = useLocation();

  // Navigate on hover with delay to prevent accidental navigation
  const handleMenuHover = useCallback((href: string) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Don't navigate if already on this page
    if (location === href) return;
    // Set timeout to navigate after 300ms hover
    hoverTimeoutRef.current = setTimeout(() => {
      setLocation(href);
    }, 300);
  }, [location, setLocation]);

  const handleMenuLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  // Get wishlist count
  const { data: wishlistItems } = trpc.wishlist.items.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const wishlistCount = wishlistItems?.length || 0;

  // Get loyalty status for tier badge
  const { data: loyaltyStatus } = trpc.loyalty.myStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const userTier = loyaltyStatus?.member?.tier || 'green';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Fixed menu items - with translations
  const menuItems = [
    { href: '/', labelEN: 'Home', labelPT: 'Início' },
    { href: '/about', labelEN: 'About', labelPT: 'Sobre' },
    { href: '/collections', labelEN: 'Collections', labelPT: 'Coleções' },
    { href: '/napkin-rings', labelEN: 'Napkin Rings', labelPT: 'Anéis de Guardanapo' },
    { href: '/table-essentials', labelEN: 'Table Essentials', labelPT: 'Essenciais de Mesa' },
    { href: '/home-accents', labelEN: 'Home Accents', labelPT: 'Decoração' },
    { href: '/accessories', labelEN: 'Accessories', labelPT: 'Acessórios' },
    { href: '/pet-collection', labelEN: 'Pet Collection', labelPT: 'Coleção Pet' },
    { href: '/contact', labelEN: 'Contact', labelPT: 'Contato' },
    { href: '/gift-card', labelEN: 'Gift Cards', labelPT: 'Cartões Presente' },
    { href: '/my-loyalty', labelEN: 'The Green World', labelPT: 'The Green World' },
  ];

  // Note: Additional categories from database are intentionally NOT added here
  // to prevent menu duplication. If you need to add new categories to the menu,
  // add them to the fixed list above.

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* First Row: Search, Logo, Icons */}
      <div className="border-b">
        <div className="container flex h-20 items-center justify-between gap-4 relative">
          {/* Search - Left (Hermès style) - Hidden on mobile */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 flex-shrink-0 flex-1">
            <Search className="text-muted-foreground w-4 h-4" />
            <input
              id="header-search"
              name="header-search"
              type="text"
              placeholder={language === 'en' ? 'Search' : 'Pesquisar'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none outline-none bg-transparent text-sm w-24 focus:w-40 transition-all duration-300 placeholder:text-muted-foreground"
            />
          </form>

          {/* Language Selector - Mobile (Left side) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
            className="flex md:hidden items-center gap-1 h-9 px-2"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">{language.toUpperCase()}</span>
          </Button>

          {/* Logo - Center */}
          <Link href="/" className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <img
              src="/images/logo_ile_ala.png"
              alt="ILE ALA"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Icons - Right */}
          <div className="flex items-center gap-1 lg:gap-4">
            {/* Language Selector - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="hidden md:flex items-center gap-2 h-9 px-3"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Social Media Icons - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href="https://instagram.com/ileala.ae"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/share/17f63HzTAk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto px-2 py-1 gap-2">
                    <img
                      src={tierIcons[userTier]}
                      alt={`${tierDisplayNames[userTier]} Member`}
                      className="h-6 w-6 object-contain"
                    />
                    <div className="hidden md:flex flex-col items-start text-left">
                      <span className="text-xs font-medium leading-tight">{user?.name?.split(' ')[0] || 'User'}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">{tierDisplayNames[userTier]} Member</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3">
                      <img
                        src={tierIcons[userTier]}
                        alt={`${tierDisplayNames[userTier]} Member`}
                        className="h-10 w-10 object-contain"
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium leading-none">{user?.name || (language === 'en' ? 'My Account' : 'Minha Conta')}</p>
                        <p className="text-xs font-medium text-[#255238] mt-0.5">{tierDisplayNames[userTier]} Member</p>
                        <p className="text-[10px] leading-none text-muted-foreground mt-1">{user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Profile' : 'Perfil'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'My Orders' : 'Meus Pedidos'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-loyalty" className="flex items-center cursor-pointer">
                      <Crown className="h-4 w-4 mr-2 text-amber-500" />
                      <span className="flex flex-col leading-tight">
                        <span>The Green World</span>
                        <span className="text-[10px] font-normal italic text-muted-foreground" style={{ fontFamily: 'Georgia, serif' }}>by Ile Ala</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer bg-sage-50">
                          <Shield className="h-4 w-4 mr-2 text-sage-700" />
                          <span className="font-semibold text-sage-700">
                            {language === 'en' ? 'Admin Panel' : 'Painel Admin'}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Logout' : 'Sair'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Link href="/login">
                  <button style={{
                    height: '24px',
                    padding: '0 6px',
                    fontSize: '9px',
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#000',
                    fontWeight: '500'
                  }}>
                    {language === 'en' ? 'Login' : 'Entrar'}
                  </button>
                </Link>
                <Link href="/register">
                  <button style={{
                    height: '24px',
                    padding: '0 6px',
                    fontSize: '9px',
                    backgroundColor: '#255238',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    {language === 'en' ? 'Sign Up' : 'Criar Conta'}
                  </button>
                </Link>
              </div>
            )}

            {/* Wishlist Icon */}
            <Link href="/wishlist" className="inline-flex">
              <Button variant="ghost" size="sm" className="relative h-7 w-7 lg:h-9 lg:w-9 p-0" asChild>
                <span>
                  <Heart className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="inline-flex">
              <Button variant="ghost" size="sm" className="relative h-7 w-7 lg:h-9 lg:w-9 p-0" asChild>
                <span>
                  <ShoppingCart className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#255238] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Second Row: Navigation Menu */}
      <div className="border-b bg-white">
        <div className="container">
          <nav className="flex items-center justify-center overflow-x-auto">
            <div className="flex items-center gap-4 md:gap-6 lg:gap-8 py-3 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#214430] hover:text-[#255238] transition-colors whitespace-nowrap"
                  onMouseEnter={() => handleMenuHover(item.href)}
                  onMouseLeave={handleMenuLeave}
                >
                  {item.href === '/my-loyalty' ? (
                    <span className="flex flex-col items-center leading-tight">
                      <span>The Green World</span>
                      <span className="text-[10px] font-normal italic text-[#214430]/70" style={{ fontFamily: 'Georgia, serif' }}>by Ile Ala</span>
                    </span>
                  ) : (language === 'en' ? item.labelEN : item.labelPT)}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
