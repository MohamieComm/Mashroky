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
import HotelDetails from "./pages/HotelDetails";
import HotelBooking from "./pages/HotelBooking";
import HotelConfirmation from "./pages/HotelConfirmation";
import Offers from "./pages/Offers";
import OfferDetails from "./pages/OfferDetails";
import Seasons from "./pages/Seasons";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import CarResults from "./pages/CarResults";
import CarDetails from "./pages/CarDetails";
import CarBooking from "./pages/CarBooking";
import CarConfirmation from "./pages/CarConfirmation";
import ToursResults from "./pages/ToursResults";
import TourDetails from "./pages/TourDetails";
import TourBooking from "./pages/TourBooking";
import TourConfirmation from "./pages/TourConfirmation";
import TransfersResults from "./pages/TransfersResults";
import TransferDetails from "./pages/TransferDetails";
import TransferBooking from "./pages/TransferBooking";
import TransferConfirmation from "./pages/TransferConfirmation";
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
import FlightTravelerDetails from "./pages/FlightTravelerDetails";
import FlightBookingConfirmation from "./pages/FlightBookingConfirmation";
import BookingConfirmation from "./pages/BookingConfirmation";

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
              <Route path="/hotels/:hotelId" element={<HotelDetails />} />
              <Route path="/hotels/:hotelId/booking" element={<HotelBooking />} />
              <Route path="/hotels/confirmation" element={<HotelConfirmation />} />
              <Route path="/cars" element={<CarResults />} />
              <Route path="/cars/:carId" element={<CarDetails />} />
              <Route path="/cars/:carId/booking" element={<CarBooking />} />
              <Route path="/cars/confirmation" element={<CarConfirmation />} />
              <Route path="/tours" element={<ToursResults />} />
              <Route path="/tours/:tourId" element={<TourDetails />} />
              <Route path="/tours/:tourId/booking" element={<TourBooking />} />
              <Route path="/tours/confirmation" element={<TourConfirmation />} />
              <Route path="/transfers" element={<TransfersResults />} />
              <Route path="/transfers/:transferId" element={<TransferDetails />} />
              <Route path="/transfers/:transferId/booking" element={<TransferBooking />} />
              <Route path="/transfers/confirmation" element={<TransferConfirmation />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/offers/:offerId" element={<OfferDetails />} />
              <Route path="/seasons" element={<Seasons />} />
              <Route path="/activities" element={<Navigate to="/tours" replace />} />
              <Route path="/transport" element={<Navigate to="/transfers" replace />} />
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
              <Route path="/flight/traveler-details" element={<FlightTravelerDetails />} />
              <Route path="/flight/confirmation" element={<FlightBookingConfirmation />} />
              <Route path="/booking/confirmation" element={<BookingConfirmation />} />
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
