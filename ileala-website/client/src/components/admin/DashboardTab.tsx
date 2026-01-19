import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Package, ShoppingCart, Mail, TrendingUp, DollarSign, Users, Eye } from 'lucide-react';

// Custom Chart Components (no external dependencies)
function LineChart({ data, color = '#255238' }: { data: number[], color?: string }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 100;
  const height = 60;
  const padding = 5;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

function BarChart({ data, labels, color = '#255238' }: { data: number[], labels: string[], color?: string }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data, 1);
  const width = 100;
  const height = 120;
  const barWidth = (width - 20) / data.length - 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {data.map((value, index) => {
        const barHeight = (value / max) * (height - 30);
        const x = 10 + index * ((width - 20) / data.length) + 2;
        const y = height - 20 - barHeight;

        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="url(#barGradient)"
              rx="2"
            />
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              className="text-[6px] fill-gray-500"
            >
              {labels[index]}
            </text>
            {value > 0 && (
              <text
                x={x + barWidth / 2}
                y={y - 3}
                textAnchor="middle"
                className="text-[5px] fill-gray-700 font-semibold"
              >
                {value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ value, max, label, color = '#255238' }: { value: number, max: number, label: string, color?: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000 ease-out"
        />
        <text x="50" y="45" textAnchor="middle" className="text-xl font-bold fill-gray-800">
          {value}
        </text>
        <text x="50" y="60" textAnchor="middle" className="text-[8px] fill-gray-500">
          {label}
        </text>
      </svg>
    </div>
  );
}

function MiniSparkline({ data, color = '#255238' }: { data: number[], color?: string }) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-16 h-5">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardTab() {
  const { language } = useLanguage();

  const productsQuery = trpc.products.list.useQuery();
  const ordersQuery = trpc.orders.list.useQuery();
  const { data: newsletterStats, isLoading: newsletterLoading } = trpc.newsletter.stats.useQuery();

  const products = productsQuery.data as any[] | undefined;
  const orders = ordersQuery.data as any[] | undefined;
  const isLoading = productsQuery.isLoading || ordersQuery.isLoading || newsletterLoading;

  // Calculate stats
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) : 0;
  const pendingOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'pending').length : 0;
  const completedOrders = Array.isArray(orders) ? orders.filter((order: any) => order.status === 'completed').length : 0;

  // Calculate daily data for charts
  const getDailyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const salesByDay = last7Days.map(day => {
      if (!orders) return 0;
      const dayOrders = orders.filter((o: any) =>
        new Date(o.createdAt).toISOString().split('T')[0] === day
      );
      return dayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    });

    const ordersByDay = last7Days.map(day => {
      if (!orders) return 0;
      return orders.filter((o: any) =>
        new Date(o.createdAt).toISOString().split('T')[0] === day
      ).length;
    });

    const labels = last7Days.map(day => {
      const date = new Date(day);
      return date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
    });

    return { salesByDay, ordersByDay, labels };
  };

  const { salesByDay, ordersByDay, labels } = getDailyData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {language === 'en' ? 'Dashboard' : 'Painel'}
        </h2>
        <p className="text-gray-500">
          {language === 'en'
            ? 'Welcome back! Here\'s what\'s happening with your store.'
            : 'Bem-vindo! Veja o que está acontecendo com sua loja.'}
        </p>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card className="p-5 bg-gradient-to-br from-green-50 to-white border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {language === 'en' ? 'Total Revenue' : 'Receita Total'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-gray-500">AED</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-3">
            <MiniSparkline data={salesByDay} color="#16a34a" />
          </div>
        </Card>

        {/* Orders Card */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {language === 'en' ? 'Total Orders' : 'Total Pedidos'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
              <p className="text-xs text-green-600">+{ordersByDay[ordersByDay.length - 1] || 0} {language === 'en' ? 'today' : 'hoje'}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <MiniSparkline data={ordersByDay} color="#2563eb" />
          </div>
        </Card>

        {/* Products Card */}
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {language === 'en' ? 'Products' : 'Produtos'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-xs text-gray-500">{language === 'en' ? 'active items' : 'itens ativos'}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Newsletter Card */}
        <Card className="p-5 bg-gradient-to-br from-pink-50 to-white border-pink-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {language === 'en' ? 'Subscribers' : 'Inscritos'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{newsletterStats?.active || 0}</p>
              <p className="text-xs text-gray-500">{language === 'en' ? 'newsletter' : 'newsletter'}</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Mail className="w-5 h-5 text-pink-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart - Large */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'en' ? 'Sales Overview' : 'Visão de Vendas'}
              </h3>
              <p className="text-sm text-gray-500">
                {language === 'en' ? 'Last 7 days' : 'Últimos 7 dias'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)} AED</p>
              <p className="text-xs text-gray-500">{language === 'en' ? 'total' : 'total'}</p>
            </div>
          </div>

          <div className="h-40">
            {salesByDay.some(v => v > 0) ? (
              <LineChart data={salesByDay} color="#255238" />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{language === 'en' ? 'No sales data yet' : 'Sem dados de vendas'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-2 px-1">
            {labels.map((label, i) => (
              <span key={i} className="text-xs text-gray-400">{label}</span>
            ))}
          </div>
        </Card>

        {/* Order Status Donut */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {language === 'en' ? 'Order Status' : 'Status dos Pedidos'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {language === 'en' ? 'Current breakdown' : 'Distribuição atual'}
          </p>

          <div className="flex justify-center">
            <DonutChart
              value={completedOrders}
              max={totalOrders || 1}
              label={language === 'en' ? 'completed' : 'completos'}
              color="#16a34a"
            />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">{language === 'en' ? 'Completed' : 'Completos'}</span>
              </div>
              <span className="font-semibold">{completedOrders}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">{language === 'en' ? 'Pending' : 'Pendentes'}</span>
              </div>
              <span className="font-semibold">{pendingOrders}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders Bar Chart */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'Orders by Day' : 'Pedidos por Dia'}
            </h3>
            <p className="text-sm text-gray-500">
              {language === 'en' ? 'Daily order count' : 'Contagem diária de pedidos'}
            </p>
          </div>
        </div>

        <div className="h-36">
          {ordersByDay.some(v => v > 0) ? (
            <BarChart data={ordersByDay} labels={labels} color="#255238" />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{language === 'en' ? 'No orders yet' : 'Sem pedidos ainda'}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'Recent Orders' : 'Pedidos Recentes'}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {totalOrders} {language === 'en' ? 'total' : 'total'}
            </span>
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{(order.totalAmount || 0).toFixed(2)} AED</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{language === 'en' ? 'No orders yet' : 'Nenhum pedido ainda'}</p>
            </div>
          )}
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'Top Products' : 'Produtos Top'}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {language === 'en' ? 'by sales' : 'por vendas'}
            </span>
          </div>

          {orders && orders.length > 0 ? (
            (() => {
              const productSales: Record<number, { name: string, count: number, revenue: number }> = {};

              orders.forEach((order: any) => {
                if (order.items && Array.isArray(order.items)) {
                  order.items.forEach((item: any) => {
                    if (!productSales[item.productId]) {
                      const product = Array.isArray(products) ? products.find((p: any) => p.id === item.productId) : null;
                      productSales[item.productId] = {
                        name: product?.nameEN || 'Unknown',
                        count: 0,
                        revenue: 0
                      };
                    }
                    productSales[item.productId].count += item.quantity;
                    productSales[item.productId].revenue += item.priceAtPurchase * item.quantity;
                  });
                }
              });

              const topProducts = Object.entries(productSales)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5);

              return topProducts.length > 0 ? (
                <div className="space-y-3">
                  {topProducts.map(([id, data], i) => (
                    <div key={id} className="flex justify-between items-center py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          i === 0 ? 'bg-yellow-500' :
                          i === 1 ? 'bg-gray-400' :
                          i === 2 ? 'bg-amber-600' :
                          'bg-gray-300'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[150px]">{data.name}</p>
                          <p className="text-xs text-gray-500">
                            {data.count} {language === 'en' ? 'sold' : 'vendidos'}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">{data.revenue.toFixed(2)} AED</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>{language === 'en' ? 'No sales yet' : 'Sem vendas ainda'}</p>
                </div>
              );
            })()
          ) : (
            <div className="py-8 text-center text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{language === 'en' ? 'No orders yet' : 'Nenhum pedido ainda'}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Low Stock Alert */}
      {Array.isArray(products) && products.filter((p: any) => p.stock < 10).length > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'en' ? 'Low Stock Alert' : 'Alerta de Estoque Baixo'}
              </h3>
              <p className="text-sm text-gray-500">
                {language === 'en' ? 'Products that need restocking' : 'Produtos que precisam de reposição'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products
              .filter((p: any) => p.stock < 10)
              .slice(0, 6)
              .map((product: any) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{product.nameEN}</p>
                  </div>
                  <span className={`ml-2 text-sm font-semibold px-2 py-1 rounded ${
                    product.stock === 0 ? 'bg-red-100 text-red-700' :
                    product.stock < 5 ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.stock}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}
