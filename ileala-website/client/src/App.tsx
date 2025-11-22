// Build: 2025-11-02T03:27:00Z - Fixed React Hooks error
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Admin from "./pages/Admin";
import AdminEmergency from "./pages/AdminEmergency";
import PromoteAdmin from "./pages/PromoteAdmin";
import About from "./pages/About";
import Collections from "./pages/Collections";
import CollectionPage from "./pages/CollectionPage";
import Contact from "./pages/Contact";
import AIPolicy from "./pages/AIPolicy";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Accessibility from "./pages/Accessibility";
import DoNotSell from "./pages/DoNotSell";
import Help from "./pages/Help";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import ProductCare from "./pages/ProductCare";
import FindRetailer from "./pages/FindRetailer";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCoupons from "./pages/admin/Coupons";
import AdminEmergencyLogin from "./pages/AdminEmergencyLogin";
import AdminLayout from "./components/AdminLayout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SchemaOrg from "./components/SchemaOrg";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/shop/:slug" component={ProductDetail} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/order-confirmation/:id" component={OrderConfirmation} />
          <Route path="/promote-admin" component={PromoteAdmin} />
          <Route path="/admin-emergency-login" component={AdminEmergencyLogin} />
          <Route path="/admin-emergency" component={AdminEmergency} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/products">
            <AdminLayout>
              <AdminProducts />
            </AdminLayout>
          </Route>
          <Route path="/admin/orders">
            <AdminLayout>
              <AdminOrders />
            </AdminLayout>
          </Route>
          <Route path="/admin/coupons">
            <AdminLayout>
              <AdminCoupons />
            </AdminLayout>
          </Route>
          <Route path="/about" component={About} />
          <Route path={"/collections"} component={Collections} />
          <Route path="/collections/:slug" component={CollectionPage} />
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
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
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
