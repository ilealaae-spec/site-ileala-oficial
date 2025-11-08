import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { t, language } = useLanguage();
  const utils = trpc.useUtils();
  const [collectionName, setCollectionName] = useState("");

  // Fetch all products
  const { data: products, isLoading } = trpc.products.list.useQuery();

  // Filter products by collection slug
  const collectionProducts = products?.filter(
    (product) => product.collection?.toLowerCase().replace(/\s+/g, "-") === slug
  );

  // Get collection name from first product
  useEffect(() => {
    if (collectionProducts && collectionProducts.length > 0) {
      setCollectionName(collectionProducts[0].collection || "");
    }
  }, [collectionProducts]);

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.items.invalidate();
    },
  });

  const handleAddToCart = (productId: number, name: string) => {
    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(
            language === "en"
              ? `${name} added to cart!`
              : `${name} adicionado ao carrinho!`
          );
        },
        onError: () => {
          toast.error(
            language === "en"
              ? "Failed to add to cart"
              : "Falha ao adicionar ao carrinho"
          );
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!collectionProducts || collectionProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
        <p className="text-gray-600 mb-8">
          The collection you're looking for doesn't exist or has no products.
        </p>
        <Button onClick={() => setLocation("/collections")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collections
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
            Back to Collections
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {collectionName}
          </h1>
          <p className="text-lg text-gray-600">
            {collectionProducts.length} {collectionProducts.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collectionProducts.map((product) => (
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
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      Out of Stock
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
                  {product.name}
                </h3>
                {product.descriptionEN && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.descriptionEN}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {product.price.toFixed(2)} AED
                  </span>
                  <Button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    disabled={product.stock === 0}
                    size="sm"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
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
