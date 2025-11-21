import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Users, Package, ShoppingCart, Mail, TrendingUp, DollarSign } from 'lucide-react';

export default function DashboardTab() {
  const { language } = useLanguage();

  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.admin.orders.list.useQuery();
  const { data: newsletterStats, isLoading: newsletterLoading } = trpc.newsletter.stats.useQuery();

  const isLoading = productsLoading || ordersLoading || newsletterLoading;

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: language === 'en' ? 'Total Revenue' : 'Receita Total',
      value: `${(totalRevenue / 100).toFixed(2)} AED`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: language === 'en' ? 'Total Orders' : 'Total de Pedidos',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: language === 'en' ? 'Pending Orders' : 'Pedidos Pendentes',
      value: pendingOrders.toString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: language === 'en' ? 'Products' : 'Produtos',
      value: totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: language === 'en' ? 'Newsletter Subscribers' : 'Inscritos Newsletter',
      value: newsletterStats?.active.toString() || '0',
      icon: Mail,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-sage-900 mb-2">
          {language === 'en' ? 'Overview' : 'Visão Geral'}
        </h2>
        <p className="text-sage-600">
          {language === 'en' 
            ? 'Quick overview of your store performance' 
            : 'Visão rápida do desempenho da sua loja'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {language === 'en' ? 'Recent Orders' : 'Pedidos Recentes'}
          </h3>
          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center pb-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(order.total / 100).toFixed(2)} AED</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {language === 'en' ? 'No orders yet' : 'Nenhum pedido ainda'}
            </p>
          )}
        </Card>

        {/* Low Stock Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {language === 'en' ? 'Low Stock Alert' : 'Alerta de Estoque Baixo'}
          </h3>
          {products && products.length > 0 ? (
            <div className="space-y-3">
              {products
                .filter(p => p.stock < 10)
                .slice(0, 5)
                .map((product) => (
                  <div key={product.id} className="flex justify-between items-center pb-3 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.nameEN}</p>
                      <p className="text-sm text-muted-foreground">{product.namePT}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className={`text-sm font-semibold px-2 py-1 rounded ${
                        product.stock === 0 ? 'bg-red-100 text-red-700' :
                        product.stock < 5 ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {product.stock} {language === 'en' ? 'left' : 'restantes'}
                      </span>
                    </div>
                  </div>
                ))}
              {products.filter(p => p.stock < 10).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'en' ? 'All products in stock!' : 'Todos os produtos em estoque!'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {language === 'en' ? 'No products' : 'Nenhum produto'}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
