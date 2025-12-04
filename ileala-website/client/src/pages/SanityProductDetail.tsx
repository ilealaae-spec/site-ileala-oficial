import { useState } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import LazyImage from '@/components/LazyImage';

export default function SanityProductDetail() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute('/sanity-products/:slug');
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product from PostgreSQL via tRPC
  const { data: product, isLoading: loading, error: queryError } = trpc.products.bySlug.useQuery(
    { slug: params?.slug || '' },
    { enabled: !!params?.slug }
  );

  const { data: profileValidation } = trpc.auth.validateProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Format price: database stores price in fils (1 AED = 100 fils)
  const formatPrice = (priceInFils: number) => {
    const priceInAED = priceInFils / 100;
    return `${priceInAED.toFixed(2)} AED`;
  };

  // Get product name based on language
  const getProductName = () => {
    if (!product) return '';
    if (language === 'pt' && product.namePT) return product.namePT;
    if (language === 'en' && product.nameEN) return product.nameEN;
    return product.name;
  };

  // Get product description based on language
  const getProductDescription = () => {
    if (!product) return '';
    if (language === 'pt' && product.descriptionPT) return product.descriptionPT;
    if (language === 'en' && product.descriptionEN) return product.descriptionEN;
    return '';
  };

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Added to cart!' : 'Adicionado ao carrinho!');
      setQuantity(1);
    },
    onError: (error) => {
      if (error.message.includes('Not authenticated')) {
        toast.error(language === 'en' ? 'Please login to add items to cart' : 'Faça login para adicionar itens ao carrinho');
      } else {
        toast.error(language === 'en' ? 'Failed to add to cart' : 'Falha ao adicionar ao carrinho');
      }
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addToCartMutation.mutate({ productId: product.id, quantity });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (queryError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-display text-sage-900 mb-4">
          {language === 'en' ? 'Product not found' : 'Produto não encontrado'}
        </h1>
        <Link href="/shop">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Shop' : 'Voltar para Loja'}
          </Button>
        </Link>
      </div>
    );
  }

  const productName = getProductName();
  const productDescription = getProductDescription();
  const priceInAED = product.price / 100;
  const allImages = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/shop" className="inline-flex items-center text-sage-600 hover:text-sage-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back to Shop' : 'Voltar para Loja'}
        </Link>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-sage-50">
              {allImages[selectedImage] ? (
                <LazyImage
                  src={allImages[selectedImage]}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-24 h-24 text-sage-300" />
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-sage-600' : 'border-transparent hover:border-sage-300'
                    }`}
                  >
                    <LazyImage
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              {product.featured === 1 && (
                <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'en' ? 'Featured' : 'Destaque'}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl text-sage-900">{productName}</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-display text-3xl text-sage-900">{formatPrice(product.price)}</span>
              </div>
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium">{language === 'en' ? 'In Stock' : 'Em Estoque'}</span>
              ) : (
                <span className="text-red-600 font-medium">{language === 'en' ? 'Out of Stock' : 'Fora de Estoque'}</span>
              )}
            </div>

            {productDescription && (
              <div className="prose prose-sage">
                <p className="text-sage-600">{productDescription}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-3 border-t border-sage-200 pt-6">
              {product.category && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{language === 'en' ? 'Category' : 'Categoria'}:</span>
                  <span className="font-medium text-sage-900 capitalize">{product.category}</span>
                </div>
              )}
              {product.collection && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{language === 'en' ? 'Collection' : 'Coleção'}:</span>
                  <span className="font-medium text-sage-900">{product.collection}</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sage-600">{language === 'en' ? 'Quantity' : 'Quantidade'}:</span>
                <div className="flex items-center border border-sage-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-sage-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-sage-300">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-sage-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  disabled={product.stock === 0 || addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  {addToCartMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5 mr-2" />
                  )}
                  {addToCartMutation.isPending 
                    ? (language === 'en' ? 'Adding...' : 'Adicionando...')
                    : (language === 'en' ? 'Add to Cart' : 'Adicionar ao Carrinho')}
                </Button>
                <Button size="lg" variant="outline">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              <Link href="/cart">
                <Button
                  size="lg"
                  className="w-full bg-sage-600 hover:bg-sage-700"
                  disabled={product.stock === 0}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {language === 'en' ? 'Go to Checkout' : 'Ir para Checkout'}
                </Button>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-sage-200">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto text-sage-600 mb-2" />
                <p className="text-sm text-sage-600">{language === 'en' ? 'Free Shipping' : 'Frete Grátis'}</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto text-sage-600 mb-2" />
                <p className="text-sm text-sage-600">{language === 'en' ? 'Fast Delivery' : 'Entrega Rápida'}</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-sage-600 mb-2" />
                <p className="text-sm text-sage-600">{language === 'en' ? 'Secure Payment' : 'Pagamento Seguro'}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
