import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

export default function Wishlist() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const utils = trpc.useUtils();

  const { data: wishlistItems, isLoading } = trpc.wishlist.items.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Removed from wishlist' : 'Removido da lista de desejos');
      utils.wishlist.items.invalidate();
    },
    onError: () => {
      toast.error(language === 'en' ? 'Failed to remove item' : 'Falha ao remover item');
    },
  });

  const handleRemove = (productId: number) => {
    removeMutation.mutate({ productId });
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: language === 'en' ? product.nameEN : product.namePT,
      price: product.price,
      imageUrl: product.imageUrl || product.mainImage || '',
      stock: product.stock,
    }, 1);
    toast.success(language === 'en' ? 'Added to cart' : 'Adicionado ao carrinho');
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center">
          <Heart className="w-16 h-16 mx-auto text-sage-400 mb-4" />
          <h1 className="text-2xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Sign in to view your wishlist' : 'Entre para ver sua lista de desejos'}
          </h1>
          <p className="text-sage-600 mb-6">
            {language === 'en'
              ? 'Please sign in to save and view your favorite items.'
              : 'Por favor, entre para salvar e ver seus itens favoritos.'}
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/login?redirect=/wishlist')}
              className="w-full"
              style={{ backgroundColor: '#4A7C59', color: '#ffffff' }}
            >
              {language === 'en' ? 'Sign In' : 'Entrar'}
            </Button>
            <Button
              onClick={() => setLocation('/register?redirect=/wishlist')}
              variant="outline"
              className="w-full"
            >
              {language === 'en' ? 'Create Account' : 'Criar Conta'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center">
          <Heart className="w-16 h-16 mx-auto text-sage-400 mb-4" />
          <h1 className="text-2xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'Your wishlist is empty' : 'Sua lista de desejos está vazia'}
          </h1>
          <p className="text-sage-600 mb-6">
            {language === 'en'
              ? 'Start adding items you love by clicking the heart icon on products.'
              : 'Comece a adicionar itens que você ama clicando no ícone de coração nos produtos.'}
          </p>
          <Button
            onClick={() => setLocation('/shop')}
            style={{ backgroundColor: '#4A7C59', color: '#ffffff' }}
          >
            {language === 'en' ? 'Browse Products' : 'Ver Produtos'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'My Wishlist' : 'Minha Lista de Desejos'}
          </h1>
          <p className="text-sage-600">
            {language === 'en'
              ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved`
              : `${wishlistItems.length} ${wishlistItems.length !== 1 ? 'itens salvos' : 'item salvo'}`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <Link href={`/product/${item.product?.slug}`}>
                <div className="aspect-square overflow-hidden bg-sage-100">
                  <img
                    src={item.product?.imageUrl || item.product?.mainImage || '/images/placeholder.webp'}
                    alt={language === 'en' ? item.product?.nameEN : item.product?.namePT}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/product/${item.product?.slug}`}>
                  <h3 className="font-semibold text-sage-900 mb-1 hover:text-sage-700 transition-colors">
                    {language === 'en' ? item.product?.nameEN : item.product?.namePT}
                  </h3>
                </Link>
                <p className="text-sage-600 font-medium mb-4">
                  AED {(item.product?.price || 0).toFixed(2)}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product)}
                    className="flex-1"
                    size="sm"
                    style={{ backgroundColor: '#4A7C59', color: '#ffffff' }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'Add to Cart' : 'Adicionar'}
                  </Button>
                  <Button
                    onClick={() => handleRemove(item.productId)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                    disabled={removeMutation.isPending}
                  >
                    {removeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
