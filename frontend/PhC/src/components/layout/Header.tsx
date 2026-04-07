// src/components/dashboard/Header.tsx
import { useState } from 'react';
import { Search, HelpCircle, Sun, Moon, ShoppingBag } from 'lucide-react';
import headerBg from '../../assets/atelier_excellence.png';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import NotificationCenter from '@/components/communications/NotificationCenter';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false); // Can be kept or removed if forced dark
  const { t } = useTranslation();

  return (
    <header
      className="sticky top-0 z-40 bg-[#1f2940] border-b border-[#2d2f5e]"
      style={{
        backgroundImage: `url(${headerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
        backgroundColor: '#1f2940'
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Titre */}
        <h1 className="text-xl font-semibold text-white">{title}</h1>

        {/* Barre de recherche et actions */}
        <div className="flex items-center gap-4">
          {/* Barre de recherche */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('header.search')}
                className="w-64 pl-10 pr-4 py-2 bg-[#141b2d] border border-[#2d2f5e] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Sélecteur de langue */}
          <LanguageSwitcher />

          {/* Mode sombre/clair */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2d2f5e] rounded-lg"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Aide */}
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#2d2f5e] rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Panier */}
          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white hover:bg-[#2d2f5e] rounded-lg">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <NotificationCenter />

          {/* Profil */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2d2f5e]">
                {user.photo_profil ? (
                  <img
                    src={user.photo_profil}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">{user.prenom} {user.nom}</p>
                <p className="text-xs text-gray-400">{user.role}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;