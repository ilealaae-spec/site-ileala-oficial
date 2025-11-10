import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getAllProducts, urlFor, type SanityProduct } from '@/lib/sanity';

export default function SanityProducts() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(language === 'en' ? 'Failed to load products' : 'Falha ao carregar produtos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [language]);

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} AED`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { en: string; pt: string }> = {
      'tableware': { en: 'Tableware', pt: 'Utensílios de Mesa' },
      'home-decor': { en: 'Home & Décor', pt: 'Casa & Decoração' },
      'bags-accessories': { en: 'Bags & Accessories', pt: 'Bolsas & Acessórios' },
      'sleepwear': { en: 'Sleepwear', pt: 'Roupa de Cama' },
      'pet-collection': { en: 'Pet Collection', pt: 'Coleção Pet' },
    };
    return language === 'en' ? labels[category]?.en : labels[category]?.pt || category;
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    const name = product.name.toLowerCase();
    const description = product.shortDescription?.toLowerCase() || '';
    const collection = product.collection?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    
    return (
      name.includes(query) ||
      description.includes(query) ||
      collection.includes(query) ||
      category.includes(query)
    );
  });

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
              {language === 'en' ? 'Our Products' : 'Nossos Produtos'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {language === 'en' 
                ? 'Discover our curated collection of luxury home essentials' 
                : 'Descubra nossa coleção selecionada de essenciais de luxo para casa'}
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
                <Card key={product._id} className="overflow-hidden group">
                  <Link href={`/products/${product.slug.current}`}>
                    <div className="aspect-square overflow-hidden bg-muted cursor-pointer">
                      {product.mainImage ? (
                        <img
                          src={urlFor(product.mainImage).width(600).height(600).url()}
                          alt={product.mainImage.alt || product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {language === 'en' ? 'No image' : 'Sem imagem'}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product.slug.current}`}>
                      <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Category Badge */}
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>

                    {/* Collection */}
                    {product.collection && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.collection}
                      </p>
                    )}

                    {/* Short Description */}
                    {product.shortDescription && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        {product.onSale && product.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        disabled={!product.inStock}
                        onClick={() => {
                          toast.info(language === 'en' 
                            ? 'Shopping cart coming soon!' 
                            : 'Carrinho de compras em breve!');
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.inStock
                          ? (language === 'en' ? 'Add' : 'Adicionar')
                          : (language === 'en' ? 'Out of Stock' : 'Esgotado')
                        }
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="flex gap-2 mt-3">
                      {product.featured && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                          {language === 'en' ? 'Featured' : 'Destaque'}
                        </span>
                      )}
                      {product.isNew && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          {language === 'en' ? 'New' : 'Novo'}
                        </span>
                      )}
                      {product.onSale && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          {language === 'en' ? 'Sale' : 'Promoção'}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {searchQuery
                  ? (language === 'en' ? 'No products found' : 'Nenhum produto encontrado')
                  : (language === 'en' ? 'No products available at the moment' : 'Nenhum produto disponível no momento')
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
