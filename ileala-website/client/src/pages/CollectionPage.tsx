import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import LazyImage from "@/components/LazyImage";
import { trpc } from "@/lib/trpc";
<<<<<<< HEAD
// Migrated from Sanity to tRPC database

// Using database Product type from tRPC
interface SanityProduct {
  id: number;
  name: string;
  nameEN?: string;
  slug: string;
  price: number;
  salePrice?: number;
  shortDescription?: string;
  description?: string;
  mainImage?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  category?: string;
  collection?: string;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
}
=======
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { addItem } = useCart();
  
<<<<<<< HEAD
  const [collectionName, setCollectionName] = useState("");

  // Fetch products from database via tRPC
  const { data: products, isLoading, error } = trpc.products.byCollection.useQuery(
    { collection: slug || '' },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (products && products.length > 0) {
      setCollectionName(products[0].collection || "");
    }
  }, [products]);
=======
  // Convert slug to collection name: "la-mer" -> "La Mer"
  const collectionName = slug
    ? slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';
  
  // Fetch products by collection from PostgreSQL via tRPC
  const { data: products = [], isLoading: loading, error: queryError } = trpc.products.byCollection.useQuery(
    { collection: collectionName },
    { enabled: !!slug && !!collectionName }
  );

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
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)

  // Get product description based on language
  const getProductDescription = (product: typeof products[0]) => {
    if (language === 'pt' && product.descriptionPT) return product.descriptionPT;
    if (language === 'en' && product.descriptionEN) return product.descriptionEN;
    return '';
  };

  const handleAddToCart = (product: typeof products[0]) => {
    const productName = getProductName(product);
    const priceInAED = product.price / 100;
    
    addItem({
<<<<<<< HEAD
      id: product.id.toString(),
      name: product.name,
      price: product.salePrice || product.price,
      quantity: 1,
      imageUrl: product.mainImage || undefined,
=======
      id: String(product.id),
      name: productName,
      price: priceInAED,
      image: product.imageUrl || undefined,
      slug: product.slug,
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
    });
    
    toast.success(
      language === "en"
<<<<<<< HEAD
        ? `${product.nameEN || product.name} added to cart!`
        : `${product.nameEN || product.name} adicionado ao carrinho!`
    );
  };

  if (isLoading) {
=======
        ? `${productName} added to cart!`
        : `${productName} adicionado ao carrinho!`
    );
  };

  const error = queryError ? (queryError.message || 'Failed to load products') : null;

  if (loading) {
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !products || products.length === 0) {
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
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div
                className="relative h-80 bg-gray-100 cursor-pointer overflow-hidden"
<<<<<<< HEAD
                onClick={() => setLocation(`/products/${product.slug || product.id}`)}
=======
                onClick={() => setLocation(`/shop/${product.slug}`)}
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
              >
                {product.imageUrl ? (
                  <LazyImage
<<<<<<< HEAD
                    src={product.mainImage}
                    alt={product.mainImageAlt || product.nameEN || product.name}
=======
                    src={product.imageUrl}
                    alt={getProductName(product)}
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {language === "en" ? "No Image" : "Sem Imagem"}
                  </div>
                )}
<<<<<<< HEAD
                {(!product.stock || product.stock === 0) && (
=======
                {product.stock === 0 && (
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
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
<<<<<<< HEAD
                  onClick={() => setLocation(`/products/${product.slug || product.id}`)}
                >
                  {product.nameEN || product.name}
                </h3>
                {(product.descriptionEN || product.description) && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.descriptionEN || product.description}
=======
                  onClick={() => setLocation(`/shop/${product.slug}`)}
                >
                  {getProductName(product)}
                </h3>
                {getProductDescription(product) && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {getProductDescription(product)}
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
<<<<<<< HEAD
                    {(product.salePrice && product.salePrice < product.price) ? (
                      <>
                        <span className="text-2xl font-bold text-primary">
                          {product.salePrice.toFixed(2)} AED
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.price.toFixed(2)} AED
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {product.price.toFixed(2)} AED
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.stock || product.stock === 0}
=======
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
>>>>>>> 426dd4d43 (Migração completa: Sanity CMS → PostgreSQL via tRPC)
                    size="sm"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {language === "en" ? "Add to Cart" : "Adicionar"}
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
