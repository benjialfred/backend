import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Settings, ShoppingBag, Ruler, Bell, ArrowLeft, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';

import ClientSettings from '@/pages/ClientSettings';
import ClientMeasurements from '@/components/Dashboard/client/ClientMeasurements';
import ClientOrders from '@/pages/ClientOrders';
import ClientComments from '@/components/Dashboard/client/ClientComments';

type Tab = 'dashboard' | 'orders' | 'measurements' | 'settings' | 'comments';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'CLIENT') {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'dashboard', label: 'Vue d\'ensemble', icon: Bell },
    { id: 'orders', label: 'Mes Commandes', icon: ShoppingBag },
    { id: 'measurements', label: 'Mes Mesures', icon: Ruler },
    { id: 'comments', label: 'Mes Avis', icon: MessageCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ] as const;

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        return <ClientOrders />;
      case 'settings':
        return <ClientSettings />;
      case 'measurements':
        return <ClientMeasurements />;
      case 'comments':
        return <ClientComments />;
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Bienvenue, {user.prenom}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="glass-panel p-5 md:p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Commandes Récentes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualisez le suivi de vos tenues sur mesure.</p>
                <button onClick={() => handleTabChange('orders')} className="mt-4 text-primary-500 text-sm font-bold flex items-center gap-1 hover:underline">
                  Voir <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="glass-panel p-5 md:p-6 rounded-2xl">
                 <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Vos Mesures</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Mettez à jour vos mesures pour un ajustement parfait.</p>
                 <button onClick={() => handleTabChange('measurements')} className="mt-4 text-primary-500 text-sm font-bold flex items-center gap-1 hover:underline">
                  Mettre à jour <ArrowLeft className="w-4 h-4 rotate-180" />
                 </button>
              </div>
              <div className="glass-panel p-5 md:p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Vos Avis</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Consultez et gérez vos commentaires et avis.</p>
                <button onClick={() => handleTabChange('comments')} className="mt-4 text-primary-500 text-sm font-bold flex items-center gap-1 hover:underline">
                  Voir <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
              <div className="glass-panel p-5 md:p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Paramètres</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Modifiez votre profil et vos préférences.</p>
                <button onClick={() => handleTabChange('settings')} className="mt-4 text-primary-500 text-sm font-bold flex items-center gap-1 hover:underline">
                  Configurer <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] font-sans selection:bg-primary-500 selection:text-white pt-20 md:pt-24 pb-24 md:pb-12">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
           <h1 className="text-2xl md:text-4xl font-serif font-black text-gray-900 dark:text-white mb-1 md:mb-2">
             Mon Espace Personnel
           </h1>
           <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">Gérez vos commandes, vos mesures et vos paramètres.</p>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white font-bold shadow-sm"
          >
            <div className="flex items-center gap-3">
              {(() => {
                const Tab = tabs.find(t => t.id === activeTab);
                const Icon = Tab?.icon || Bell;
                return <Icon className="w-5 h-5 text-primary-500" />;
              })()}
              <span>{activeTabLabel}</span>
            </div>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xl"
              >
                <div className="p-2 space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm w-full text-left ${
                          activeTab === tab.id
                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <div className="h-px bg-gray-200 dark:bg-white/10 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar (desktop only) */}
          <div className="hidden md:block w-64 flex-shrink-0">
             <div className="glass-panel p-4 rounded-2xl sticky top-32 flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                        activeTab === tab.id
                          ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}

                <div className="h-px bg-gray-200 dark:bg-white/10 my-4 mx-2" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Déconnexion
                </button>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
               >
                 {renderContent()}
               </motion.div>
             </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Floating Social Buttons */}
      <div className="fixed bottom-20 md:bottom-6 right-4 flex flex-col gap-3 z-50">
        {/* Facebook */}
        <a
          href="https://www.facebook.com/prophetiquecouture"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1877F2] text-white p-3.5 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center group"
          title="Suivez-nous sur Facebook"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Facebook
          </span>
        </a>
        
        {/* WhatsApp */}
        <a
          href="https://wa.me/237680655136"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all flex items-center justify-center group"
          title="Contactez-nous sur WhatsApp"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Besoin d'aide ? Contactez-nous
          </span>
        </a>
      </div>
    </div>
  );
};

export default ClientDashboard;
