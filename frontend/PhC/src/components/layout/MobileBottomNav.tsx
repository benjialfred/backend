import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User, Settings, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
    const { user } = useAuth();
    const { cartCount } = useCart();
    const { favoritesCount } = useFavorites();
    const location = useLocation();

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[60]">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex justify-between items-center px-4 py-2 h-[72px]"
            >
                {/* Home */}
                <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-full rounded-xl transition-all ${isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Home className="w-6 h-6" strokeWidth={location.pathname === '/' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium mt-1">Accueil</span>
                </NavLink>

                {/* Shop */}
                <NavLink to="/products" className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-full rounded-xl transition-all ${isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    <ShoppingBag className="w-6 h-6" strokeWidth={location.pathname === '/products' ? 2.5 : 2} />
                    <span className="text-[9px] font-medium mt-1">Boutique</span>
                </NavLink>

                {/* CENTRAL CART BUTTON */}
                <NavLink to="/cart" className="relative -top-6">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(14,165,233,0.3)] border-4 border-white dark:border-[#111] transform transition-transform active:scale-95 hover:scale-105"
                    >
                        <ShoppingCart className="w-7 h-7 text-white fill-white" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-white text-primary-600 text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#111] shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </motion.div>
                </NavLink>

                {/* Favorites */}
                <NavLink to="/favorites" className={({ isActive }) => `relative flex flex-col items-center justify-center w-14 h-full rounded-xl transition-all ${isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    <div className="relative">
                        <Heart className="w-6 h-6" strokeWidth={location.pathname === '/favorites' ? 2.5 : 2} />
                        {favoritesCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-[#111]">
                                {favoritesCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[9px] font-medium mt-1">Favoris</span>
                </NavLink>

                {/* Account */}
                <NavLink to={user ? "/dashboard" : "/login"} className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-full rounded-xl transition-all ${isActive ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {user ? <Settings className="w-6 h-6" /> : <User className="w-6 h-6" />}
                    <span className="text-[9px] font-medium mt-1">{user ? 'Espace' : 'Compte'}</span>
                </NavLink>

            </motion.div>
        </div>
    );
};

export default MobileBottomNav;
