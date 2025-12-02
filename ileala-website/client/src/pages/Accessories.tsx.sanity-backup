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

export default function Accessories() {
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
        
        // Filter only Bags & Accessories products
        const query = `*[_type == "product" && category == "bags-accessories" && inStock == true] | order(_createdAt desc) {
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
        console.log('Bags & Accessories products fetched from Sanity:', data);
        console.log('Number of bags & accessories products:', data?.length || 0);
        
        if (!data || data.length === 0) {
          console.warn('No bags & accessories products found in Sanity');
          setError('No bags & accessories products available. Please add products in Sanity CMS.');
        } else {
          setProducts(data);
        }
      } catch (err: any) {
        console.error('Error fetching bags & accessories products from Sanity:', err);
        console.error('Error details:', {
          message: err?.message,
          statusCode: err?.statusCode,
          response: err?.response,
        });
        setError(err?.message || 'Failed to load products. Please check console for details.');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} AED`;
  };

  // Get image URL from Sanity
  const getImageUrl = (mainImage: SanityProduct['mainImage']) => {
    if (!mainImage?.asset) return null;
    try {
      return urlFor(mainImage.asset).width(800).height(800).url();
    } catch (err) {
      console.error('Error generating image URL:', err);
      return null;
    }
  };

  // Handle Buy Now button click
  const handleBuyNow = (product: SanityProduct) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error(language === 'en' ? 'Please sign in to continue' : 'Por favor, faça login para continuar');
      setLocation(`/login?redirect=/bags-accessories`);
      return;
    }

    // Validate profile data before checkout
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

  // Filter products based on search query
  const filteredProducts = products?.filter((product) => {
    const query = searchQuery.toLowerCase();
    const name = product.name.toLowerCase();
    const description = product.shortDescription?.toLowerCase() || product.description?.toLowerCase() || '';
    const collection = product.collection?.toLowerCase() || '';
    
    return (
      name.includes(query) ||
      description.includes(query) ||
      collection.includes(query)
    );
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
              {language === 'en' ? 'Accessories' : 'Acessórios'}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              {language === 'en' 
                ? 'Elegant accessories and necessaires for travel and organization' 
                : 'Acessórios elegantes e necessaires para viagem e organização'}
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
              placeholder={language === 'en' ? 'Search accessories...' : 'Buscar acessórios...'}
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
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.shortDescription}
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
                            {formatPrice(displayPrice)}
                          </span>
                          {product.onSale && product.salePrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              addItem({
                                id: product._id,
                                name: product.name,
                                price: displayPrice,
                                image: imageUrl || undefined,
                                slug: product.slug.current,
                              });
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Add' : 'Adicionar'}
                          </Button>
                          <Link href={`/sanity-products/${product.slug.current}`}>
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
                  ? 'No bags & accessories products available at the moment' 
                  : 'Nenhum produto de bolsas e acessórios disponível no momento'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
