import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import LazyImage from "@/components/LazyImage";
import { sanityClient, urlFor } from "@/lib/sanity";

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
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

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { addItem } = useCart();
  
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        
        // Buscar todos os produtos do Sanity
        const query = `*[_type == "product" && inStock == true] | order(_createdAt desc) {
          _id,
          name,
          slug,
          price,
          salePrice,
          shortDescription,
          description,
          mainImage {
            asset,
            alt
          },
          category,
          collection,
          inStock,
          featured,
          isNew,
          onSale
        }`;
        
        const allProducts = await sanityClient.fetch(query);
        
        // Filtrar produtos pela coleção (slug)
        // Converter nome da coleção para slug: "La Mer" -> "la-mer"
        const filteredProducts = allProducts.filter((product: SanityProduct) => {
          if (!product.collection) return false;
          const productSlug = product.collection.toLowerCase().replace(/\s+/g, "-");
          return productSlug === slug;
        });
        
        if (filteredProducts.length > 0) {
          setProducts(filteredProducts);
          setCollectionName(filteredProducts[0].collection || "");
        } else {
          setError("No products found in this collection");
        }
      } catch (err: any) {
        console.error('Error fetching products from Sanity:', err);
        setError(err?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [slug]);

  const handleAddToCart = (product: SanityProduct) => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      quantity: 1,
      imageUrl: product.mainImage ? urlFor(product.mainImage).width(200).url() : undefined,
    });
    
    toast.success(
      language === "en"
        ? `${product.name} added to cart!`
        : `${product.name} adicionado ao carrinho!`
    );
  };

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
          {products.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image */}
              <div
                className="relative h-80 bg-gray-100 cursor-pointer overflow-hidden"
                onClick={() => setLocation(`/shop/${product.slug.current}`)}
              >
                {product.mainImage ? (
                  <LazyImage
                    src={urlFor(product.mainImage).width(600).url()}
                    alt={product.mainImage.alt || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {language === "en" ? "No Image" : "Sem Imagem"}
                  </div>
                )}
                {!product.inStock && (
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
                  onClick={() => setLocation(`/shop/${product.slug.current}`)}
                >
                  {product.name}
                </h3>
                {product.shortDescription && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {product.salePrice ? (
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
                    disabled={!product.inStock}
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
