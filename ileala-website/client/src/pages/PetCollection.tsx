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

export default function PetCollection() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all products and filter by category
  const { data: allProducts = [], isLoading: loading, error: queryError } = trpc.products.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Filter products by category "pet-collection"
  const products = allProducts.filter(p => p.category === 'pet-collection' && p.active === 1);

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
    const collection = product.collection?.toLowerCase() || '';
    
    return (
      name.includes(query) ||
      description.includes(query) ||
      collection.includes(query)
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
      <section className="relative h-[50vh] min-h-[400px] w-full overflow-hidden bg-gradient-to-br from-[#255238] to-[#1E3F2D]">
        {/* Imagem de fundo - se existir, será exibida; caso contrário, usa gradiente */}
        <img
          src="/images/pet_collection_logo.jpeg"
          alt="Pet Collection - ILE ALA"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Se a imagem não existir, esconde o elemento img
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Pet Collection
            </h1>
            <p className="text-lg md:text-xl font-light">
              {language === 'en' 
                ? 'Luxury accessories for your beloved pets' 
                : 'Acessórios de luxo para seus pets queridos'}
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
              placeholder={language === 'en' ? 'Search pet products...' : 'Buscar produtos para pets...'}
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
                                id: String(product.id),
                                name: productName,
                                price: priceInAED,
                                image: product.imageUrl || undefined,
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
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {language === 'en' 
                  ? 'No pet collection products available at the moment' 
                  : 'Nenhum produto da coleção pet disponível no momento'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
