import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  Loader2, Mail, Shield, Lock, Eye, EyeOff,
  LayoutDashboard, Users, Package, ShoppingCart, Palette, FileText, Image,
  LogOut, Search, Bell, User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Import tab components
import DashboardTab from '@/components/admin/DashboardTab';
import NewsletterTab from '@/components/admin/NewsletterTab';
import UsersTab from '@/components/admin/UsersTab';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';
import ArtisansTab from '@/components/admin/ArtisansTab';
import ContentTab from '@/components/admin/ContentTab';
import MediaTab from '@/components/admin/MediaTab';

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "users", label: "Users", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "artisans", label: "Artisans", icon: Palette },
  { id: "content", label: "Content", icon: FileText },
  { id: "media", label: "Media", icon: Image },
];

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emergencyUser, setEmergencyUser] = useState<any>(null);
  const [checkingEmergency, setCheckingEmergency] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const utils = trpc.useUtils();

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // This is critical to avoid React error #310
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      console.log('[Admin] Login successful!');
      toast.success('Login successful!');
      
      // Invalidate auth data to get fresh user info
      await utils.auth.me.invalidate();
      
      // Simply reload the page - the admin check will happen on page load
      // If user is not admin, they will see "Access Denied" after reload
      window.location.reload();
    },
    onError: (error) => {
      console.error('[Admin] Login error:', error);
      toast.error(error.message || 'Invalid email or password');
    },
  });

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

  // Force refresh auth data when component mounts if user is null but we're on admin page
  useEffect(() => {
    if (!user && !authLoading && !checkingEmergency) {
      console.log('[Admin] No user found, refreshing auth data...');
      // Wait a bit and then refresh
      const timer = setTimeout(() => {
        utils.auth.me.invalidate();
        utils.auth.me.refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, checkingEmergency, utils]);

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
  
  // DEBUG: Log user info
  console.log('[Admin] DEBUG - emergencyUser:', emergencyUser);
  console.log('[Admin] DEBUG - user:', user);
  console.log('[Admin] DEBUG - currentUser:', currentUser);
  console.log('[Admin] DEBUG - currentUser?.role:', currentUser?.role);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  // Show login form if no user found
  // Also check if user is still loading (might be null temporarily after redirect)
  if (!currentUser) {
    // If auth is still loading, show loading spinner
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 px-4 py-8">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-8">
            <img 
              src="/images/logo_ile_ala.webp" 
              alt="ILE ALA" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <h1 className="text-3xl font-display text-sage-900 mb-2">
              Admin Login
            </h1>
            <p className="text-sage-600">
              Sign in to access admin panel
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sage-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className="pl-10"
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sage-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full"
              size="lg"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Check if user is admin - with null safety
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-8">
            You do not have permission to access this page.
          </p>
          <Button onClick={() => setLocation('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      // Clear emergency session if exists
      localStorage.removeItem('emergency_admin_session');
      
      // Logout via API
      await utils.auth.logout.mutate();
      
      // Redirect to home
      window.location.href = '/';
    } catch (error) {
      console.error('[Admin] Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = '/';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <DashboardTab />
          </ErrorBoundary>
        );
      case 'newsletter':
        return (
          <ErrorBoundary>
            <NewsletterTab />
          </ErrorBoundary>
        );
      case 'users':
        return (
          <ErrorBoundary>
            <UsersTab />
          </ErrorBoundary>
        );
      case 'products':
        return (
          <ErrorBoundary>
            <ProductsTab />
          </ErrorBoundary>
        );
      case 'orders':
        return (
          <ErrorBoundary>
            <OrdersTab />
          </ErrorBoundary>
        );
      case 'artisans':
        return (
          <ErrorBoundary>
            <ArtisansTab />
          </ErrorBoundary>
        );
      case 'content':
        return (
          <ErrorBoundary>
            <ContentTab />
          </ErrorBoundary>
        );
      case 'media':
        return (
          <ErrorBoundary>
            <MediaTab />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <DashboardTab />
          </ErrorBoundary>
        );
    }
  };

  console.log('[Admin] RENDERING NEW MODERN LAYOUT - Build: 20251129-141900');

  // INLINE MODERN LAYOUT (AdminLayoutWrapper + AdminSidebar + AdminHeader)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary">ILE ALA</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                  {currentUser.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium">{currentUser.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email || ""}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {emergencyUser && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-800">Emergency Mode</span>
              </div>
              <p className="text-sm text-yellow-800">
                You are logged in using emergency admin access. Some features may be limited.
              </p>
            </div>
          )}
          
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
