// Build: 2025-11-02T03:27:00Z - Fixed React Hooks error
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useEffect, lazy, Suspense } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SchemaOrg from "./components/SchemaOrg";
import { Loader2 } from "lucide-react";
// import { useServiceWorker } from "./hooks/useServiceWorker";
import { errorTracker } from "./lib/errorTracking";
import { useAuth } from "@/_core/hooks/useAuth";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
// Removed Sanity pages - migrated to independent backend
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Orders = lazy(() => import("./pages/Orders"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminEmergency = lazy(() => import("./pages/AdminEmergency"));
const PromoteAdmin = lazy(() => import("./pages/PromoteAdmin"));
const AdminEmergencyLogin = lazy(() => import("./pages/AdminEmergencyLogin"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const About = lazy(() => import("./pages/About"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const PetCollection = lazy(() => import("./pages/PetCollection"));
const Accessories = lazy(() => import("./pages/Accessories"));
const NapkinRings = lazy(() => import("./pages/NapkinRings"));
const TableEssentials = lazy(() => import("./pages/TableEssentials"));
const HomeAccents = lazy(() => import("./pages/HomeAccents"));
const Contact = lazy(() => import("./pages/Contact"));
const AIPolicy = lazy(() => import("./pages/AIPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const DoNotSell = lazy(() => import("./pages/DoNotSell"));
const Help = lazy(() => import("./pages/Help"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const ProductCare = lazy(() => import("./pages/ProductCare"));
const FindRetailer = lazy(() => import("./pages/FindRetailer"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Offline = lazy(() => import("./pages/Offline"));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path="/shop" component={Collections} />
            <Route path="/shop/:slug" component={ProductDetail} />
            {/* Removed Sanity routes - migrated to independent backend */}
            <Route path="/payment-success" component={PaymentSuccess} />
            <Route path="/product/:id" component={ProductDetail} />
            {/* Cart route removed - using new cart system */}
            <Route path="/checkout" component={Checkout} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/profile" component={Profile} />
            <Route path="/orders" component={Orders} />
            <Route path="/verify-email" component={VerifyEmail} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/reset-password" component={ResetPassword} />
            <Route path="/order-confirmation/:id" component={OrderConfirmation} />
            <Route path="/promote-admin" component={PromoteAdmin} />
            <Route path="/admin-emergency-login" component={AdminEmergencyLogin} />
            <Route path="/admin-emergency" component={AdminEmergency} />
            <Route path="/admin" component={Admin} />
            <Route path="/admin/products">
              <Suspense fallback={<PageLoader />}>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </Suspense>
            </Route>
            <Route path="/admin/orders">
              <Suspense fallback={<PageLoader />}>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </Suspense>
            </Route>
            <Route path="/admin/coupons">
              <Suspense fallback={<PageLoader />}>
                <AdminLayout>
                  <AdminCoupons />
                </AdminLayout>
              </Suspense>
            </Route>
            <Route path="/about" component={About} />
            <Route path={"/collections"} component={Collections} />
            <Route path="/collections/:slug" component={CollectionPage} />
            <Route path="/category/:slug" component={CategoryPage} />
            <Route path={"/napkin-rings"} component={NapkinRings} />
            <Route path={"/table-essentials"} component={TableEssentials} />
            <Route path={"/home-accents"} component={HomeAccents} />
            <Route path={"/accessories"} component={Accessories} />
            <Route path={"/pet-collection"} component={PetCollection} />
            <Route path={"/contact"} component={Contact} />
            <Route path={"/ai-policy"} component={AIPolicy} />
            <Route path={"/terms"} component={Terms} />
            <Route path={"/privacy"} component={Privacy} />
            <Route path={"/accessibility"} component={Accessibility} />
            <Route path={"/do-not-sell"} component={DoNotSell} />
            <Route path={"/help"} component={Help} />
            <Route path={"/faq"} component={FAQ} />
            <Route path={"/shipping"} component={Shipping} />
            <Route path={"/returns"} component={Returns} />
            <Route path={"/product-care"} component={ProductCare} />
            <Route path={"/find-retailer"} component={FindRetailer} />
            <Route path={"/404"} component={NotFound} />
            <Route path={"/offline"} component={Offline} />
            {/* Final fallback route */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  
  // Register Service Worker for PWA
  // DISABLED: Service worker causing cache issues
  // useServiceWorker();

  // Set user context for error tracking
  useEffect(() => {
    if (user) {
      errorTracker.setUser(user.id, user.email);
    } else {
      errorTracker.clearUser();
    }
  }, [user]);

  // Invalidate auth.me query after Google OAuth redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we're coming from Google OAuth success redirect
    if (urlParams.has('oauth_success')) {
      // Remove the parameter from URL
      urlParams.delete('oauth_success');
      const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
      window.history.replaceState({}, '', newUrl);
      
      // Invalidate auth query to refresh user data
      setTimeout(() => {
        utils.auth.me.invalidate();
      }, 100);
    }
  }, [utils]);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      // switchable
      >
        <SchemaOrg />
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
