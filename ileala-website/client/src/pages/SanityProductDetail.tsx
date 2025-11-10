import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { sanityClient, urlFor } from '@/lib/sanity';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, ShoppingCart, Heart, Share2, Package, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SanityProductDetail {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
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
}

export default function SanityProductDetail() {
  const { t } = useLanguage();
  const [, params] = useRoute('/products/:slug');
  const [product, setProduct] = useState<SanityProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
        weight
      }`;
      
      const data = await sanityClient.fetch(query, { slug });
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sage-600">{t('Loading...')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-display text-sage-900 mb-4">{t('Product not found')}</h1>
        <Link href="/products">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('Back to Products')}
          </Button>
        </Link>
      </div>
    );
  }

  const allImages = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(product.images || [])
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/products" className="inline-flex items-center text-sage-600 hover:text-sage-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('Back to Products')}
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
                  {t('Featured')}
                </span>
              )}
              {product.isNew && (
                <span className="bg-sage-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {t('New')}
                </span>
              )}
              {product.onSale && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {t('Sale')}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl text-sage-900">{product.name}</h1>
            
            <div className="flex items-center gap-4">
              <span className="font-display text-3xl text-sage-900">AED {product.price}</span>
              {product.inStock ? (
                <span className="text-green-600 font-medium">{t('In Stock')}</span>
              ) : (
                <span className="text-red-600 font-medium">{t('Out of Stock')}</span>
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
                  <span className="text-sage-600">{t('Category')}:</span>
                  <span className="font-medium text-sage-900 capitalize">{product.category}</span>
                </div>
              )}
              {product.material && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{t('Material')}:</span>
                  <span className="font-medium text-sage-900">{product.material}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{t('Dimensions')}:</span>
                  <span className="font-medium text-sage-900">{product.dimensions}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-sage-600">{t('SKU')}:</span>
                  <span className="font-medium text-sage-900">{product.sku}</span>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-sage-600">{t('Available Colors')}:</span>
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
                <span className="text-sage-600">{t('Quantity')}:</span>
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
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t('Add to Cart')}
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
                <p className="text-sm text-sage-600">{t('Free Shipping')}</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto text-sage-600 mb-2" />
                <p className="text-sm text-sage-600">{t('Fast Delivery')}</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-sage-600 mb-2" />
                <p className="text-sm text-sage-600">{t('Secure Payment')}</p>
              </div>
            </div>

            {/* Care Instructions */}
            {product.careInstructions && (
              <div className="bg-sage-50 p-6 rounded-lg">
                <h3 className="font-display text-lg text-sage-900 mb-3">{t('Care Instructions')}</h3>
                <p className="text-sage-600 text-sm whitespace-pre-line">{product.careInstructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
