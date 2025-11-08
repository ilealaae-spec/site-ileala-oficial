import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Shop() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Added to cart!' : 'Adicionado ao carrinho!');
    },
    onError: (error) => {
      if (error.message.includes('Not authenticated')) {
        toast.error(language === 'en' ? 'Please login to add items to cart' : 'Faça login para adicionar itens ao carrinho');
      } else {
        toast.error(language === 'en' ? 'Failed to add to cart' : 'Falha ao adicionar ao carrinho');
      }
    },
  });

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const formatPrice = (price: number) => {
    const aed = price / 100; // Convert fils to AED
    return `${aed.toFixed(2)} AED`;
  };

  // Filter products based on search query
  const filteredProducts = products?.filter((product) => {
    const query = searchQuery.toLowerCase();
    const name = (language === 'en' ? product.nameEN : product.namePT).toLowerCase();
    const description = (language === 'en' ? product.descriptionEN : product.descriptionPT)?.toLowerCase() || '';
    const collection = product.collection?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    return (
      name.includes(query) ||
      description.includes(query) ||
      collection.includes(query) ||
      category.includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              {language === 'en' ? 'Shop' : 'Loja'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {language === 'en' 
                ? 'Discover our luxury home and table collection' 
                : 'Descubra nossa coleção de luxo para casa e mesa'}
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
              placeholder={language === 'en' ? 'Search products, collections, categories...' : 'Buscar produtos, coleções, categorias...'}
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
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <Link href={`/shop/${product.slug}`}>
                    <div className="aspect-square overflow-hidden bg-muted cursor-pointer">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={language === 'en' ? product.nameEN : product.namePT}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                        {language === 'en' ? product.nameEN : product.namePT}
                      </h3>
                    </Link>
                    {product.collection && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.collection}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-semibold text-muted-foreground italic">
                        {language === 'en' ? 'Coming soon...' : 'Em breve...'}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addToCartMutation.isPending || product.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.stock === 0 
                          ? (language === 'en' ? 'Out of Stock' : 'Esgotado')
                          : (language === 'en' ? 'Add' : 'Adicionar')
                        }
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {language === 'en' 
                  ? 'No products available at the moment' 
                  : 'Nenhum produto disponível no momento'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
