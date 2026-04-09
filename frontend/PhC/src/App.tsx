import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import Login from '@pages/Login';
import AdminLogin from '@/pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Models from './pages/Models';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Announcements from './pages/Announcements';
import AdminEvents from '@/pages/AdminEvents';
import ClientDashboard from '@/pages/ClientDashboard';
import ClientNotifications from '@/pages/ClientNotifications';
import Home from './pages/Home';
import ProductsPublic from '@pages/ProductsPublic';
import Cart from '@pages/Cart';
import Checkout from '@pages/Checkout';
import OrderFlow from '@pages/checkout/OrderFlow';
import Register from '@pages/Register';
import ForgotPassword from '@pages/ForgotPassword';
import ProductDetail from './pages/ProductDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import Favorites from '@/pages/Favorites';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { NotFound } from '@/pages/NotFound';
import ContactPage from '@/pages/ContactPage';
import AboutPage from '@/pages/AboutPage';
import TrainingBlog from '@/pages/TrainingBlog';
import EventsPage from '@/pages/EventsPage';
import BlogPage from '@/pages/BlogPage';
import FAQPage from '@/pages/FAQPage';

import { Navigate } from 'react-router-dom';
import { NotificationProvider } from '@/context/NotificationContext';
import NotificationBanner from '@/components/layout/NotificationBanner';

import PremiumLoader from '@/components/ui/PremiumLoader';
import GlobalLoaderWrapper from '@/components/ui/GlobalLoaderWrapper';
// ==========================================
// PROTECTION DE ROUTES (GUARDS)
// ==========================================
// Ce composant "Higher Order Component" enveloppe les pages nécessitant une authentification.
// S'il n'y a pas d'utilisateur connecté (user est null), il bloque le rendu et
// redirige automatiquement vers la page de login de manière silencieuse (replace).
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PremiumLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ==========================================
// PROTECTION DE ROUTES ADMINISTRATION
// ==========================================
// De la même manière que PrivateRoute, ce composant s'assure en plus que 
// le rôle de l'utilisateur correspond strictly à ADMIN ou SUPER_ADMIN 
// avant de laisser l'accès au tableau de bord.
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PremiumLoader />;
  }

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    // Redirect non-admins to their main dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <NotificationProvider>
            <GlobalLoaderWrapper>
              <div className="min-h-screen bg-white dark:bg-black font-sans text-black dark:text-white transition-colors duration-300">
                <Toaster position="top-center" />
                <NotificationBanner />

                {/* DÉFINITION DE L'ARBRE DE ROUTAGE */}
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductsPublic />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/sur-mesure" element={<OrderFlow />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/blog/formation" element={<TrainingBlog />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/faq" element={<FAQPage />} />

                  {/* Routes dashboard (protégées) */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />

                  {/* Admin Only Routes */}
                  <Route path="/dashboard/products" element={
                    <AdminRoute>
                      <Products />
                    </AdminRoute>
                  } />

                  <Route path="/dashboard/users" element={
                    <AdminRoute>
                      <Users />
                    </AdminRoute>
                  } />

                  <Route path="/dashboard/models" element={
                    <AdminRoute>
                      <Models />
                    </AdminRoute>
                  } />

                  <Route path="/dashboard/orders" element={
                    <AdminRoute>
                      <Orders />
                    </AdminRoute>
                  } />

                  <Route path="/dashboard/settings" element={
                    <AdminRoute>
                      <Settings />
                    </AdminRoute>
                  } />

                  <Route path="/dashboard/announcements" element={
                    <AdminRoute>
                      <Announcements />
                    </AdminRoute>
                  } />

                  <Route path="/dashboard/events" element={
                    <AdminRoute>
                      <AdminEvents />
                    </AdminRoute>
                  } />

                  <Route path="/client/dashboard" element={
                    <PrivateRoute>
                      <ClientDashboard />
                    </PrivateRoute>
                  } />

                  <Route path="/client/notifications" element={
                    <PrivateRoute>
                      <ClientNotifications />
                    </PrivateRoute>
                  } />

                  {/* Redirection */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MobileBottomNav />
              </div>
            </GlobalLoaderWrapper>
          </NotificationProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;