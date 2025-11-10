import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link, useLocation } from 'wouter';
import { Loader2, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function SanityCart() {
  const { language } = useLanguage();
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const createCartCheckoutMutation = trpc.payment.createSanityCartCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        // Clear cart after successful checkout creation
        clearCart();
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(language === 'en' ? 'Failed to create checkout session' : 'Falha ao criar sessão de checkout');
      console.error('Checkout error:', error);
    },
  });

  const formatPrice = (price: number) => {
    return `AED ${price.toFixed(2)}`;
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error(language === 'en' ? 'Please sign in to continue' : 'Por favor, faça login para continuar');
      setLocation('/login?redirect=/cart');
      return;
    }

    const checkoutItems = items.map(item => ({
      productId: item.id,
      productName: item.name,
      productPrice: item.price,
      productImage: item.image,
      quantity: item.quantity,
    }));

    createCartCheckoutMutation.mutate({ items: checkoutItems });
  };

  const calculateVAT = () => {
    return totalPrice * 0.05; // 5% VAT
  };

  const calculateGrandTotal = () => {
    return totalPrice + calculateVAT();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Your cart is empty' : 'Seu carrinho está vazio'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'en' 
              ? 'Add some products to get started' 
              : 'Adicione alguns produtos para começar'}
          </p>
          <Link href="/shop">
            <Button size="lg">
              {language === 'en' ? 'Continue Shopping' : 'Continuar Comprando'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">
          {language === 'en' ? 'Shopping Cart' : 'Carrinho de Compras'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link href={`/sanity-products/${item.slug}`}>
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link href={`/sanity-products/${item.slug}`}>
                      <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-primary mt-2">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'en' ? 'Order Summary' : 'Resumo do Pedido'}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Subtotal' : 'Subtotal'}
                  </span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'VAT (5%)' : 'IVA (5%)'}
                  </span>
                  <span className="font-semibold">{formatPrice(calculateVAT())}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">
                      {language === 'en' ? 'Total' : 'Total'}
                    </span>
                    <span className="font-bold text-primary text-xl">
                      {formatPrice(calculateGrandTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full mb-4"
                onClick={handleCheckout}
                disabled={createCartCheckoutMutation.isLoading}
              >
                {createCartCheckoutMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'en' ? 'Processing...' : 'Processando...'}
                  </>
                ) : (
                  language === 'en' ? 'Proceed to Checkout' : 'Finalizar Compra'
                )}
              </Button>

              <Link href="/shop">
                <Button variant="outline" size="lg" className="w-full">
                  {language === 'en' ? 'Continue Shopping' : 'Continuar Comprando'}
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
