import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ShoppingCart, Package, Truck, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getProductBySlug, urlFor, type SanityProduct } from '@/lib/sanity';
import { Link } from 'wouter';

export default function SanityProductDetail() {
  const [, params] = useRoute('/products/:slug');
  const { language } = useLanguage();
  const [product, setProduct] = useState<SanityProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.slug) return;
      
      try {
        const data = await getProductBySlug(params.slug);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(language === 'en' ? 'Failed to load product' : 'Falha ao carregar produto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params?.slug, language]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">
          {language === 'en' ? 'Product not found' : 'Produto não encontrado'}
        </h1>
        <Link href="/products">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Products' : 'Voltar aos Produtos'}
          </Button>
        </Link>
      </div>
    );
  }

  const allImages = [product.mainImage, ...(product.images || [])];

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="container py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            {language === 'en' ? 'Home' : 'Início'}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-foreground">
            {language === 'en' ? 'Products' : 'Produtos'}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                {allImages[selectedImage] ? (
                  <img
                    src={urlFor(allImages[selectedImage]).width(800).height(800).url()}
                    alt={allImages[selectedImage].alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    {language === 'en' ? 'No image' : 'Sem imagem'}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
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
              {/* Category */}
              <div>
                <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded">
                  {getCategoryLabel(product.category)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold">{product.name}</h1>

              {/* Collection */}
              {product.collection && (
                <p className="text-lg text-muted-foreground">{product.collection}</p>
              )}

              {/* Price */}
              <div className="flex items-center gap-4">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="inline-block px-2 py-1 text-sm font-medium bg-red-100 text-red-800 rounded">
                      {language === 'en' ? 'Sale' : 'Promoção'}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                )}
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                {product.featured && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded">
                    {language === 'en' ? 'Featured' : 'Destaque'}
                  </span>
                )}
                {product.isNew && (
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded">
                    {language === 'en' ? 'New' : 'Novo'}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
              )}

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                  {product.inStock
                    ? (language === 'en' ? 'In Stock' : 'Em Estoque')
                    : (language === 'en' ? 'Out of Stock' : 'Esgotado')}
                </span>
                {product.stockQuantity && product.stockQuantity > 0 && (
                  <span className="text-muted-foreground">
                    ({product.stockQuantity} {language === 'en' ? 'available' : 'disponíveis'})
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.inStock && (
                <div className="flex items-center gap-4">
                  <span className="font-medium">
                    {language === 'en' ? 'Quantity:' : 'Quantidade:'}
                  </span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 border-x">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="w-full"
                disabled={!product.inStock}
                onClick={() => {
                  toast.info(language === 'en' 
                    ? 'Shopping cart coming soon!' 
                    : 'Carrinho de compras em breve!');
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.inStock
                  ? (language === 'en' ? 'Add to Cart' : 'Adicionar ao Carrinho')
                  : (language === 'en' ? 'Out of Stock' : 'Esgotado')
                }
              </Button>

              {/* Product Details */}
              <Card className="p-6 space-y-4">
                <h3 className="font-semibold text-lg">
                  {language === 'en' ? 'Product Details' : 'Detalhes do Produto'}
                </h3>
                
                {product.material && (
                  <div>
                    <span className="font-medium">{language === 'en' ? 'Material:' : 'Material:'} </span>
                    <span className="text-muted-foreground">{product.material}</span>
                  </div>
                )}

                {product.dimensions && (
                  <div>
                    <span className="font-medium">{language === 'en' ? 'Dimensions:' : 'Dimensões:'} </span>
                    <span className="text-muted-foreground">{product.dimensions}</span>
                  </div>
                )}

                {product.weight && (
                  <div>
                    <span className="font-medium">{language === 'en' ? 'Weight:' : 'Peso:'} </span>
                    <span className="text-muted-foreground">{product.weight} kg</span>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="font-medium">{language === 'en' ? 'Available Colors:' : 'Cores Disponíveis:'} </span>
                    <span className="text-muted-foreground">{product.colors.join(', ')}</span>
                  </div>
                )}

                {product.sku && (
                  <div>
                    <span className="font-medium">SKU: </span>
                    <span className="text-muted-foreground">{product.sku}</span>
                  </div>
                )}
              </Card>

              {/* Care Instructions */}
              {product.careInstructions && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-3">
                    {language === 'en' ? 'Care Instructions' : 'Instruções de Cuidado'}
                  </h3>
                  <p className="text-muted-foreground whitespace-pre-line">{product.careInstructions}</p>
                </Card>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'Free Shipping' : 'Frete Grátis'}
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'Secure Payment' : 'Pagamento Seguro'}
                  </p>
                </div>
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">
                    {language === 'en' ? 'Easy Returns' : 'Devoluções Fáceis'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'en' ? 'Description' : 'Descrição'}
              </h2>
              <div className="prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
