import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import LazyImage from "@/components/LazyImage";
import { trpc } from "@/lib/trpc";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { addItem } = useCart();
  
  // Convert slug to collection name: "la-mer" -> "La Mer"
  const collectionName = slug
    ? slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
  
  // Fetch products by collection from PostgreSQL via tRPC
  const productsQuery = trpc.products.byCollection.useQuery(
    { collection: collectionName },
    {
      enabled: !!slug && !!collectionName,
      staleTime: 5 * 60 * 1000, // 5 minutes - prevent constant refetching
      refetchOnWindowFocus: false, // Prevent refetch on window focus
    }
  );
  const products: any[] = Array.isArray(productsQuery.data) ? productsQuery.data : [];
  const loading = productsQuery.isLoading;
  const queryError = productsQuery.error;

  // Format price: database stores price in fils (1 AED = 100 fils)
  const formatPrice = (priceInFils: number) => {
    const priceInAED = priceInFils / 100;
    return `${priceInAED.toFixed(2)} AED`;
  };

  // Get product name based on language
  const getProductName = (product: any) => {
    if (language === 'pt' && product.namePT) return product.namePT;
    if (language === 'en' && product.nameEN) return product.nameEN;
    return product.name;
  };

  // Get product description based on language
  const getProductDescription = (product: any) => {
    if (language === 'pt' && product.descriptionPT) return product.descriptionPT;
    if (language === 'en' && product.descriptionEN) return product.descriptionEN;
    return '';
  };

  const handleAddToCart = (product: any) => {
    const productName = getProductName(product);
    const priceInAED = product.price / 100;
    
    addItem({
      id: String(product.id),
      name: productName,
      price: priceInAED,
      image: product.imageUrl || undefined,
      slug: product.slug,
    });
    
    toast.success(
      language === "en"
        ? `${productName} added to cart!`
        : `${productName} adicionado ao carrinho!`
    );
  };

  const error = queryError ? (queryError.message || 'Failed to load products') : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">
          {language === "en" ? "Collection Not Found" : "Coleção Não Encontrada"}
        </h1>
        <p className="text-gray-600 mb-8">
          {language === "en" 
            ? "The collection you're looking for doesn't exist or has no products."
            : "A coleção que você procura não existe ou não tem produtos."}
        </p>
        <Button onClick={() => setLocation("/collections")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === "en" ? "Back to Collections" : "Voltar para Coleções"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container">
          <Button
            variant="ghost"
            onClick={() => setLocation("/collections")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {language === "en" ? "Back to Collections" : "Voltar para Coleções"}
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {collectionName}
          </h1>
          <p className="text-lg text-gray-600">
            {products.length} {products.length === 1 
              ? (language === "en" ? "product" : "produto")
              : (language === "en" ? "products" : "produtos")}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product: any) => {
            const productName = getProductName(product);
            
            return (
              <div
                key={product.id}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div
                  className="relative h-80 bg-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => setLocation(`/shop/${product.slug}`)}
                >
                  {product.imageUrl ? (
                    <LazyImage
                      src={product.imageUrl}
                      alt={productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {language === "en" ? "No Image" : "Sem Imagem"}
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {language === "en" ? "Out of Stock" : "Fora de Estoque"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3
                    className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setLocation(`/shop/${product.slug}`)}
                  >
                    {productName}
                  </h3>
                  {getProductDescription(product) && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {getProductDescription(product)}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      size="sm"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {language === "en" ? "Add to Cart" : "Adicionar"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
