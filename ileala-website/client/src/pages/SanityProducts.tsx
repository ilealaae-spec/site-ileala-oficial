import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import LazyImage from '@/components/LazyImage';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SanityProducts() {
  const { language } = useLanguage();
  
  // Fetch products from PostgreSQL via tRPC
  const { data: products = [], isLoading: loading, error: queryError } = trpc.products.list.useQuery();

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

  const error = queryError ? (queryError.message || 'Failed to load products') : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">
            {language === 'en' ? 'Loading products...' : 'Carregando produtos...'}
          </p>
        </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Our Products' : 'Nossos Produtos'}
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'en' 
              ? 'Discover our curated collection of luxury home essentials'
              : 'Descubra nossa coleção curada de essenciais de luxo para casa'}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {language === 'en' 
                ? 'No products available at the moment'
                : 'Nenhum produto disponível no momento'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const productName = getProductName(product);
              const productDescription = getProductDescription(product);
              
              return (
                <Card
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  {/* Product Image */}
                  <Link href={`/shop/${product.slug}`}>
                    <div className="aspect-square bg-gray-100 relative cursor-pointer">
                      {product.imageUrl ? (
                        <LazyImage
                          src={product.imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {language === 'en' ? 'No image' : 'Sem imagem'}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary cursor-pointer">
                        {productName}
                      </h3>
                    </Link>
                    
                    {productDescription && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {productDescription}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      <Link href={`/shop/${product.slug}`}>
                        <Button size="sm" variant="outline">
                          {language === 'en' ? 'View Details' : 'Ver Detalhes'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
