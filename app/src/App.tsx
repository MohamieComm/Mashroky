import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Trips from "./pages/Trips";
import TripDetails from "./pages/TripDetails";
import Hotels from "./pages/Hotels";
import Offers from "./pages/Offers";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Activities from "./pages/Activities";
import Transport from "./pages/Transport";
import Payments from "./pages/Payments";
import Saudi from "./pages/Saudi";
import Study from "./pages/Study";
import Articles from "./pages/Articles";
import Destinations from "./pages/Destinations";
import Cart from "./pages/Cart";
import Register from "./pages/Register";
import Usage from "./pages/Usage";
import Cookies from "./pages/Cookies";
import Refund from "./pages/Refund";

const queryClient = new QueryClient();

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="bg-card rounded-2xl p-8 shadow-card text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">جاري التحقق من الصلاحيات</h2>
          <p className="text-muted-foreground text-sm">يرجى الانتظار لحظات...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trip/:id" element={<TripDetails />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/saudi" element={<Saudi />} />
              <Route path="/study" element={<Study />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/support" element={<Support />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/refund" element={<Refund />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
