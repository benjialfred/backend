
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,

  Search,
  Menu,
  Heart,
  Calendar,
  BookOpen,
  Info,
  Phone,
  Home,
  ShoppingBag,
  LogOut,
  Settings
} from 'lucide-react';
import logo from '@/assets/phc_logo.jpg';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import ButterflyMenu from './layout/ButterflyMenu';
import NotificationMenu from './communications/NotificationMenu';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    if (term) {
      navigate(`/products?search=${encodeURIComponent(term)}`);
    } else {
      navigate('/products');
    }
  };

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/products', label: 'Boutique', icon: ShoppingBag },
    { path: '/events', label: 'Événements', icon: Calendar },
    { path: '/blog', label: 'Blog', icon: BookOpen },
    { path: '/about', label: 'À propos', icon: Info },
    { path: '/contact', label: 'Contact', icon: Phone },
  ];

  // Links to show in the mobile hamburger menu (all of them or specific ones)
  // User asked for "pages not in mobile bottom nav". 
  // Bottom Nav has: Home, Shop, Favorites, Cart, Account. 
  const mobileMenuItems = navItems;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[9999] transition-all duration-500 bg-white dark:bg-[#0a0a0a] ${scrolled
          ? 'shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-gray-200/50 dark:border-white/5'
          : 'border-b border-transparent'
          }`}
      >
        <div className="container mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={logo} alt="PhC Logo" className="h-10 w-auto relative z-10" />
              </motion.div>
              <div className="hidden md:block">
                <span className="text-xl font-serif font-black tracking-tight text-gray-900 dark:text-white">
                  Prophetie Couture
                </span>
                <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">L'Élégance Absolue</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 border border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-full px-2 py-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-full text-sm font-bold transition-colors z-10 ${
                    location.pathname === item.path
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {location.pathname === item.path && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm border border-gray-100 dark:border-white/5 -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="mr-2 px-4 py-2 bg-gray-100 dark:bg-white/5 border-none rounded-full text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/50 placeholder-gray-500 shadow-inner"
                      placeholder="Recherche..."
                      autoFocus
                      defaultValue={searchParams.get('search') || ''}
                      onChange={handleSearch}
                    />
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Favorites (Hidden on mobile if bottom nav exists, but keeping for desktop) */}
              <Link to="/favorites" className="hidden md:flex relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                <Heart className="w-5 h-5" />
                {favoritesCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-black">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Cart (Hidden on mobile if bottom nav exists) */}
              <Link to="/cart" className="hidden md:flex relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-500 text-gray-900 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-black">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* Notifications */}
              {user && (
                <div className="hidden md:flex relative p-1 items-center justify-center">
                  <NotificationMenu />
                </div>
              )}

              {/* User / Auth */}
              {user ? (
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10 ml-2 relative group">
                  <div className="text-right cursor-default">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{user.prenom}</p>
                    <p className="text-[10px] font-bold tracking-wider text-primary-500 uppercase">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary-400 to-primary-600 hover:scale-105 transition-transform shadow-lg cursor-pointer cursor-pointer">
                    <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden border-2 border-white dark:border-black">
                      {user.photo_profil ? (
                        <img src={user.photo_profil} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-gray-900 dark:text-white">{user.prenom?.[0]}</span>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-12 right-0 mt-2 w-48 bg-white/90 dark:bg-[#111]/90 backdrop-blur-2xl rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50 flex flex-col p-2">
                    <Link
                      to={user.role === 'CLIENT' ? '/client/dashboard' : '/dashboard'}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-primary-500" />
                      Paramètres
                    </Link>
                    <div className="h-px bg-gray-100 dark:bg-white/10 my-1 mx-2"></div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10 ml-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    connexion
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-full hover:scale-105 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - VISIBLE on Mobile explicitly */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2.5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors relative"
              >
                <div className="absolute inset-0 bg-primary-500/10 blur-md rounded-full opacity-0 hover:opacity-100 transition-opacity" />
                <Menu className="w-6 h-6 relative z-10" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Butterfly Menu */}
      < ButterflyMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        menuItems={mobileMenuItems}
        user={user}
        logout={logout}
      />
    </>
  );
};

export default Navigation;