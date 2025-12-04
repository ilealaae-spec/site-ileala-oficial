import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { Loader2, Trash2, Plus, Minus, ShoppingBag, Tag, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import LazyImage from '@/components/LazyImage';

export default function SanityCart() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Fetch cart items from database
  const { data: cartItems = [], isLoading: cartLoading, refetch: refetchCart } = trpc.cart.items.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const removeItemMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      refetchCart();
      toast.success(language === 'en' ? 'Item removed from cart' : 'Item removido do carrinho');
    },
    onError: () => {
      toast.error(language === 'en' ? 'Failed to remove item' : 'Falha ao remover item');
    },
  });

  const updateQuantityMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      refetchCart();
    },
    onError: () => {
      toast.error(language === 'en' ? 'Failed to update quantity' : 'Falha ao atualizar quantidade');
    },
  });

  // Format price: database stores price in fils (1 AED = 100 fils)
  const formatPrice = (priceInFils: number) => {
    const priceInAED = priceInFils / 100;
    return `AED ${priceInAED.toFixed(2)}`;
  };

  const { data: profileValidation } = trpc.auth.validateProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Calculate totals from cart items
  const totalPrice = cartItems.reduce((sum, item) => {
    if (item.product) {
      return sum + (item.product.price * item.quantity);
    }
    return sum;
  }, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error(language === 'en' ? 'Please sign in to continue' : 'Por favor, faça login para continuar');
      setLocation('/login?redirect=/cart');
      return;
    }

    // Validate profile data before checkout
    if (profileValidation && !profileValidation.isValid) {
      const missingFields = profileValidation.missingFields;
      const fieldNames: Record<string, string> = {
        name: language === 'en' ? 'Full Name' : 'Nome Completo',
        phone: language === 'en' ? 'Phone Number' : 'Telefone',
        address: language === 'en' ? 'Address' : 'Endereço',
        city: language === 'en' ? 'City' : 'Cidade',
        state: language === 'en' ? 'State/Emirate' : 'Estado/Emirado',
        country: language === 'en' ? 'Country' : 'País',
      };
      
      const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join(', ');
      
      toast.error(
        language === 'en' 
          ? `Please complete your profile before checkout. Missing: ${missingFieldNames}` 
          : `Por favor, complete seu perfil antes de finalizar a compra. Faltando: ${missingFieldNames}`,
        { duration: 5000 }
      );
      
      setLocation('/profile');
      return;
    }

    // Redirect to checkout page
    setLocation('/checkout');
  };

  const calculateVAT = () => {
    return totalPrice * 0.05; // 5% VAT
  };

  const calculateGrandTotal = () => {
    const subtotal = totalPrice;
    const vat = calculateVAT();
    const discount = appliedCoupon?.discount || 0;
    return subtotal + vat - discount;
  };

  const validateCouponMutation = trpc.coupons.validate.useMutation({
    onSuccess: (data) => {
      if (data.valid) {
        setAppliedCoupon({ code: couponCode, discount: data.discount || 0 });
        setCouponError('');
        toast.success(language === 'en' ? 'Coupon applied!' : 'Cupom aplicado!');
      } else {
        setCouponError(data.message || (language === 'en' ? 'Invalid coupon' : 'Cupom inválido'));
        setAppliedCoupon(null);
      }
    },
    onError: (error) => {
      setCouponError(error.message || (language === 'en' ? 'Failed to validate coupon' : 'Falha ao validar cupom'));
      setAppliedCoupon(null);
    },
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(language === 'en' ? 'Please enter a coupon code' : 'Por favor, insira um código de cupom');
      return;
    }

    validateCouponMutation.mutate({
      code: couponCode,
      orderTotal: totalPrice, // Already in fils
    });
  };

  const handleRemoveItem = (itemId: number) => {
    removeItemMutation.mutate({ id: itemId });
  };

  const handleUpdateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantityMutation.mutate({ id: itemId, quantity });
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = cartItems;

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
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
            {items.map((item) => {
              if (!item.product) return null;
              const productName = language === 'pt' && item.product.namePT 
                ? item.product.namePT 
                : (language === 'en' && item.product.nameEN 
                  ? item.product.nameEN 
                  : item.product.name);
              
              return (
                <Card key={item.id} className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link href={`/shop/${item.product.slug}`}>
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted cursor-pointer">
                        {item.product.imageUrl ? (
                          <LazyImage
                            src={item.product.imageUrl}
                            alt={productName}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            {language === 'en' ? 'No image' : 'Sem imagem'}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link href={`/shop/${item.product.slug}`}>
                        <h3 className="font-semibold text-lg hover:text-primary cursor-pointer">
                          {productName}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-primary mt-2">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-2xl font-bold mb-6">
                {language === 'en' ? 'Order Summary' : 'Resumo do Pedido'}
              </h2>

              {/* Coupon Code Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-sage-700">
                      {language === 'en' ? 'Coupon Code' : 'Código de Cupom'}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={language === 'en' ? 'Enter coupon code' : 'Digite o código do cupom'}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || validateCouponMutation.isPending}
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Apply' : 'Aplicar'}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-sm text-red-600">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {language === 'en' ? 'Coupon Applied' : 'Cupom Aplicado'}
                        </p>
                        <p className="text-xs text-green-600">{appliedCoupon.code}</p>
                        <p className="text-sm font-semibold text-green-700 mt-1">
                          -{formatPrice(appliedCoupon.discount / 100)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-green-700 hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Subtotal' : 'Subtotal'}
                  </span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Discount' : 'Desconto'}
                    </span>
                    <span className="font-semibold">-{formatPrice(appliedCoupon.discount / 100)}</span>
                  </div>
                )}
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
                disabled={items.length === 0}
              >
                {language === 'en' ? 'Proceed to Checkout' : 'Finalizar Compra'}
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
