import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Loader2, Lock, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  const { data: cartItems, isLoading } = trpc.cart.items.useQuery();
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: async (data) => {
      // Create Stripe checkout session
      try {
        const session = await createCheckoutMutation.mutateAsync({ orderId: data.orderId });
        if (session.url) {
          // Redirect to Stripe checkout
          window.location.href = session.url;
        }
      } catch (error) {
        console.error('Stripe error:', error);
        toast.error(language === 'en' ? 'Payment setup failed' : 'Falha ao configurar pagamento');
        // Still show order confirmation even if Stripe fails
        setLocation(`/order-confirmation/${data.orderId}`);
      }
    },
    onError: (error) => {
      toast.error(language === 'en' ? 'Failed to place order' : 'Falha ao realizar pedido');
      console.error(error);
    },
  });

  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();

  const formatPrice = (price: number) => {
    // Price is stored directly in AED (not fils)
    return `${price.toFixed(2)} AED`;
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      if (item.product) {
        return sum + (item.product.price * item.quantity);
      }
      return sum;
    }, 0);
  };

  // VAT is already included in the price (5%)
  // To show the VAT amount from an inclusive price: VAT = price * 5 / 105
  const calculateIncludedVAT = () => {
    const total = calculateTotal();
    return total * 5 / 105;
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateTotal();
    const discount = appliedCoupon?.discount || 0;
    return subtotal - discount; // VAT already included, no need to add
  };

  const validateCouponMutation = trpc.coupons.validate.useMutation();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(language === 'en' ? 'Please enter a coupon code' : 'Por favor, insira um código de cupom');
      return;
    }

    try {
      const result = await validateCouponMutation.mutateAsync({
        code: couponCode,
        orderTotal: calculateTotal(),
      });
      if (result.valid) {
        setAppliedCoupon({ code: couponCode, discount: result.discount || 0 });
        setCouponError('');
        toast.success(language === 'en' ? 'Coupon applied!' : 'Cupom aplicado!');
      } else {
        setCouponError(result.message || (language === 'en' ? 'Invalid coupon' : 'Cupom inválido'));
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(language === 'en' ? 'Failed to validate coupon' : 'Falha ao validar cupom');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartItems || cartItems.length === 0) {
      toast.error(language === 'en' ? 'Cart is empty' : 'Carrinho vazio');
      return;
    }

    const items = cartItems
      .filter(item => item.product)
      .map(item => ({
        productId: item.product!.id,
        quantity: item.quantity,
        price: item.product!.price,
      }));

    createOrderMutation.mutate({
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      couponCode: appliedCoupon?.code,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    setLocation('/cart');
    return null;
  }

  // Verificar autenticação - login obrigatório para checkout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display text-sage-900 mb-3">
            {language === 'en' ? 'Account Required' : 'Conta Necessária'}
          </h1>
          <p className="text-sage-600 mb-6">
            {language === 'en'
              ? 'To complete your purchase, please sign in to your account or create a new one. This helps us track your order and provide better support.'
              : 'Para finalizar sua compra, por favor entre na sua conta ou crie uma nova. Isso nos ajuda a rastrear seu pedido e oferecer melhor suporte.'}
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/login?redirect=/checkout')}
              className="w-full"
              style={{ backgroundColor: '#4A7C59', color: '#ffffff' }}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Sign In' : 'Entrar'}
            </Button>
            <Button
              onClick={() => setLocation('/register?redirect=/checkout')}
              variant="outline"
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Create Account' : 'Criar Conta'}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-sage-500">
              {language === 'en'
                ? 'Your cart items will be saved while you sign in.'
                : 'Os itens do seu carrinho serão salvos enquanto você faz login.'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8">
          {language === 'en' ? 'Checkout' : 'Finalizar Compra'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {language === 'en' ? 'Contact Information' : 'Informações de Contato'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">
                      {language === 'en' ? 'Full Name' : 'Nome Completo'} *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={language === 'en' ? 'John Doe' : 'João Silva'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">
                      {language === 'en' ? 'Email' : 'E-mail'} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder={language === 'en' ? 'john@example.com' : 'joao@exemplo.com'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      {language === 'en' ? 'Phone' : 'Telefone'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {language === 'en' ? 'Shipping Address' : 'Endereço de Entrega'}
                </h2>
                
                <div>
                  <Label htmlFor="address">
                    {language === 'en' ? 'Full Address' : 'Endereço Completo'} *
                  </Label>
                  <Textarea
                    id="address"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={language === 'en' 
                      ? 'Street address, apartment/unit, city, emirate, postal code' 
                      : 'Rua, apartamento/unidade, cidade, emirado, código postal'}
                    rows={4}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {language === 'en' ? 'Payment Method' : 'Método de Pagamento'}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary">
                        {language === 'en' ? 'Secure Payment with Stripe' : 'Pagamento Seguro com Stripe'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' 
                          ? 'Credit/Debit Card, Apple Pay, Google Pay' 
                          : 'Cartão de Crédito/Débito, Apple Pay, Google Pay'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">
                        {language === 'en' ? '🔒 How it works:' : '🔒 Como funciona:'}
                      </span>
                      <br />
                      {language === 'en' 
                        ? 'After clicking "Place Order", you will be redirected to Stripe\'s secure payment page to complete your purchase.' 
                        : 'Após clicar em "Finalizar Pedido", você será redirecionado para a página segura de pagamento do Stripe para concluir sua compra.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6">
                  {language === 'en' ? 'Order Summary' : 'Resumo do Pedido'}
                </h2>

                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => {
                    if (!item.product) return null;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {language === 'en' ? item.product.nameEN : item.product.namePT} x {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Section */}
                <div className="border-t pt-4 mb-6">
                  <h3 className="text-sm font-semibold mb-3">
                    {language === 'en' ? 'Have a coupon?' : 'Tem um cupom?'}
                  </h3>
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder={language === 'en' ? 'Enter coupon code' : 'Digite o código do cupom'}
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={validateCouponMutation.isPending}
                        >
                          {validateCouponMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            language === 'en' ? 'Apply' : 'Aplicar'
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-sm text-red-600">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600">
                            {language === 'en' ? 'Discount applied' : 'Desconto aplicado'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700"
                        >
                          {language === 'en' ? 'Remove' : 'Remover'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 border-t pt-4 mb-6">
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">
                        {language === 'en' ? 'Discount' : 'Desconto'}
                      </span>
                      <span className="font-semibold">-{formatPrice(appliedCoupon.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">
                      {language === 'en' ? 'Total' : 'Total'}
                    </span>
                    <span className="font-bold text-primary text-xl">
                      {formatPrice(calculateGrandTotal())}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {language === 'en'
                      ? `(Includes VAT 5%: ${formatPrice(calculateIncludedVAT())})`
                      : `(Inclui IVA 5%: ${formatPrice(calculateIncludedVAT())})`}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === 'en' ? 'Processing...' : 'Processando...'}
                    </>
                  ) : (
                    <>
                      {language === 'en' ? 'Proceed to Payment' : 'Fazer Pedido'}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
