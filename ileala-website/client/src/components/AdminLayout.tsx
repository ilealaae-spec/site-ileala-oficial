import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, ShoppingCart, Ticket, Home, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success(language === 'en' ? 'Logged out successfully' : 'Logout realizado com sucesso');
      setLocation('/');
      window.location.reload();
    } catch (error) {
      toast.error(language === 'en' ? 'Logout failed' : 'Falha no logout');
    }
  };

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

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'en' ? 'Access Denied' : 'Acesso Negado'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {language === 'en' 
              ? 'You need admin privileges to access this page.' 
              : 'Você precisa de privilégios de administrador para acessar esta página.'}
          </p>
          <Link href="/">
            <Button>
              {language === 'en' ? 'Go Home' : 'Ir para Início'}
            </Button>
          </Link>
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
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">
            {language === 'en' ? 'Admin Panel' : 'Painel Admin'}
          </h2>
          <p className="text-sm text-muted-foreground">ILE ALA</p>
        </div>

        <nav className="px-4 space-y-2">
          <Link href="/">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors">
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t w-64">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
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
