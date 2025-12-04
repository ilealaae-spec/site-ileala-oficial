import { useParams, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import LazyImage from '@/components/LazyImage';

export default function CategoryPage() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { addItem } = useCart();

  // Load products by category slug
  const { data: products = [], isLoading } = trpc.products.byCategory.useQuery(
    { category: slug || '' },
    { 
      enabled: !!slug,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Load all categories to find the current one
  const { data: categories = [] } = trpc.categories.list.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
  const currentCategory = categories.find((cat: any) => cat.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {language === "en" ? "Loading products..." : "Carregando produtos..."}
          </p>
        </div>
      </div>
    );
  }

  if (!currentCategory || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Category Not Found" : "Categoria Não Encontrada"}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {language === "en"
              ? "The category you're looking for doesn't exist or has no products."
              : "A categoria que você procura não existe ou não tem produtos."}
          </p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "en" ? "Back to Home" : "Voltar para Início"}
          </Button>
        </div>
      </div>
    );
  }

  // Format price: database stores price in fils (1 AED = 100 fils)
  const formatPrice = (priceInFils: number) => {
    const priceInAED = priceInFils / 100;
    return `${priceInAED.toFixed(2)} AED`;
  };

  const handleAddToCart = (product: any) => {
    const priceInAED = product.price / 100; // Convert from fils to AED
    addItem({
      id: String(product.id),
      name: language === 'en' ? product.nameEN : product.namePT,
      price: priceInAED,
      image: product.imageUrl || undefined,
      slug: product.slug,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "en" ? "Back to Home" : "Voltar para Início"}
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {language === 'en' ? currentCategory.nameEN : currentCategory.namePT}
          </h1>
          {currentCategory.descriptionEN && (
            <p className="text-lg text-gray-600 max-w-3xl">
              {language === 'en' ? currentCategory.descriptionEN : currentCategory.descriptionPT}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                {product.imageUrl ? (
                  <LazyImage
                    src={product.imageUrl}
                    alt={language === 'en' ? product.nameEN : product.namePT}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {language === 'en' ? 'No image' : 'Sem imagem'}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {language === 'en' ? product.nameEN : product.namePT}
                </h3>
                {product.descriptionEN && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {language === 'en' ? product.descriptionEN : product.descriptionPT}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {language === 'en' ? 'Add' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
