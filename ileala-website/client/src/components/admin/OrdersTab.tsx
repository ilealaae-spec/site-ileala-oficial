import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Loader2, Search, Package, Calendar, DollarSign, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function OrdersTab() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const ordersQuery = trpc.orders.list.useQuery();
  const orders = ordersQuery.data as any[] | undefined;
  const isLoading = ordersQuery.isLoading;

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Order status updated!' : 'Status do pedido atualizado!');
      utils.orders.list.invalidate();
      setEditingStatus(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const filteredOrders = Array.isArray(orders) ? orders.filter((order: any) =>
    order.id.toString().includes(searchTerm) ||
    (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)} AED`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'pending').length : 0,
    completed: Array.isArray(orders) ? orders.filter((o: any) => o.status === 'completed').length : 0,
    totalRevenue: Array.isArray(orders) ? orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Total Orders' : 'Total de Pedidos'}
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Package className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Pending' : 'Pendentes'}
              </p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Completed' : 'Concluídos'}
              </p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'en' ? 'Revenue' : 'Receita'}
              </p>
              <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={language === 'en' ? 'Search by order ID or email...' : 'Buscar por ID do pedido ou email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {order.customerEmail || order.customerName || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                    {order.shippingAddress && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {order.shippingAddress}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'en' ? 'Total' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount || 0)}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(order)}
                  >
                    {language === 'en' ? 'Details' : 'Detalhes'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {language === 'en' ? 'No orders found' : 'Nenhum pedido encontrado'}
              </p>
              <p className="text-sm">
                {searchTerm 
                  ? (language === 'en' ? 'Try a different search term' : 'Tente outro termo de busca')
                  : (language === 'en' ? 'Orders will appear here' : 'Os pedidos aparecerão aqui')
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Order Details' : 'Detalhes do Pedido'} #{selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Customer Information' : 'Informações do Cliente'}
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {selectedOrder.customerEmail || 'N/A'}</p>
                  {selectedOrder.shippingAddress && (
                    <p><span className="font-medium">{language === 'en' ? 'Address' : 'Endereço'}:</span> {selectedOrder.shippingAddress}</p>
                  )}
                  {selectedOrder.phone && (
                    <p><span className="font-medium">{language === 'en' ? 'Phone' : 'Telefone'}:</span> {selectedOrder.phone}</p>
                  )}
                </div>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="font-semibold mb-3">
                  {language === 'en' ? 'Order Information' : 'Informações do Pedido'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Select
                      value={editingStatus || selectedOrder.status}
                      onValueChange={setEditingStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {editingStatus && editingStatus !== selectedOrder.status && (
                      <Button
                        size="sm"
                        onClick={() => {
                          updateStatusMutation.mutate({
                            orderId: selectedOrder.id,
                            status: editingStatus as 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled',
                          });
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          language === 'en' ? 'Save' : 'Salvar'
                        )}
                      </Button>
                    )}
                  </div>
                  <p><span className="font-medium">{language === 'en' ? 'Date' : 'Data'}:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Total:</span> <span className="text-lg font-bold text-primary">{formatPrice(selectedOrder.totalAmount || 0)}</span></p>
                </div>
              </div>

              {/* Payment Info */}
              {selectedOrder.stripeSessionId && (
                <div>
                  <h3 className="font-semibold mb-3">
                    {language === 'en' ? 'Payment Information' : 'Informações de Pagamento'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Stripe Session ID:</span> {selectedOrder.stripeSessionId}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
