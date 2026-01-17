import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: number;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function WishlistButton({
  productId,
  className,
  size = 'icon',
  variant = 'ghost'
}: WishlistButtonProps) {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Check if item is in wishlist
  const { data: wishlistItems } = trpc.wishlist.items.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isInWishlist = wishlistItems?.some(item => item.productId === productId) ?? false;

  const addMutation = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Added to wishlist' : 'Adicionado à lista de desejos');
      utils.wishlist.items.invalidate();
    },
    onError: (error) => {
      if (error.message.includes('already')) {
        toast.info(language === 'en' ? 'Already in wishlist' : 'Já está na lista de desejos');
      } else {
        toast.error(language === 'en' ? 'Failed to add to wishlist' : 'Falha ao adicionar');
      }
    },
  });

  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Removed from wishlist' : 'Removido da lista de desejos');
      utils.wishlist.items.invalidate();
    },
    onError: () => {
      toast.error(language === 'en' ? 'Failed to remove' : 'Falha ao remover');
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info(language === 'en' ? 'Please sign in to add to wishlist' : 'Entre para adicionar à lista de desejos');
      setLocation('/login?redirect=' + window.location.pathname);
      return;
    }

    if (isInWishlist) {
      removeMutation.mutate({ productId });
    } else {
      addMutation.mutate({ productId });
    }
  };

  const isLoading = addMutation.isPending || removeMutation.isPending;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'transition-all duration-200',
        isInWishlist && 'text-red-500 hover:text-red-600',
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      title={isInWishlist
        ? (language === 'en' ? 'Remove from wishlist' : 'Remover da lista de desejos')
        : (language === 'en' ? 'Add to wishlist' : 'Adicionar à lista de desejos')
      }
    >
      <Heart
        className={cn(
          'w-5 h-5 transition-all',
          isInWishlist && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
    </Button>
  );
}
