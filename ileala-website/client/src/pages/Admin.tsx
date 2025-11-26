import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { Loader2, LayoutDashboard, Mail, Users, Package, ShoppingCart, Shield, Palette, FileText, Image } from 'lucide-react';
import { useState, useEffect } from 'react';

// Import tab components
import DashboardTab from '@/components/admin/DashboardTab';
import NewsletterTab from '@/components/admin/NewsletterTab';
import UsersTab from '@/components/admin/UsersTab';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';
import ArtisansTab from '@/components/admin/ArtisansTab';
import ContentTab from '@/components/admin/ContentTab';
import MediaTab from '@/components/admin/MediaTab';

export default function Admin() {
  const { language } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emergencyUser, setEmergencyUser] = useState<any>(null);
  const [checkingEmergency, setCheckingEmergency] = useState(true);

  // Check for emergency admin session
  useEffect(() => {
    try {
      const emergencySession = localStorage.getItem('emergency_admin_session');
      if (emergencySession) {
        const parsedSession = JSON.parse(emergencySession);
        if (parsedSession && parsedSession.role === 'admin' && parsedSession.emergency) {
          setEmergencyUser(parsedSession);
        }
      }
    } catch (error) {
      console.error('Error checking emergency session:', error);
    } finally {
      setCheckingEmergency(false);
    }
  }, []);

  // Show loading while checking emergency session or auth
  if (checkingEmergency || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use emergency user if available, otherwise use regular auth user
  const currentUser = emergencyUser || user;

  // DEBUG: Log user data
  console.log('[Admin] Auth user:', user);
  console.log('[Admin] Emergency user:', emergencyUser);
  console.log('[Admin] Current user:', currentUser);
  console.log('[Admin] Current user role:', currentUser?.role);

  // Redirect to login if no user found
  if (!currentUser) {
    setLocation('/login?redirect=/admin');
    return null;
  }

  // Check if user is admin
  if (currentUser.role !== 'admin') {
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-sage-900">
              {language === 'en' ? 'Admin Panel' : 'Painel Administrativo'}
            </h1>
            {emergencyUser && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border-2 border-red-500 rounded-full">
                <Shield className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-red-600 uppercase">
                  {language === 'en' ? 'Emergency Mode' : 'Modo Emergência'}
                </span>
              </div>
            )}
          </div>
          <p className="text-sage-600">
            {language === 'en' 
              ? 'Manage your store, products, orders, and customers' 
              : 'Gerencie sua loja, produtos, pedidos e clientes'}
          </p>
          {emergencyUser && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ {language === 'en' ? 'Warning' : 'Aviso'}:</strong>{' '}
                {language === 'en' 
                  ? 'You are logged in using emergency admin access. Some features may be limited.' 
                  : 'Você está logado usando acesso admin de emergência. Alguns recursos podem estar limitados.'}
              </p>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8">
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
            <TabsTrigger value="artisans" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Artisans' : 'Artesãos'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Content' : 'Conteúdo'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="hidden md:inline">
                {language === 'en' ? 'Media' : 'Mídia'}
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

          <TabsContent value="artisans">
            <ArtisansTab />
          </TabsContent>

          <TabsContent value="content">
            <ContentTab />
          </TabsContent>

          <TabsContent value="media">
            <MediaTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
