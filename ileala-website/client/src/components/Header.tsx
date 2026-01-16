import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ShoppingCart, Instagram, Facebook, User, LogOut, Package, Shield, Search, Heart } from 'lucide-react';

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const { data: cartItems } = trpc.cart.items.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fixed menu items - these are always shown
  const menuItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/collections', label: 'Collections' },
    { href: '/napkin-rings', label: 'Napkin Rings' },
    { href: '/table-essentials', label: 'Table Essentials' },
    { href: '/home-accents', label: 'Home Accents' },
    { href: '/accessories', label: 'Accessories' },
    { href: '/pet-collection', label: 'Pet Collection' },
    { href: '/contact', label: 'Contact' },
  ];

  // Note: Additional categories from database are intentionally NOT added here
  // to prevent menu duplication. If you need to add new categories to the menu,
  // add them to the fixed list above.

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* First Row: Search, Icons */}
      <div className="border-b">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Search - Left */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder={language === 'en' ? 'What are you looking for?' : 'O que você está procurando?'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9 text-sm"
              />
            </div>
          </form>

          {/* Icons - Right */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Language Selector */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="hidden md:flex items-center gap-2 h-9 px-3"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </Button>

            {/* Social Media Icons */}
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
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    {language === 'en' ? 'My Account' : 'Minha Conta'}
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
              <div className="hidden lg:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-9">
                    {language === 'en' ? 'Login' : 'Entrar'}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" className="h-9 bg-[#255238] hover:bg-[#1e3f2d] text-white">
                    {language === 'en' ? 'Sign Up' : 'Criar Conta'}
                  </Button>
                </Link>
              </div>
            )}

            {/* Wishlist Icon */}
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hidden lg:flex">
              <Heart className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Link href="/cart" className="inline-flex">
              <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" asChild>
                <span>
                  <ShoppingCart className="h-4 w-4" />
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
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
