import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { Loader2, LayoutDashboard, Mail, Users, Package, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

// Import tab components
import DashboardTab from '@/components/admin/DashboardTab';
import NewsletterTab from '@/components/admin/NewsletterTab';
import UsersTab from '@/components/admin/UsersTab';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';

export default function Admin() {
  const { language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation('/login');
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Access Denied' : 'Acesso Negado'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {language === 'en' 
              ? 'You do not have permission to access this page.' 
              : 'Você não tem permissão para acessar esta página.'}
          </p>
          <Button onClick={() => setLocation('/')}>
            {language === 'en' ? 'Go Home' : 'Ir para Início'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-sage-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-sage-900 mb-2">
            {language === 'en' ? 'Admin Panel' : 'Painel Administrativo'}
          </h1>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Manage your store, products, orders, and customers' 
              : 'Gerencie sua loja, produtos, pedidos e clientes'}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Dashboard' : 'Painel'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Newsletter' : 'Newsletter'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Users' : 'Usuários'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Products' : 'Produtos'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Orders' : 'Pedidos'}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
