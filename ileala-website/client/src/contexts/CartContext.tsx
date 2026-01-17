import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  slug?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ileala_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  // Local state for guest cart
  const [localItems, setLocalItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Failed to parse cart from localStorage:', e);
          return [];
        }
      }
    }
    return [];
  });

  // Server cart for authenticated users - only query when auth is confirmed
  const { data: serverCart, isLoading: isLoadingServer } = trpc.cart.items.useQuery(undefined, {
    enabled: isAuthenticated && !authLoading,
    staleTime: 0,
    retry: false,
  });

  // Mutations for server cart
  const addMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.items.invalidate();
    },
  });

  const updateMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.items.invalidate();
    },
  });

  const removeMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.items.invalidate();
    },
  });

  const clearMutation = trpc.cart.clear.useMutation({
    onSuccess: () => {
      utils.cart.items.invalidate();
    },
  });

  // Save local cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localItems));
    }
  }, [localItems, isAuthenticated]);

  // Convert server cart items to our format
  const items: CartItem[] = useMemo(() => {
    if (isAuthenticated && serverCart) {
      return serverCart.map((item: any) => ({
        id: item.productId,
        name: item.product?.nameEN || 'Product',
        price: item.product?.price || 0,
        quantity: item.quantity,
        imageUrl: item.product?.imageUrl || item.product?.mainImage,
        slug: item.product?.slug,
        cartItemId: item.id, // Keep track of the cart item ID for updates
      }));
    }
    return localItems;
  }, [isAuthenticated, serverCart, localItems]);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    console.log('[Cart] Adding item:', item.id, 'isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);

    // If auth is still loading, add to local cart temporarily
    if (authLoading) {
      console.log('[Cart] Auth loading, adding to local cart');
      setLocalItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);
        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          return [...prevItems, { ...item, quantity }];
        }
      });
      toast.success('Item added to cart');
      return;
    }

    if (isAuthenticated) {
      // Add to server cart
      console.log('[Cart] Adding to server cart');
      addMutation.mutate({ productId: item.id, quantity }, {
        onSuccess: () => {
          console.log('[Cart] Successfully added to server cart');
          toast.success('Item added to cart');
        },
        onError: (error) => {
          console.error('[Cart] Failed to add to server cart:', error);
          toast.error('Failed to add item');
        },
      });
    } else {
      // Add to local cart
      console.log('[Cart] Adding to local cart (not authenticated)');
      setLocalItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);

        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          return [...prevItems, { ...item, quantity }];
        }
      });
      toast.success('Item added to cart');
    }
  }, [isAuthenticated, authLoading, addMutation]);

  const removeItem = useCallback((id: number) => {
    if (isAuthenticated && serverCart) {
      // Find the cart item by product ID
      const cartItem = serverCart.find((item: any) => item.productId === id);
      if (cartItem) {
        removeMutation.mutate({ id: cartItem.id }, {
          onSuccess: () => {
            toast.success('Item removed');
          },
          onError: () => {
            toast.error('Failed to remove item');
          },
        });
      }
    } else {
      setLocalItems((prevItems) => prevItems.filter((item) => item.id !== id));
      toast.success('Item removed');
    }
  }, [isAuthenticated, serverCart, removeMutation]);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    if (isAuthenticated && serverCart) {
      // Find the cart item by product ID
      const cartItem = serverCart.find((item: any) => item.productId === id);
      if (cartItem) {
        updateMutation.mutate({ id: cartItem.id, quantity });
      }
    } else {
      setLocalItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  }, [isAuthenticated, serverCart, updateMutation, removeItem]);

  const clearCart = useCallback(() => {
    if (isAuthenticated) {
      clearMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success('Cart cleared');
        },
      });
    } else {
      setLocalItems([]);
      toast.success('Cart cleared');
    }
  }, [isAuthenticated, clearMutation]);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const isLoading = isAuthenticated && isLoadingServer;

  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoading,
  }), [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isLoading]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
