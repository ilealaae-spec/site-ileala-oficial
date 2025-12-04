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

export default function NapkinRings() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all products and filter by collection
  const { data: allProducts = [], isLoading: loading, error: queryError } = trpc.products.list.useQuery();
  
  // Filter products by collection "Napkin Rings"
  const products = allProducts.filter(p => 
    p.collection?.toLowerCase().includes('napkin ring') && p.active === 1
  );

  // Format price: database stores price in fils (1 AED = 100 fils)
  const formatPrice = (priceInFils: number) => {
    const priceInAED = priceInFils / 100;
    return `${priceInAED.toFixed(2)} AED`;
  };

  // Get product name based on language
  const getProductName = (product: typeof products[0]) => {
    if (language === 'pt' && product.namePT) return product.namePT;
    if (language === 'en' && product.nameEN) return product.nameEN;
    return product.name;
  };

  // Get product description based on language
  const getProductDescription = (product: typeof products[0]) => {
    if (language === 'pt' && product.descriptionPT) return product.descriptionPT;
    if (language === 'en' && product.descriptionEN) return product.descriptionEN;
    return '';
  };

  // Filter products based on search query
  const filteredProducts = products?.filter((product) => {
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
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden bg-primary/10">
        <div className="container h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Napkin Rings
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
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
              {filteredProducts.map((product) => {
                const productName = getProductName(product);
                const productDescription = getProductDescription(product);
                const priceInAED = product.price / 100; // Convert from fils to AED
                
                return (
                  <Card key={product.id} className="overflow-hidden group">
                    <Link href={`/shop/${product.slug}`}>
                      <div className="aspect-square overflow-hidden bg-muted cursor-pointer relative">
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
                        {product.featured === 1 && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                            FEATURED
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/shop/${product.slug}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                          {productName}
                        </h3>
                      </Link>
                      {productDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {productDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-xl font-bold">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={product.stock === 0}
                          onClick={() => {
                            addItem({
                              id: String(product.id),
                              name: productName,
                              price: priceInAED,
                              image: product.imageUrl || undefined,
                              slug: product.slug,
                            });
                            toast.success(
                              language === 'en'
                                ? `${productName} added to cart!`
                                : `${productName} adicionado ao carrinho!`
                            );
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Add to Cart' : 'Adicionar'}
                        </Button>
                        <Link href={`/shop/${product.slug}`}>
                          <Button className="flex-1">
                            {language === 'en' ? 'View' : 'Ver'}
                          </Button>
                        </Link>
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
// Force rebuild - Thu Dec  4 15:36:13 +04 2025
