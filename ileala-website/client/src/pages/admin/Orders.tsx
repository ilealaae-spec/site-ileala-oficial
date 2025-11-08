import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminOrders() {
  const { language } = useLanguage();
  const { data: orders, isLoading, refetch } = trpc.admin.orders.list.useQuery();
  
  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Order status updated!' : 'Status do pedido atualizado!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)} AED`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const translations: Record<string, { en: string; pt: string }> = {
      pending: { en: 'Pending', pt: 'Pendente' },
      processing: { en: 'Processing', pt: 'Processando' },
      shipped: { en: 'Shipped', pt: 'Enviado' },
      delivered: { en: 'Delivered', pt: 'Entregue' },
      cancelled: { en: 'Cancelled', pt: 'Cancelado' },
      paid: { en: 'Paid', pt: 'Pago' },
      failed: { en: 'Failed', pt: 'Falhou' },
      refunded: { en: 'Refunded', pt: 'Reembolsado' },
    };
    return language === 'en' ? translations[status]?.en || status : translations[status]?.pt || status;
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as any,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">
        {language === 'en' ? 'Manage Orders' : 'Gerenciar Pedidos'}
      </h1>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Order ID' : 'ID do Pedido'}
                </p>
                <p className="font-semibold">#{order.id}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Date' : 'Data'}
                </p>
                <p className="font-semibold">{formatDate(order.createdAt)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total' : 'Total'}
                </p>
                <p className="font-semibold text-primary">{formatPrice(order.totalAmount)}</p>
                {order.discountAmount > 0 && (
                  <p className="text-sm text-green-600">
                    {language === 'en' ? 'Discount' : 'Desconto'}: -{formatPrice(order.discountAmount)}
                  </p>
                )}
                {order.couponCode && (
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Coupon' : 'Cupom'}: {order.couponCode}
                  </p>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {language === 'en' ? 'Status' : 'Status'}
                </p>
                <Select
                  value={order.status}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className={`w-full ${getStatusColor(order.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{translateStatus('pending')}</SelectItem>
                    <SelectItem value="processing">{translateStatus('processing')}</SelectItem>
                    <SelectItem value="shipped">{translateStatus('shipped')}</SelectItem>
                    <SelectItem value="delivered">{translateStatus('delivered')}</SelectItem>
                    <SelectItem value="cancelled">{translateStatus('cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold mb-2">
                    {language === 'en' ? 'Customer Information' : 'Informações do Cliente'}
                  </p>
                  <p className="text-sm"><strong>{language === 'en' ? 'Name' : 'Nome'}:</strong> {order.customerName}</p>
                  <p className="text-sm"><strong>Email:</strong> {order.customerEmail}</p>
                  {order.customerPhone && (
                    <p className="text-sm"><strong>{language === 'en' ? 'Phone' : 'Telefone'}:</strong> {order.customerPhone}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-semibold mb-2">
                    {language === 'en' ? 'Shipping Address' : 'Endereço de Entrega'}
                  </p>
                  <p className="text-sm whitespace-pre-line">{order.shippingAddress}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">
                  {language === 'en' ? 'Payment Status' : 'Status do Pagamento'}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {translateStatus(order.paymentStatus)}
                </span>
              </div>

              {order.notes && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">
                    {language === 'en' ? 'Notes' : 'Observações'}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}

        {orders?.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {language === 'en' ? 'No orders yet' : 'Nenhum pedido ainda'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
