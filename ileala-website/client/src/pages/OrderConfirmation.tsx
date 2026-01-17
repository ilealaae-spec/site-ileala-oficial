import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useRoute, Link } from 'wouter';
import { Loader2, CheckCircle } from 'lucide-react';

export default function OrderConfirmation() {
  const { language } = useLanguage();
  const [, params] = useRoute('/order-confirmation/:id');
  const orderId = params?.id ? parseInt(params.id) : 0;

  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: orderId });

  const formatPrice = (price: number) => {
    // Price is stored directly in AED (not fils)
    return `${price.toFixed(2)} AED`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Order not found' : 'Pedido não encontrado'}
          </h2>
          <Link href="/shop">
            <Button>
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
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Order Confirmed!' : 'Pedido Confirmado!'}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {language === 'en' 
                ? `Your order #${order.id} has been received` 
                : `Seu pedido #${order.id} foi recebido`}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'We will contact you shortly with payment details and delivery information.' 
                : 'Entraremos em contato em breve com os detalhes de pagamento e informações de entrega.'}
            </p>
          </Card>

          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">
              {language === 'en' ? 'Order Details' : 'Detalhes do Pedido'}
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Order Number' : 'Número do Pedido'}
                </span>
                <span className="font-semibold">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Date' : 'Data'}
                </span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Status' : 'Status'}
                </span>
                <span className="font-semibold capitalize">{order.status}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <h3 className="font-semibold mb-4">
                {language === 'en' ? 'Items' : 'Itens'}
              </h3>
              <div className="space-y-3">
                {order.items?.map((item) => {
                  if (!item.product) return null;
                  return (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {language === 'en' ? item.product.nameEN : item.product.namePT} x {item.quantity}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(item.priceAtPurchase * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{language === 'en' ? 'Total' : 'Total'}</span>
                <span className="text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'en' ? 'Shipping Address' : 'Endereço de Entrega'}
            </h2>
            <p className="whitespace-pre-line">{order.shippingAddress}</p>
          </Card>

          <div className="flex gap-4">
            <Link href="/shop" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                {language === 'en' ? 'Continue Shopping' : 'Continuar Comprando'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
