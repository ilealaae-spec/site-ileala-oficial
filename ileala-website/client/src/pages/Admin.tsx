import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import {
  Loader2, Mail, Shield, Lock, Eye, EyeOff,
  LayoutDashboard, Users, Package, ShoppingCart, Palette, FileText, Image,
  LogOut, Search, Bell, User, FolderOpen, Ticket, Settings, Send, Home, Gift, Crown
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
import CategoriesTab from '@/components/admin/CategoriesTab';
import CollectionsTab from '@/components/admin/CollectionsTab';
import CouponsTab from '@/components/admin/CouponsTab';
import GiftCardsTab from '@/components/admin/GiftCardsTab';
import LoyaltyTab from '@/components/admin/LoyaltyTab';
import SettingsTab from '@/components/admin/SettingsTab';
import SecurityTab from '@/components/admin/SecurityTab';
import EmailMarketingTab from '@/components/admin/EmailMarketingTab';
import HomepageTab from '@/components/admin/HomepageTab';

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "homepage", label: "Homepage", icon: Home },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "email-marketing", label: "Email Marketing", icon: Send },
  { id: "users", label: "Users", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "collections", label: "Collections", icon: Palette },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "gift-cards", label: "Gift Cards", icon: Gift },
  { id: "loyalty", label: "The Green World", icon: Crown },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "artisans", label: "Artisans", icon: Palette },
  { id: "content", label: "Content", icon: FileText },
  { id: "media", label: "Media", icon: Image },
  { id: "security", label: "Security", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Admin() {
  const { user, loading: authLoading, logout } = useAuth();
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
      toast.success('Login successful!');
      await utils.auth.me.invalidate();
      window.location.reload();
    },
    onError: (error) => {
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
    } catch {
      // Silent fail for emergency session check
    } finally {
      setCheckingEmergency(false);
    }
  }, []);

  // Force refresh auth data when component mounts if user is null but we're on admin page
  useEffect(() => {
    if (!user && !authLoading && !checkingEmergency) {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  // Redirect to /login if no user found
  if (!currentUser) {
    // If auth is still loading, show loading spinner
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    // Redirect to login page
    setLocation('/login');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      localStorage.removeItem('emergency_admin_session');
      await logout();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
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
      case 'homepage':
        return (
          <ErrorBoundary>
            <HomepageTab />
          </ErrorBoundary>
        );
      case 'newsletter':
        return (
          <ErrorBoundary>
            <NewsletterTab />
          </ErrorBoundary>
        );
      case 'email-marketing':
        return (
          <ErrorBoundary>
            <EmailMarketingTab />
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
      case 'categories':
        return (
          <ErrorBoundary>
            <CategoriesTab />
          </ErrorBoundary>
        );
      case 'collections':
        return (
          <ErrorBoundary>
            <CollectionsTab />
          </ErrorBoundary>
        );
      case 'coupons':
        return (
          <ErrorBoundary>
            <CouponsTab />
          </ErrorBoundary>
        );
      case 'gift-cards':
        return (
          <ErrorBoundary>
            <GiftCardsTab />
          </ErrorBoundary>
        );
      case 'loyalty':
        return (
          <ErrorBoundary>
            <LoyaltyTab />
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
      case 'settings':
        return (
          <ErrorBoundary>
            <SettingsTab />
          </ErrorBoundary>
        );
      case 'security':
        return (
          <ErrorBoundary>
            <SecurityTab />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#172d20] flex flex-col z-20 shadow-2xl text-white">
        {/* Logo */}
        <div className="p-6 border-b border-white/20">
          <h1 className="text-2xl font-bold text-white">ILE ALA</h1>
          <p className="text-sm text-white/80">Admin Panel</p>
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
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-white",
                  isActive
                    ? "bg-[#255238] text-white"
                    : "hover:bg-white/10"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/20">
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm">
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-medium shadow-lg">
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
              <DropdownMenuItem onClick={() => setLocation('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>Settings</DropdownMenuItem>
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
