import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
<<<<<<< HEAD
// Migrated from Sanity to tRPC database
import { Link, useLocation } from 'wouter';
=======
import { Link } from 'wouter';
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import LazyImage from '@/components/LazyImage';

<<<<<<< HEAD
// Using database Product type from tRPC

=======
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
export default function NapkinRings() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [buyingProductId, setBuyingProductId] = useState<number | null>(null);

  // Fetch products from database via tRPC
  const { data: products, isLoading, error } = trpc.products.byCollection.useQuery({
    collection: 'napkin-rings'
  });

  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
=======
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
  
  // Fetch all products and filter by collection
  const { data: allProducts = [], isLoading: loading, error: queryError } = trpc.products.list.useQuery();
  
  // Filter products by collection "Napkin Rings"
  const products = allProducts.filter(p => 
    p.collection?.toLowerCase().includes('napkin ring') && p.active === 1
  );

<<<<<<< HEAD
  const createCheckoutMutation = trpc.payment.createCheckout.useMutation({
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

// Products now fetched via tRPC useQuery hook above

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} AED`;
  };

// Image URLs now come directly from database (mainImage field)

  // Handle Buy Now button click
  const handleBuyNow = (product: any) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error(language === 'en' ? 'Please sign in to continue' : 'Por favor, faça login para continuar');
      setLocation(`/login?redirect=/napkin-rings`);
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

    const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    
    setBuyingProductId(product.id);
    
    createCheckoutMutation.mutate({
      productId: product.id,
      productName: product.nameEN || product.name,
      productPrice: displayPrice,
      productImage: product.mainImage || undefined,
      quantity: 1,
    });
=======
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
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
  };

  // Filter products based on search query
  const filteredProducts = products?.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
<<<<<<< HEAD
    const name = (product.nameEN || product.name || '').toLowerCase();
    const description = (product.descriptionEN || product.description || '').toLowerCase();
    const collection = (product.collection || '').toLowerCase();
=======
    const name = getProductName(product).toLowerCase();
    const description = getProductDescription(product).toLowerCase();
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
    
    return (
      name.includes(query) ||
      description.includes(query) ||
      collection.includes(query)
    );
  }) || [];

<<<<<<< HEAD
  if (isLoading) {
=======
  const error = queryError ? (queryError.message || 'Failed to load products') : null;

  if (loading) {
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
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
          <p className="text-red-600">Error loading products: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">
            {language === 'en' 
              ? 'No napkin rings products available. Please add products in Admin Panel.' 
              : 'Nenhum produto de argolas de guardanapo disponível. Por favor, adicione produtos no Painel Admin.'}
          </p>
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
                ? 'Elegant napkin rings for your table' 
                : 'Argolas de guardanapo elegantes para sua mesa'}
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
              placeholder={language === 'en' ? 'Search napkin rings...' : 'Buscar argolas de guardanapo...'}
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
<<<<<<< HEAD
                const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
                const isBuying = buyingProductId === product.id;
                const isOnSale = product.salePrice && product.salePrice < product.price;
                
                return (
                  <Card key={product.id} className="overflow-hidden group">
                    <Link href={`/products/${product.slug || product.id}`}>
                      <div className="aspect-square overflow-hidden bg-muted cursor-pointer relative">
                        {product.mainImage ? (
                          <LazyImage
                            src={product.mainImage}
                            alt={product.mainImageAlt || product.nameEN || product.name}
=======
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
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
<<<<<<< HEAD
                        {isOnSale && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                            SALE
                          </div>
                        )}
=======
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
                        {product.featured === 1 && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                            FEATURED
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-4">
<<<<<<< HEAD
                      <Link href={`/products/${product.slug || product.id}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                          {product.nameEN || product.name}
                        </h3>
                      </Link>
                      {(product.descriptionEN || product.description) && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.descriptionEN || product.description}
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
                          {isOnSale && (
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
                                id: product.id.toString(),
                                name: product.nameEN || product.name,
                                price: displayPrice,
                                image: product.mainImage || undefined,
                                slug: product.slug || product.id.toString(),
                              });
                            }}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === 'en' ? 'Add' : 'Adicionar'}
                          </Button>
                          <Link href={`/products/${product.slug || product.id}`}>
                            <Button size="sm">
                              {language === 'en' ? 'View' : 'Ver'}
                            </Button>
                          </Link>
                        </div>
=======
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
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
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
                  ? 'No napkin rings products available at the moment' 
                  : 'Nenhum produto de argolas de guardanapo disponível no momento'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
