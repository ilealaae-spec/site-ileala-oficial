import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useRoute, Link } from 'wouter';
import { ShoppingCart, Loader2, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import LazyImage from '@/components/LazyImage';

export default function ProductDetail() {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const [, paramsById] = useRoute('/product/:id');
  const [, paramsBySlug] = useRoute('/shop/:slug');

  const slug = paramsBySlug?.slug;
  const productId = paramsById?.id ? parseInt(paramsById.id) : 0;
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Try to fetch by slug first, fallback to ID
  const productBySlugQuery = trpc.products.bySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug }
  );
  const productByIdQuery = trpc.products.byId.useQuery(
    { id: productId },
    { enabled: !slug && productId > 0 }
  );

  const product: any = slug ? productBySlugQuery.data : productByIdQuery.data;
  const isLoading = slug ? productBySlugQuery.isLoading : productByIdQuery.isLoading;

  const handleAddToCart = () => {
    if (product) {
      setIsAdding(true);
      addItem({
        id: product.id,
        name: language === 'en' ? product.nameEN : product.namePT,
        price: product.price,
        imageUrl: product.imageUrl || product.mainImage || '',
        slug: product.slug,
      }, quantity);
      setQuantity(1);
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  const formatPrice = (price: number) => {
    // Price is stored directly in AED (not fils)
    return `${price.toFixed(2)} AED`;
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  // Generate Product Schema Markup
  useEffect(() => {
    if (!product) return;
    
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: language === 'en' ? product.nameEN : product.namePT,
      description: language === 'en' ? product.descriptionEN : product.descriptionPT,
      image: product.imageUrl || '',
      brand: {
        '@type': 'Brand',
        name: 'ILE ALA'
      },
      offers: {
        '@type': 'Offer',
        url: typeof window !== 'undefined' ? window.location.href : '',
        priceCurrency: 'AED',
        price: product.price.toFixed(2),
        availability: product.stock > 0 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'ILE ALA'
        }
      }
    };

    // Add schema to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productSchema);
    script.id = 'product-schema';
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('product-schema');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [product, language]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Product not found' : 'Produto não encontrado'}
          </h2>
          <Link href="/shop">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back to Shop' : 'Voltar à Loja'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {product && (
        <SEO 
          title={`${language === 'en' ? product.nameEN : product.namePT} | ILE ALA`}
          description={(language === 'en' ? product.descriptionEN : product.descriptionPT) || ''}
          ogImage={product.imageUrl || undefined}
        />
      )}
      <div className="container py-12">
        <Link href="/shop">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Back to Shop' : 'Voltar à Loja'}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {product.imageUrl ? (
              <LazyImage
                src={product.imageUrl}
                alt={language === 'en' ? product.nameEN : product.namePT}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-4">
              {language === 'en' ? product.nameEN : product.namePT}
            </h1>
            
            {product.collection && (
              <p className="text-lg text-muted-foreground mb-6">
                {product.collection} Collection
              </p>
            )}

            <div className="text-3xl font-bold text-primary mb-8">
              {formatPrice(product.price)}
            </div>

            {(language === 'en' ? product.descriptionEN : product.descriptionPT) && (
              <div className="prose prose-lg mb-8">
                <p className="text-muted-foreground">
                  {language === 'en' ? product.descriptionEN : product.descriptionPT}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-sm text-green-600">
                  {language === 'en' ? `In stock (${product.stock} available)` : `Em estoque (${product.stock} disponíveis)`}
                </p>
              ) : (
                <p className="text-sm text-red-600">
                  {language === 'en' ? 'Out of stock' : 'Esgotado'}
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-medium mb-2">
                  {language === 'en' ? 'Quantity' : 'Quantidade'}
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              size="lg"
              className="w-full mb-4"
              onClick={handleAddToCart}
              disabled={isAdding || product.stock === 0}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {product.stock === 0
                ? (language === 'en' ? 'Out of Stock' : 'Esgotado')
                : (language === 'en' ? 'Add to Cart' : 'Adicionar ao Carrinho')
              }
            </Button>

            {/* Product Details */}
            <div className="mt-12 border-t pt-8">
              <h3 className="font-semibold mb-4">
                {language === 'en' ? 'Product Details' : 'Detalhes do Produto'}
              </h3>
              <dl className="space-y-2">
                {product.category && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {language === 'en' ? 'Category' : 'Categoria'}
                    </dt>
                    <dd className="font-medium">{product.category}</dd>
                  </div>
                )}
                {product.collection && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {language === 'en' ? 'Collection' : 'Coleção'}
                    </dt>
                    <dd className="font-medium">{product.collection}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
