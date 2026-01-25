import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, CreditCard, MapPin, Loader2, ShoppingBag, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Orders() {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login?redirect=/orders');
    }
  }, [isAuthenticated, setLocation]);

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cancelMutation = trpc.orders.cancel.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Order cancelled successfully' : 'Pedido cancelado com sucesso');
      utils.orders.myOrders.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const retryPaymentMutation = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(language === 'en' ? 'Failed to resume payment' : 'Falha ao retomar pagamento');
      console.error(error);
    },
  });

  // Separate orders into pending and completed
  const pendingOrders = orders?.filter((o: any) => o.paymentStatus === 'pending' && o.status !== 'cancelled') || [];
  const completedOrders = orders?.filter((o: any) => o.paymentStatus !== 'pending' || o.status === 'cancelled') || [];

  const handleCancelOrder = (orderId: number, orderNumber: number) => {
    if (window.confirm(
      language === 'en'
        ? `Are you sure you want to cancel order #${orderNumber}?`
        : `Tem certeza que deseja cancelar o pedido #${orderNumber}?`
    )) {
      cancelMutation.mutate({ orderId });
    }
  };

  const handleRetryPayment = (orderId: number) => {
    retryPaymentMutation.mutate({ orderId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; pt: string }> = {
      pending: { en: 'Pending', pt: 'Pendente' },
      processing: { en: 'Processing', pt: 'Processando' },
      shipped: { en: 'Shipped', pt: 'Enviado' },
      delivered: { en: 'Delivered', pt: 'Entregue' },
      cancelled: { en: 'Cancelled', pt: 'Cancelado' },
    };
    return language === 'en' ? statusMap[status]?.en : statusMap[status]?.pt;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: Record<string, { en: string; pt: string }> = {
      pending: { en: 'Pending', pt: 'Pendente' },
      paid: { en: 'Paid', pt: 'Pago' },
      failed: { en: 'Failed', pt: 'Falhou' },
      refunded: { en: 'Refunded', pt: 'Reembolsado' },
    };
    return language === 'en' ? statusMap[status]?.en : statusMap[status]?.pt;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    // Price is stored directly in AED (not fils)
    return `AED ${price.toFixed(2)}`;
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display text-sage-900 mb-2">
            {language === 'en' ? 'My Orders' : 'Meus Pedidos'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'View and track your order history' 
              : 'Visualize e acompanhe seu histórico de pedidos'}
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-sage-300 mb-4" />
            <h2 className="text-xl font-semibold text-sage-900 mb-2">
              {language === 'en' ? 'No orders yet' : 'Nenhum pedido ainda'}
            </h2>
            <p className="text-sage-600 mb-6">
              {language === 'en'
                ? 'Start shopping to see your orders here!'
                : 'Comece a comprar para ver seus pedidos aqui!'}
            </p>
            <a
              href="/shop"
              className="inline-block bg-sage-600 hover:bg-sage-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {language === 'en' ? 'Start Shopping' : 'Começar a Comprar'}
            </a>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-xl font-semibold text-sage-900">
                    {language === 'en' ? 'Pending Payment' : 'Pagamento Pendente'}
                  </h2>
                  <Badge className="bg-yellow-100 text-yellow-800">{pendingOrders.length}</Badge>
                </div>
                <div className="space-y-4">
                  {pendingOrders.map((order: any) => (
                    <Card key={order.id} className="p-6 border-yellow-200 bg-yellow-50/30">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className="p-3 bg-yellow-100 rounded-lg">
                            <Package className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-sage-900">
                              {language === 'en' ? 'Order' : 'Pedido'} #{order.id}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-sage-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {language === 'en' ? 'Awaiting Payment' : 'Aguardando Pagamento'}
                          </Badge>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-yellow-200 pt-4 mt-4">
                          <h4 className="font-semibold text-sage-900 mb-3">
                            {language === 'en' ? 'Items' : 'Itens'}
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="text-sage-900">{item.product?.name || 'Product'}</span>
                                  <span className="text-sage-600 ml-2">x{item.quantity}</span>
                                </div>
                                <span className="text-sage-900 font-medium">
                                  {formatPrice(item.priceAtPurchase * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-yellow-200 pt-4 mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div>
                          <span className="text-lg font-semibold text-sage-900">
                            {language === 'en' ? 'Total:' : 'Total:'}
                          </span>
                          <span className="text-2xl font-bold text-sage-900 ml-2">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelOrder(order.id, order.id)}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Cancel' : 'Cancelar'}
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-sage-600 hover:bg-sage-700"
                            onClick={() => handleRetryPayment(order.id)}
                            disabled={retryPaymentMutation.isPending}
                          >
                            {retryPaymentMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                {language === 'en' ? 'Complete Payment' : 'Concluir Pagamento'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed/Other Orders Section */}
            {completedOrders.length > 0 && (
              <div>
                {pendingOrders.length > 0 && (
                  <h2 className="text-xl font-semibold text-sage-900 mb-4">
                    {language === 'en' ? 'Order History' : 'Histórico de Pedidos'}
                  </h2>
                )}
                <div className="space-y-4">
                  {completedOrders.map((order: any) => (
                    <Card key={order.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className="p-3 bg-sage-100 rounded-lg">
                            <Package className="w-6 h-6 text-sage-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-sage-900">
                              {language === 'en' ? 'Order' : 'Pedido'} #{order.id}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-sage-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {getPaymentStatusText(order.paymentStatus)}
                          </Badge>
                        </div>
                      </div>

                      {order.shippingAddress && (
                        <div className="flex items-start gap-2 text-sm text-sage-600 mb-4 p-3 bg-sage-50 rounded-lg">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-sage-900">{order.customerName}</p>
                            <p>{order.shippingAddress}</p>
                            {order.customerPhone && <p>{order.customerPhone}</p>}
                          </div>
                        </div>
                      )}

                      {order.items && order.items.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-semibold text-sage-900 mb-3">
                            {language === 'en' ? 'Items' : 'Itens'}
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="text-sage-900">{item.product?.name || 'Product'}</span>
                                  <span className="text-sage-600 ml-2">x{item.quantity}</span>
                                </div>
                                <span className="text-sage-900 font-medium">
                                  {formatPrice(item.priceAtPurchase * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4 mt-4 flex justify-between items-center">
                        <span className="text-lg font-semibold text-sage-900">
                          {language === 'en' ? 'Total' : 'Total'}
                        </span>
                        <span className="text-2xl font-bold text-sage-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>

                      {order.couponCode && (
                        <div className="mt-2 text-sm text-sage-600">
                          {language === 'en' ? 'Coupon applied' : 'Cupom aplicado'}: <span className="font-semibold">{order.couponCode}</span>
                          {order.discountAmount > 0 && (
                            <span className="text-green-600 ml-2">
                              -{formatPrice(order.discountAmount)}
                            </span>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
