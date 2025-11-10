import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { sanityClient, urlFor } from '@/lib/sanity';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface SanityProductDetail {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  salePrice?: number;
  shortDescription?: string;
  description?: string;
  mainImage?: {
    asset: { _ref: string };
    alt?: string;
  };
  images?: Array<{
    asset: { _ref: string };
    alt?: string;
  }>;
  category?: string;
  inStock?: boolean;
  stockQuantity?: number;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  material?: string;
  dimensions?: string;
  colors?: string[];
  careInstructions?: string;
  sku?: string;
  weight?: number;
  stripeProductId?: string;
  stripePriceId?: string;
}

export default function SanityProductDetail() {
  const { t, language } = useLanguage();
  const [, params] = useRoute('/sanity-products/:slug');
  const [product, setProduct] = useState<SanityProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const createCheckoutMutation = trpc.payment.createSanityCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(language === 'en' ? 'Failed to create checkout session' : 'Falha ao criar sessão de checkout');
      console.error('Checkout error:', error);
    },
  });

  useEffect(() => {
    if (params?.slug) {
      fetchProduct(params.slug);
    }
  }, [params?.slug]);

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true);
      const query = `*[_type == "product" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        price,
        salePrice,
        shortDescription,
        description,
        mainImage,
        images,
        category,
        inStock,
        stockQuantity,
        featured,
        isNew,
        onSale,
        material,
        dimensions,
        colors,
        careInstructions,
        sku,
        weight,
        stripeProductId,
        stripePriceId
      }`;
      
      const data = await sanityClient.fetch(query, { slug });
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const imageUrl = getImageUrl(product.mainImage);
    const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;
    
    createCheckoutMutation.mutate({
      productId: product._id,
      productName: product.name,
      productPrice: displayPrice,
      productImage: imageUrl || undefined,
      quantity: quantity,
    });
  };

  const getImageUrl = (mainImage: SanityProductDetail['mainImage']) => {
    if (!mainImage?.asset) return null;
    try {
      return urlFor(mainImage.asset).width(800).height(800).url();
    } catch (err) {
      console.error('Error generating image URL:', err);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-display text-sage-900 mb-4">{t('Product not found')}</h1>
        <Link href="/shop">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Shop')}
          </Button>
        </Link>
      </div>
    );
  }

  const allImages = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(product.images || [])
  ];

  const displayPrice = product.onSale && product.salePrice ? product.salePrice : product.price;

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
                <img
                  src={urlFor(allImages[selectedImage]).width(800).height(800).url()}
                  alt={allImages[selectedImage].alt || product.name}
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
                    <img
                      src={urlFor(image).width(200).height(200).url()}
                      alt={image.alt || `${product.name} ${index + 1}`}
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
              {product.featured && (
                <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'en' ? 'Featured' : 'Destaque'}
                </span>
              )}
              {product.isNew && (
                <span className="bg-sage-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'en' ? 'New' : 'Novo'}
                </span>
              )}
              {product.onSale && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {language === 'en' ? 'Sale' : 'Promoção'}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl text-sage-900">{product.name}</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="font-display text-3xl text-sage-900">AED {displayPrice.toFixed(2)}</span>
                {product.onSale && product.salePrice && (
                  <span className="text-lg text-sage-500 line-through">AED {product.price.toFixed(2)}</span>
                )}
              </div>
              {product.inStock ? (
                <span className="text-green-600 font-medium">{language === 'en' ? 'In Stock' : 'Em Estoque'}</span>
              ) : (
                <span className="text-red-600 font-medium">{language === 'en' ? 'Out of Stock' : 'Fora de Estoque'}</span>
              )}
            </div>

            {product.shortDescription && (
              <p className="text-lg text-sage-700">{product.shortDescription}</p>
            )}

            {product.description && (
              <div className="prose prose-sage">
                <p className="text-sage-600">{product.description}</p>
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
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{language === 'en' ? 'Material' : 'Material'}:</span>
                  <span className="font-medium text-sage-900">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{language === 'en' ? 'Dimensions' : 'Dimensões'}:</span>
                  <span className="font-medium text-sage-900">{product.dimensions}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-sage-600">SKU:</span>
                  <span className="font-medium text-sage-900">{product.sku}</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-sage-600">{language === 'en' ? 'Available Colors' : 'Cores Disponíveis'}:</span>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <span key={index} className="px-3 py-1 bg-sage-100 text-sage-900 rounded-md text-sm">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
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
                    onClick={() => setQuantity(Math.min(product.stockQuantity || 99, quantity + 1))}
                    className="px-4 py-2 hover:bg-sage-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                size="lg"
                className="flex-1 bg-sage-600 hover:bg-sage-700"
                disabled={!product.inStock || createCheckoutMutation.isLoading}
                onClick={handleBuyNow}
              >
                {createCheckoutMutation.isLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                {createCheckoutMutation.isLoading 
                  ? (language === 'en' ? 'Processing...' : 'Processando...') 
                  : (language === 'en' ? 'Buy Now' : 'Comprar Agora')}
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
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

            {/* Care Instructions */}
            {product.careInstructions && (
              <div className="bg-sage-50 p-6 rounded-lg">
                <h3 className="font-display text-lg text-sage-900 mb-3">
                  {language === 'en' ? 'Care Instructions' : 'Instruções de Cuidado'}
                </h3>
                <p className="text-sage-600 text-sm whitespace-pre-line">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
