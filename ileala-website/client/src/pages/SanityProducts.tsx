import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { sanityClient, urlFor } from '@/lib/sanity';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  shortDescription?: string;
  mainImage?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
}

export default function SanityProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<SanityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const query = `*[_type == "product" && inStock == true] | order(_createdAt desc) {
        _id,
        name,
        slug,
        price,
        shortDescription,
        mainImage,
        category,
        inStock,
        featured,
        isNew,
        onSale
      }`;
      
      const data = await sanityClient.fetch(query);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Hero Section */}
      <section className="bg-sage-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-sage-900 mb-4">
            {t('Our Products')}
          </h1>
          <p className="text-lg text-sage-700 max-w-2xl mx-auto">
            {t('Discover our curated collection of luxury home essentials')}
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={t('Search products, collections, categories...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 border-sage-200 focus:border-sage-400"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-sage-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? t('All Categories') : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sage-600">{t('Loading products...')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sage-600">{t('No products available at the moment')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product._id} href={`/products/${product.slug.current}`}>
                <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-sage-100">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-sage-50">
                    {product.mainImage ? (
                      <img
                        src={urlFor(product.mainImage).width(400).height(400).url()}
                        alt={product.mainImage.alt || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-sage-100">
                        <ShoppingCart className="w-16 h-16 text-sage-300" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      {product.featured && (
                        <span className="bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {t('Featured')}
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-sage-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {t('New')}
                        </span>
                      )}
                      {product.onSale && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {t('Sale')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-display text-lg text-sage-900 mb-2 group-hover:text-sage-700 transition-colors">
                      {product.name}
                    </h3>
                    {product.shortDescription && (
                      <p className="text-sm text-sage-600 mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl text-sage-900">
                        AED {product.price}
                      </span>
                      <Button
                        size="sm"
                        className="bg-sage-600 hover:bg-sage-700"
                      >
                        {t('View Details')}
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
