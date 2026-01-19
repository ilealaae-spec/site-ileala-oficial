import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Loader2, Lock, UserPlus, LogIn, Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Shipping Zones and Countries
const SHIPPING_ZONES = {
  uae: {
    name: 'United Arab Emirates',
    namePt: 'Emirados Árabes Unidos',
    deliveryTime: '1-3 days',
    deliveryTimePt: '1-3 dias',
    locations: [
      { id: 'dubai', name: 'Dubai', shippingCost: 0 },
      { id: 'abu-dhabi', name: 'Abu Dhabi', shippingCost: 50 },
      { id: 'sharjah', name: 'Sharjah', shippingCost: 50 },
      { id: 'ajman', name: 'Ajman', shippingCost: 50 },
      { id: 'umm-al-quwain', name: 'Umm Al Quwain', shippingCost: 50 },
      { id: 'ras-al-khaimah', name: 'Ras Al Khaimah', shippingCost: 50 },
      { id: 'fujairah', name: 'Fujairah', shippingCost: 50 },
    ],
  },
  gcc: {
    name: 'GCC Countries',
    namePt: 'Países do GCC',
    shippingCost: 100,
    deliveryTime: '3-5 days',
    deliveryTimePt: '3-5 dias',
    locations: [
      { id: 'saudi-arabia', name: 'Saudi Arabia' },
      { id: 'kuwait', name: 'Kuwait' },
      { id: 'bahrain', name: 'Bahrain' },
      { id: 'oman', name: 'Oman' },
      { id: 'qatar', name: 'Qatar' },
    ],
  },
  europe: {
    name: 'Europe',
    namePt: 'Europa',
    shippingCost: 200,
    deliveryTime: '5-10 days',
    deliveryTimePt: '5-10 dias',
    locations: [
      { id: 'uk', name: 'United Kingdom' },
      { id: 'france', name: 'France' },
      { id: 'germany', name: 'Germany' },
      { id: 'italy', name: 'Italy' },
      { id: 'spain', name: 'Spain' },
      { id: 'portugal', name: 'Portugal' },
      { id: 'netherlands', name: 'Netherlands' },
      { id: 'belgium', name: 'Belgium' },
      { id: 'switzerland', name: 'Switzerland' },
      { id: 'austria', name: 'Austria' },
      { id: 'sweden', name: 'Sweden' },
      { id: 'denmark', name: 'Denmark' },
      { id: 'norway', name: 'Norway' },
      { id: 'finland', name: 'Finland' },
      { id: 'ireland', name: 'Ireland' },
      { id: 'greece', name: 'Greece' },
      { id: 'poland', name: 'Poland' },
      { id: 'czech-republic', name: 'Czech Republic' },
      { id: 'europe-other', name: 'Other European Country' },
    ],
  },
  americas: {
    name: 'Americas',
    namePt: 'Américas',
    shippingCost: 250,
    deliveryTime: '7-14 days',
    deliveryTimePt: '7-14 dias',
    locations: [
      { id: 'usa', name: 'United States' },
      { id: 'canada', name: 'Canada' },
      { id: 'brazil', name: 'Brazil' },
      { id: 'mexico', name: 'Mexico' },
      { id: 'argentina', name: 'Argentina' },
      { id: 'chile', name: 'Chile' },
      { id: 'colombia', name: 'Colombia' },
      { id: 'americas-other', name: 'Other American Country' },
    ],
  },
  asia: {
    name: 'Asia & Pacific',
    namePt: 'Ásia e Pacífico',
    shippingCost: 200,
    deliveryTime: '5-10 days',
    deliveryTimePt: '5-10 dias',
    locations: [
      { id: 'india', name: 'India' },
      { id: 'pakistan', name: 'Pakistan' },
      { id: 'china', name: 'China' },
      { id: 'japan', name: 'Japan' },
      { id: 'south-korea', name: 'South Korea' },
      { id: 'singapore', name: 'Singapore' },
      { id: 'malaysia', name: 'Malaysia' },
      { id: 'thailand', name: 'Thailand' },
      { id: 'indonesia', name: 'Indonesia' },
      { id: 'philippines', name: 'Philippines' },
      { id: 'australia', name: 'Australia' },
      { id: 'new-zealand', name: 'New Zealand' },
      { id: 'asia-other', name: 'Other Asian Country' },
    ],
  },
  other: {
    name: 'Rest of World',
    namePt: 'Resto do Mundo',
    shippingCost: 300,
    deliveryTime: '10-15 days',
    deliveryTimePt: '10-15 dias',
    locations: [
      { id: 'other-country', name: 'Other Country' },
    ],
  },
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function Checkout() {
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // Detailed address fields
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [apartmentUnit, setApartmentUnit] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Handle using registered address
  const handleUseRegisteredAddress = (checked: boolean) => {
    setUseRegisteredAddress(checked);
    if (checked && user) {
      // Pre-fill with user's registered info if available
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      // Note: You may need to add address fields to user profile later
    }
  };

  // Get current zone data
  const getCurrentZone = () => {
    if (!selectedZone) return null;
    return SHIPPING_ZONES[selectedZone as keyof typeof SHIPPING_ZONES];
  };

  // Get shipping cost based on selected zone and location
  const getShippingCost = () => {
    if (!selectedZone || !selectedLocation) return 0;
    const zone = SHIPPING_ZONES[selectedZone as keyof typeof SHIPPING_ZONES];
    if (!zone) return 0;

    // For UAE, each location has its own shipping cost
    if (selectedZone === 'uae') {
      const location = zone.locations.find(l => l.id === selectedLocation);
      return (location as any)?.shippingCost ?? 50;
    }

    // For other zones, use the zone's shipping cost
    return zone.shippingCost || 0;
  };

  // Get delivery time
  const getDeliveryTime = () => {
    const zone = getCurrentZone();
    if (!zone) return '';
    return language === 'en' ? zone.deliveryTime : zone.deliveryTimePt;
  };

  // Handle zone change - reset location when zone changes
  const handleZoneChange = (zone: string) => {
    setSelectedZone(zone);
    setSelectedLocation('');
  };

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
    const shipping = getShippingCost();
    return subtotal - discount + shipping; // VAT already included, no need to add
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

    if (!selectedZone || !selectedLocation) {
      toast.error(language === 'en' ? 'Please select your delivery location' : 'Por favor, selecione seu local de entrega');
      return;
    }

    if (!streetAddress.trim()) {
      toast.error(language === 'en' ? 'Please enter your street address' : 'Por favor, insira seu endereço');
      return;
    }

    if (!city.trim()) {
      toast.error(language === 'en' ? 'Please enter your city' : 'Por favor, insira sua cidade');
      return;
    }

    const items = cartItems
      .filter(item => item.product)
      .map(item => ({
        productId: item.product!.id,
        quantity: item.quantity,
        price: item.product!.price,
      }));

    // Build full address with all fields
    const zone = SHIPPING_ZONES[selectedZone as keyof typeof SHIPPING_ZONES];
    const location = zone?.locations.find(l => l.id === selectedLocation);
    const addressParts = [
      streetAddress,
      buildingName && `Building: ${buildingName}`,
      apartmentUnit && `Apt/Unit: ${apartmentUnit}`,
      city,
      postalCode && `Postal Code: ${postalCode}`,
      location?.name,
    ].filter(Boolean);
    const fullAddress = addressParts.join('\n');

    createOrderMutation.mutate({
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: fullAddress,
      couponCode: appliedCoupon?.code,
      shippingCost: getShippingCost(),
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
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">
                    {language === 'en' ? 'Shipping Destination' : 'Destino de Entrega'}
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Region/Zone Selector */}
                  <div>
                    <Label htmlFor="zone">
                      {language === 'en' ? 'Region' : 'Região'} *
                    </Label>
                    <Select value={selectedZone} onValueChange={handleZoneChange}>
                      <SelectTrigger id="zone" className="w-full">
                        <SelectValue placeholder={language === 'en' ? 'Select your region' : 'Selecione sua região'} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SHIPPING_ZONES).map(([key, zone]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center justify-between w-full">
                              <span>{language === 'en' ? zone.name : zone.namePt}</span>
                              {key === 'uae' ? (
                                <span className="ml-2 text-xs text-green-600 font-semibold">
                                  {language === 'en' ? 'From FREE' : 'A partir de GRÁTIS'}
                                </span>
                              ) : (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {zone.shippingCost} AED
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Country/Location Selector */}
                  {selectedZone && (
                    <div>
                      <Label htmlFor="location">
                        {selectedZone === 'uae'
                          ? (language === 'en' ? 'Emirate' : 'Emirado')
                          : (language === 'en' ? 'Country' : 'País')} *
                      </Label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger id="location" className="w-full">
                          <SelectValue placeholder={
                            selectedZone === 'uae'
                              ? (language === 'en' ? 'Select your emirate' : 'Selecione seu emirado')
                              : (language === 'en' ? 'Select your country' : 'Selecione seu país')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {getCurrentZone()?.locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{location.name}</span>
                                {selectedZone === 'uae' && (
                                  (location as any).shippingCost === 0 ? (
                                    <span className="ml-2 text-xs text-green-600 font-semibold">
                                      {language === 'en' ? 'FREE' : 'GRÁTIS'}
                                    </span>
                                  ) : (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      +{(location as any).shippingCost} AED
                                    </span>
                                  )
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Shipping Cost Info */}
                  {selectedZone && selectedLocation && (
                    <div className={`flex items-center gap-3 p-4 rounded-lg ${getShippingCost() === 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <Truck className={`w-5 h-5 ${getShippingCost() === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                      <div>
                        {getShippingCost() === 0 ? (
                          <>
                            <p className="text-sm font-semibold text-green-800">
                              {language === 'en' ? '🎉 Free Delivery to Dubai!' : '🎉 Entrega Grátis para Dubai!'}
                            </p>
                            <p className="text-xs text-green-600">
                              {language === 'en' ? `Estimated delivery: ${getDeliveryTime()}` : `Entrega estimada: ${getDeliveryTime()}`}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-blue-800">
                              {language === 'en'
                                ? `Shipping: ${getShippingCost()} AED`
                                : `Frete: ${getShippingCost()} AED`}
                            </p>
                            <p className="text-xs text-blue-600">
                              {language === 'en' ? `Estimated delivery: ${getDeliveryTime()}` : `Entrega estimada: ${getDeliveryTime()}`}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Delivery Address Card */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="text-2xl font-semibold">
                    {language === 'en' ? 'Delivery Address' : 'Endereço de Entrega'}
                  </h2>
                </div>

                {/* Use Registered Address Checkbox */}
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-3 mb-6 p-4 bg-muted/50 rounded-lg">
                    <Checkbox
                      id="useRegisteredAddress"
                      checked={useRegisteredAddress}
                      onCheckedChange={handleUseRegisteredAddress}
                    />
                    <Label htmlFor="useRegisteredAddress" className="cursor-pointer text-sm">
                      {language === 'en'
                        ? 'Use my registered account information'
                        : 'Usar informações da minha conta'}
                    </Label>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <Label htmlFor="streetAddress">
                      {language === 'en' ? 'Street Address' : 'Endereço'} *
                    </Label>
                    <Input
                      id="streetAddress"
                      required
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder={language === 'en'
                        ? 'Street name and number'
                        : 'Nome e número da rua'}
                    />
                  </div>

                  {/* Building Name and Apartment/Unit in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buildingName">
                        {language === 'en' ? 'Building Name' : 'Nome do Prédio'}
                      </Label>
                      <Input
                        id="buildingName"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        placeholder={language === 'en'
                          ? 'Building or tower name (optional)'
                          : 'Nome do prédio ou torre (opcional)'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="apartmentUnit">
                        {language === 'en' ? 'Apartment / Villa / Unit' : 'Apartamento / Villa / Unidade'}
                      </Label>
                      <Input
                        id="apartmentUnit"
                        value={apartmentUnit}
                        onChange={(e) => setApartmentUnit(e.target.value)}
                        placeholder={language === 'en'
                          ? 'Apt, Villa or Unit number (optional)'
                          : 'Nº do apt, villa ou unidade (opcional)'}
                      />
                    </div>
                  </div>

                  {/* City and Postal Code in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">
                        {language === 'en' ? 'City' : 'Cidade'} *
                      </Label>
                      <Input
                        id="city"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={language === 'en'
                          ? 'City name'
                          : 'Nome da cidade'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">
                        {language === 'en' ? 'Postal Code / ZIP' : 'CEP / Código Postal'}
                      </Label>
                      <Input
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder={language === 'en'
                          ? 'Postal code (optional)'
                          : 'Código postal (opcional)'}
                      />
                    </div>
                  </div>
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
                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === 'en' ? 'Subtotal' : 'Subtotal'}
                    </span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>

                  {/* Discount */}
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span className="font-medium">
                        {language === 'en' ? 'Discount' : 'Desconto'}
                      </span>
                      <span className="font-semibold">-{formatPrice(appliedCoupon.discount)}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      {language === 'en' ? 'Shipping' : 'Entrega'}
                    </span>
                    {selectedZone && selectedLocation ? (
                      getShippingCost() === 0 ? (
                        <span className="text-green-600 font-semibold">
                          {language === 'en' ? 'FREE' : 'GRÁTIS'}
                        </span>
                      ) : (
                        <span>{formatPrice(getShippingCost())}</span>
                      )
                    ) : (
                      <span className="text-muted-foreground italic text-xs">
                        {language === 'en' ? 'Select destination' : 'Selecione destino'}
                      </span>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-lg pt-2 border-t">
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
