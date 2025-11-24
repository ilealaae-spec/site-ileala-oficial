import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { sanityClient, urlFor } from '@/lib/sanity';
import { Link, useLocation } from 'wouter';
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import LazyImage from '@/components/LazyImage';

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  salePrice?: number;
  shortDescription?: string;
  description?: string;
  mainImage?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  category?: string;
  collection?: string;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
}

export default function HomeAccents() {
  const { t, language } = useLanguage();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: profileValidation } = trpc.auth.validateProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCheckoutMutation = trpc.payment.createSanityCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(language === 'en' ? 'Failed to create checkout session' : 'Falha ao criar sessão de checkout');
      console.error('Checkout error:', error);
      setBuyingProductId(null);
    },
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        // Filter products by collections: Cushions, Hand Towels
        const query = `*[_type == "product" && (
          collection match "Cushion*" || 
          collection match "Hand Towel*"
        ) && inStock == true] | order(_createdAt desc) {
          _id,
          name,
          slug,
          price,
          salePrice,
          shortDescription,
          description,
          mainImage {
            asset,
            alt
          },
          category,
          collection,
          inStock,
          featured,
          isNew,
          onSale
        }`;
        
        const data = await sanityClient.fetch(query);
        console.log('Home Accents products fetched from Sanity:', data);
        console.log('Number of home accents:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.warn('No home accents found in Sanity');
          setError('No home accents available. Please add products in Sanity CMS.');
        } else {
          setProducts(data);
        }
      } catch (err: any) {
        console.error('Error fetching home accents from Sanity:', err);
        setError(err?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} AED`;
  };

  const getImageUrl = (mainImage: SanityProduct['mainImage']) => {
    if (!mainImage?.asset) return null;
    try {
      return urlFor(mainImage.asset).width(800).height(800).url();
    } catch (err) {
      console.error('Error generating image URL:', err);
      return null;
    }
  };

  const handleBuyNow = (product: SanityProduct) => {
    if (!isAuthenticated) {
      toast.error(language === 'en' ? 'Please sign in to continue' : 'Por favor, faça login para continuar');
      setLocation(`/login?redirect=/home-accents`);
      return;
    }

    if (profileValidation && !profileValidation.isValid) {
      const missingFields = profileValidation.missingFields;
      const fieldNames: Record<string, string> = {
        name: language === 'en' ? 'Full Name' : 'Nome Completo',
        phone: language === 'en' ? 'Phone Number' : 'Telefone',
        address: language === 'en' ? 'Address' : 'Endereço',
        city: language === 'en' ? 'City' : 'Cidade',
        state: language === 'en' ? 'State/Emirate' : 'Estado/Emirado',
        country: language === 'en' ? 'Country' : 'País',
      };
      
      const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join(', ');
      
      toast.error(
        language === 'en' 
          ? `Please complete your profile before checkout. Missing: ${missingFieldNames}` 
          : `Por favor, complete seu perfil antes de finalizar a compra. Faltando: ${missingFieldNames}`,
        { duration: 5000 }
      );
      
      setLocation('/profile');
      return;
    }

    const imageUrl = getImageUrl(product.mainImage);
    const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
    
    setBuyingProductId(product._id);
    
    createCheckoutMutation.mutate({
      productId: product._id,
      productName: product.name,
      productPrice: displayPrice,
      productImage: imageUrl || undefined,
      quantity: 1,
    });
  };

  const filteredProducts = products?.filter((product) => {
    const query = searchQuery.toLowerCase();
    const name = product.name.toLowerCase();
    const description = product.shortDescription?.toLowerCase() || product.description?.toLowerCase() || '';
    
    return name.includes(query) || description.includes(query);
  }) || [];

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
              {language === 'en' ? 'Home Accents' : 'Detalhes para Casa'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {language === 'en' 
                ? 'Elegant details to enhance your home' 
                : 'Detalhes elegantes para valorizar sua casa'}
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
              placeholder={language === 'en' ? 'Search home accents...' : 'Buscar detalhes para casa...'}
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
                const imageUrl = getImageUrl(product.mainImage);
                const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
                const isBuying = buyingProductId === product._id;
                
                return (
                  <Card key={product._id} className="overflow-hidden group">
                    <Link href={`/sanity-products/${product.slug.current}`}>
                      <div className="aspect-square overflow-hidden bg-muted cursor-pointer relative">
                        {imageUrl ? (
                          <LazyImage
                            src={imageUrl}
                            alt={product.mainImage?.alt || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                        {product.onSale && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                            SALE
                          </div>
                        )}
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                            NEW
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link href={`/sanity-products/${product.slug.current}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                          {product.name}
                        </h3>
                      </Link>
                      {product.shortDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {product.onSale && product.salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-primary">
                                {formatPrice(product.salePrice)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const imageUrl = getImageUrl(product.mainImage);
                            addItem({
                              id: product._id,
                              name: product.name,
                              price: displayPrice,
                              quantity: 1,
                              imageUrl: imageUrl || undefined,
                            });
                            toast.success(
                              language === 'en'
                                ? `${product.name} added to cart!`
                                : `${product.name} adicionado ao carrinho!`
                            );
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {language === 'en' ? 'Add to Cart' : 'Adicionar'}
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleBuyNow(product)}
                          disabled={isBuying || createCheckoutMutation.isPending}
                        >
                          {isBuying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {language === 'en' ? 'Processing...' : 'Processando...'}
                            </>
                          ) : (
                            language === 'en' ? 'Buy Now' : 'Comprar'
                          )}
                        </Button>
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
                    : 'No home accents available at the moment.'
                  : searchQuery
                    ? 'Nenhum produto encontrado para sua busca.'
                    : 'Nenhum detalhe para casa disponível no momento.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
