import { useParams, useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import LazyImage from "@/components/LazyImage";
import { trpc } from "@/lib/trpc";
import WishlistButton from "@/components/WishlistButton";

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

  // Format price: database stores price directly in AED
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} AED`;
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

    addItem({
      id: product.id,
      name: productName,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      slug: product.slug,
      stock: product.stock,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: any) => {
            const productName = getProductName(product);
            const productDescription = getProductDescription(product);

            return (
              <Card key={product.id} className="overflow-hidden group">
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <WishlistButton
                    productId={product.id}
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow-sm"
                  />
                  <Link href={`/shop/${product.slug}`}>
                    <div className="w-full h-full cursor-pointer">
                      {product.imageUrl ? (
                        <LazyImage
                          src={product.imageUrl}
                          alt={productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  {product.featured === 1 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                      FEATURED
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer">
                      {productName}
                    </h3>
                  </Link>
                  {productDescription && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {productDescription}
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
                        {formatPrice(product.price)}
                      </span>
                      {product.stock === 0 && (
                        <span className="text-xs text-red-500">
                          {language === 'en' ? 'Out of stock' : 'Fora de estoque'}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Add' : 'Adicionar'}
                      </Button>
                      <Link href={`/shop/${product.slug}`}>
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
      </div>
    </div>
  );
}
