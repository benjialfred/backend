import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      category: "PRINCIPAL",
      items: [
        { 
          path: '/dashboard', 
          label: 'Vue d\'ensemble', 
          icon: <LayoutDashboard className="w-5 h-5" />,
          roles: ['ADMIN', 'SUPER_ADMIN', 'WORKER', 'APPRENTI', 'USER']
        },
        { 
          path: '/dashboard/orders', 
          label: 'Commandes', 
          icon: <ShoppingBag className="w-5 h-5" />,
          roles: ['ADMIN', 'SUPER_ADMIN', 'WORKER', 'APPRENTI', 'USER']
        },
      ]
    },
    {
      category: "ATELIER & CATALOGUE",
      items: [
        { 
          path: '/dashboard/products', 
          label: 'Catalogue', 
          icon: <Package className="w-5 h-5" />,
          roles: ['ADMIN', 'SUPER_ADMIN', 'WORKER']
        },
        { 
          path: '/dashboard/users', 
          label: 'Clients & Staff', 
          icon: <Users className="w-5 h-5" />,
          roles: ['ADMIN', 'SUPER_ADMIN']
        },
      ]
    },
    {
      category: "COMMUNICATION",
      items: [
        { 
          path: '/dashboard/announcements', 
          label: 'Annonces', 
          icon: <Bell className="w-5 h-5" />,
          roles: ['ADMIN', 'SUPER_ADMIN', 'APPRENTI', 'WORKER']
        },
        { 
          path: '/dashboard/events', 
          label: 'Évènements', 
          icon: <Calendar className="w-5 h-5" />,
          roles: ['ADMIN', 'SUPER_ADMIN']
        },
      ]
    }
  ];

  const userRole = user?.role?.toUpperCase() || 'USER';

  const filteredMenuItems = menuItems.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.roles.includes(userRole)
    )
  })).filter(category => category.items.length > 0);

  const handleLogout = async () => {
    await logout();
    if (onMobileClose) onMobileClose();
  };

  const displayName = user?.prenom ? `${user.prenom} ${user.nom || ''}` : (user?.email || 'Utilisateur');
  const userInitials = user?.prenom ? user.prenom.charAt(0).toUpperCase() : 'P';

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : isCollapsed ? -80 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] 
          border-r border-gray-200 dark:border-white/10 z-50 transition-all duration-300 shadow-[20px_0_40px_rgba(0,0,0,0.02)] dark:shadow-[20px_0_40px_rgba(0,0,0,0.2)]
          ${isCollapsed ? 'w-20' : 'w-72'} ${isMobileOpen ? 'translate-x-0' : 'hidden md:block'}`}
      >
        {/* Luxury Logo Section */}
        <div className="relative p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-black dark:bg-white rounded flex items-center justify-center shadow-lg">
                <span className="font-serif font-black text-lg text-white dark:text-black">PC</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full shadow-[0_0_8px_#D4AF37] animate-pulse" />
            </div>
            
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col"
              >
                <span className="text-lg font-serif font-black text-gray-900 dark:text-white uppercase tracking-widest leading-tight">
                  Prophétie
                </span>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                  Enterprise
                </span>
              </motion.div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded bg-gray-200 dark:bg-white/10 
              text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        {!isCollapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mx-4 mt-6 bg-white dark:bg-[#111] 
              rounded-xl border border-gray-200 dark:border-white/10 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white font-serif font-bold text-lg border border-gray-200 dark:border-white/10">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {userRole.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar" style={{ height: 'calc(100vh - 240px)' }}>
          {filteredMenuItems.map((category, idx) => (
            <div key={idx} className="mb-8">
              {!isCollapsed && (
                <div className="px-3 mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {category.category}
                  </span>
                </div>
              )}
              
              <div className="space-y-1">
                {category.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (isMobileOpen && onMobileClose) onMobileClose();
                    }}
                    className={({ isActive }) => `
                      group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                        : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:text-[#D4AF37]'}`}>
                          {item.icon}
                        </span>
                        
                        {!isCollapsed && (
                          <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white dark:text-black' : ''}`}>
                            {item.label}
                          </span>
                        )}

                        {isCollapsed && (
                          <div className="absolute left-full ml-4 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-[10px] rounded 
                            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 
                            whitespace-nowrap z-50 pointer-events-none shadow-xl border border-gray-800 dark:border-gray-200">
                            {item.label}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Settings & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#0A0A0A]">
          <div className="space-y-1">
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                ${isActive 
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-black dark:hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Settings className="w-5 h-5" />
              {!isCollapsed && <span className="text-xs font-bold uppercase tracking-wider">Paramètres</span>}
            </NavLink>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
                ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="text-xs font-bold uppercase tracking-wider">Déconnexion</span>}
            </button>

            {!isCollapsed && (
              <div className="mt-4 pt-4 text-center border-t border-gray-200 dark:border-white/10">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  Prophétie Couture v3.0
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;