import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, ShoppingCart, Ticket, Users, Home, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();
  const { data: user, isLoading, error } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  
  // Check for emergency admin session as fallback
  const [emergencyUser, setEmergencyUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    try {
      const emergencySession = localStorage.getItem('emergency_admin_session');
      if (emergencySession) {
        const parsedSession = JSON.parse(emergencySession);
        if (parsedSession && parsedSession.role === 'admin' && parsedSession.emergency) {
          setEmergencyUser(parsedSession);
        }
      }
    } catch {
      // Silent fail for emergency session check
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success(language === 'en' ? 'Logged out successfully' : 'Logout realizado com sucesso');
      // Redirect to login page instead of home
      setLocation('/login');
      window.location.reload();
    } catch (error) {
      toast.error(language === 'en' ? 'Logout failed' : 'Falha no logout');
    }
  };

  // Use emergency user if available, otherwise use regular auth user
  const currentUser = emergencyUser || user;

  // Check if user is admin
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if API failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            {language === 'en' ? 'Authentication Error' : 'Erro de Autenticação'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {language === 'en' 
              ? 'Unable to verify your authentication. Please try logging in again.' 
              : 'Não foi possível verificar sua autenticação. Por favor, tente fazer login novamente.'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'Unknown error'}
          </p>
          <div className="flex gap-2 justify-center">
            <Link href="/login">
              <Button>
                {language === 'en' ? 'Go to Login' : 'Ir para Login'}
              </Button>
            </Link>
            <Link href="/admin-emergency-login">
              <Button variant="outline">
                {language === 'en' ? 'Emergency Login' : 'Login de Emergência'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Access Denied' : 'Acesso Negado'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {language === 'en' 
              ? 'You need admin privileges to access this page.' 
              : 'Você precisa de privilégios de administrador para acessar esta página.'}
          </p>
          {!currentUser && (
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en' 
                ? 'No user session found. Please log in first.' 
                : 'Nenhuma sessão de usuário encontrada. Por favor, faça login primeiro.'}
            </p>
          )}
          {currentUser && currentUser.role !== 'admin' && (
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'en' 
                ? `Your current role is: ${currentUser.role}` 
                : `Seu papel atual é: ${currentUser.role}`}
            </p>
          )}
          <div className="flex gap-2 justify-center">
            <Link href="/login">
              <Button>
                {language === 'en' ? 'Go to Login' : 'Ir para Login'}
              </Button>
            </Link>
            <Link href="/admin-emergency-login">
              <Button variant="outline">
                {language === 'en' ? 'Emergency Login' : 'Login de Emergência'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      path: '/admin/products',
      icon: Package,
      label: language === 'en' ? 'Products' : 'Produtos',
    },
    {
      path: '/admin/orders',
      icon: ShoppingCart,
      label: language === 'en' ? 'Orders' : 'Pedidos',
    },
    {
      path: '/admin/coupons',
      icon: Ticket,
      label: language === 'en' ? 'Coupons' : 'Cupons',
    },
    {
      path: '/admin/customers',
      icon: Users,
      label: language === 'en' ? 'Customers' : 'Clientes',
    },
  ];

  return (
    <div className="min-h-screen flex admin-panel">
      {/* Sidebar */}
      <aside className="w-64 bg-[#172d20] border-r text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">
            {language === 'en' ? 'Admin Panel' : 'Painel Admin'}
          </h2>
          <p className="text-sm text-white/80">ILE ALA</p>
        </div>

        <nav className="px-4 space-y-2">
          <Link href="/">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-white">
              <Home className="w-5 h-5" />
              <span>{language === 'en' ? 'Back to Site' : 'Voltar ao Site'}</span>
            </a>
          </Link>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-white ${
                    isActive
                      ? 'bg-[#255238] text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 w-64">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-white">{currentUser.name}</p>
            <p className="text-xs text-white/70">{currentUser.email}</p>
            {emergencyUser && (
              <p className="text-xs text-yellow-300 mt-1">⚠️ Emergency Mode</p>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Logout' : 'Sair'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
