import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import LazyImage from '@/components/LazyImage';
import WishlistButton from '@/components/WishlistButton';

// Default banner
const defaultBanner = {
  imageUrl: '/images/napkin_rings_hero.jpeg',
  altText: 'Napkin Rings - Elegant Table Accessories',
};

export default function NapkinRings() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch banner from database
  const { data: dbBanner } = (trpc as any).pageBanners.get.useQuery({ pageSlug: 'napkin-rings' });
  const banner = dbBanner || defaultBanner;
  
  // Fetch all products and filter by collection
  const productsQuery = trpc.products.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  const allProducts: any[] = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const loading = productsQuery.isLoading;
  const queryError = productsQuery.error;

  // Filter products by collection "Napkin Rings" - more flexible matching
  const products: any[] = allProducts.filter((p: any) => {
    if (p.active !== 1) return false;
    const collection = (p.collection || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    return collection.includes('napkin') || collection.includes('napkin ring') || category.includes('napkin');
  });

  // Format price: database stores price directly in AED
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} AED`;
  };

  // Get product name based on language
  const getProductName = (product: any) => {
    if (language === 'pt' && product.namePT) return product.namePT;
    if (language === 'en' && product.nameEN) return product.nameEN;
    return product.name;
  };

  // Get product description based on language
  const getProductDescription = (product: any) => {
    if (language === 'pt' && product.descriptionPT) return product.descriptionPT;
    if (language === 'en' && product.descriptionEN) return product.descriptionEN;
    return '';
  };

  // Filter products based on search query
  const filteredProducts = products?.filter((product: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = getProductName(product).toLowerCase();
    const description = getProductDescription(product).toLowerCase();
    
    return (
      name.includes(query) ||
      description.includes(query)
    );
  }) || [];

  const error = queryError ? (queryError.message || 'Failed to load products') : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
        <img
          src={banner.imageUrl}
          alt={banner.altText || 'Napkin Rings'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container h-full flex items-center justify-center">
          <div className="text-center text-white max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {language === 'en' ? 'Napkin Rings' : 'Anéis de Guardanapo'}
            </h1>
            <p className="text-lg md:text-xl font-light">
              {language === 'en' 
                ? 'Elegant napkin rings to elevate your table setting' 
                : 'Porta guardanapos elegantes para elevar sua mesa'}
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search napkin rings...' : 'Buscar porta guardanapos...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="container">
          {/* Results Count */}
          {searchQuery && (
            <div className="mb-6 text-center text-muted-foreground">
              {language === 'en' 
                ? `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} found`
                : `${filteredProducts.length} produto${filteredProducts.length !== 1 ? 's' : ''} encontrado${filteredProducts.length !== 1 ? 's' : ''}`}
            </div>
          )}

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product: any) => {
                const productName = getProductName(product);
                const productDescription = getProductDescription(product);
                return (
                  <Card key={product.id} className="overflow-hidden group">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <WishlistButton
                        productId={product.id}
                        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow-sm"
                      />
                      <Link href={`/shop/${product.slug}`}>
                        <div className="w-full h-full cursor-pointer">
                          {product.imageUrl ? (
                            <LazyImage
                              src={product.imageUrl}
                              alt={productName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                      </Link>
                      {product.featured === 1 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                          FEATURED
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                          {productName}
                        </h3>
                      </Link>
                      {productDescription && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {productDescription}
                        </p>
                      )}
                      {product.collection && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {product.collection}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold">
                            {formatPrice(product.price)}
                          </span>
                          {product.stock === 0 && (
                            <span className="text-xs text-red-500">
                              {language === 'en' ? 'Out of stock' : 'Fora de estoque'}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={product.stock === 0}
                            onClick={() => {
                              addItem({
                                id: product.id,
                                name: productName,
                                price: product.price,
                                imageUrl: product.imageUrl || undefined,
                                slug: product.slug,
                              });
                              toast.success(language === 'en' ? 'Added to cart' : 'Adicionado ao carrinho');
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Add' : 'Adicionar'}
                          </Button>
                          <Link href={`/shop/${product.slug}`}>
                            <Button size="sm">
                              {language === 'en' ? 'View' : 'Ver'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? searchQuery 
                    ? 'No products found matching your search.' 
                    : 'No napkin rings available at the moment.'
                  : searchQuery
                    ? 'Nenhum produto encontrado para sua busca.'
                    : 'Nenhum porta guardanapo disponível no momento.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
