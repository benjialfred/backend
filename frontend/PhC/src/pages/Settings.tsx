// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  Save,
  Upload,
  Bell,
  Lock,
  Globe,
  CreditCard,
  Users,
  Palette,
  Truck,
  Shield,
  X,
  CheckCircle,
  Copy,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = {
  // Général
  siteName: 'Proph Couture',
  siteDescription: 'Maison de couture pour accompagner tous vos évènements',
  siteLogo: '',
  siteFavicon: '',

  // Notifications
  emailNotifications: true,
  pushNotifications: true,
  orderNotifications: true,
  stockNotifications: true,

  // Sécurité
  requireTwoFactor: false,
  sessionTimeout: 30,
  passwordMinLength: 8,

  // Paiement
  stripeEnabled: true,
  paypalEnabled: false,
  mobileMoneyEnabled: true,
  nelsiusPublicKey: 'pk_x9vweLequ9dCuf3Oq5IW3cJTN0JBFsqT',
  currency: 'XAF',

  // Livraison
  shippingEnabled: true,
  freeShippingThreshold: 50,
  shippingCost: 1500,

  // Apparence
  primaryColor: '#daf63bff',
  secondaryColor: '#f6e75cff',
  theme: 'light',
};

const Settings = () => {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // 2FA State
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('admin_global_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData: any = await authAPI.getProfile();
      setSettings((prev: any) => ({
        ...prev,
        requireTwoFactor: userData.two_factor_enabled || false
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    if (enable) {
      // Start Setup
      try {
        setLoading(true);
        const data: any = await authAPI.setup2FA({});
        setQrCode(data.qr_code);
        setSecret(data.secret);
        setShow2FAModal(true);
      } catch (error) {
        toast.error('Erreur lors de l\'initialisation A2F');
      } finally {
        setLoading(false);
      }
    } else {
      // Disable
      if (window.confirm("Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ?")) {
        try {
          setLoading(true);
          await authAPI.disable2FA();
          setSettings((prev: any) => ({ ...prev, requireTwoFactor: false }));
          toast.success('2FA Désactivé');
          fetchUserProfile();
        } catch (error) {
          toast.error('Erreur lors de la désactivation');
        } finally {
          setLoading(false);
        }
      } else {
        // Revert checkbox if cancelled
        setSettings((prev: any) => ({ ...prev, requireTwoFactor: true }));
      }
    }
  };

  const verify2FA = async () => {
    try {
      setVerifying2FA(true);
      await authAPI.verify2FA({ otp });
      toast.success('Authentification à deux facteurs activée !');
      setShow2FAModal(false);
      setSettings((prev: any) => ({ ...prev, requireTwoFactor: true }));
      fetchUserProfile();
    } catch (error) {
      toast.error('Code invalide');
    } finally {
      setVerifying2FA(false);
      setOtp('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    // Simuler l'enregistrement API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sauvegarder dans localStorage
    localStorage.setItem('admin_global_settings', JSON.stringify(settings));

    setLoading(false);
    toast.success("Paramètres enregistrés et persistés localement !");
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: <Globe className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: 'Sécurité', icon: <Lock className="w-5 h-5" /> },
    { id: 'payment', label: 'Paiement', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'shipping', label: 'Livraison', icon: <Truck className="w-5 h-5" /> },
    { id: 'appearance', label: 'Apparence', icon: <Palette className="w-5 h-5" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <AdminLayout>
      <div className="">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Paramètres</h1>
          <p className="text-dark-600 dark:text-primary-300 dark:text-gray-400">Configurez les paramètres globaux de votre boutique</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation latérale */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#1f2940] rounded-xl shadow-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] p-4 sticky top-24">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                      ? 'bg-primary-500/10 text-primary-500 border-l-4 border-primary-500 font-bold'
                      : 'text-dark-600 dark:text-primary-300 dark:text-gray-400 hover:bg-[#2d2f5e] hover:text-dark-900 dark:text-white'
                      }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu des paramètres */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1f2940] rounded-xl shadow-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] p-6">
              {/* Général */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Paramètres généraux</h2>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                      Description du site
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                      Logo du site
                    </label>
                    <div className="flex items-center gap-4">
                      {settings.siteLogo ? (
                        <img
                          src={settings.siteLogo}
                          alt="Logo"
                          className="w-32 h-32 object-contain"
                        />
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg flex items-center justify-center bg-white dark:bg-[#141b2d]">
                          <Upload className="w-8 h-8 text-dark-600 dark:text-primary-300 dark:text-gray-400" />
                        </div>
                      )}
                      <button className="px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] text-dark-900 dark:text-white rounded-lg hover:bg-[#2d2f5e] transition-colors">
                        Changer le logo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Paramètres de notifications</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141b2d] rounded-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">Notifications par email</p>
                        <p className="text-sm text-dark-600 dark:text-primary-300 dark:text-gray-400">Recevez les notifications importantes par email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2d2f5e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141b2d] rounded-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">Notifications push</p>
                        <p className="text-sm text-dark-600 dark:text-primary-300 dark:text-gray-400">Recevez des notifications en temps réel</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.pushNotifications}
                          onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2d2f5e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141b2d] rounded-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">Notifications de commande</p>
                        <p className="text-sm text-dark-600 dark:text-primary-300 dark:text-gray-400">Soyez notifié des nouvelles commandes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.orderNotifications}
                          onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2d2f5e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Sécurité */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Paramètres de sécurité</h2>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                      Longueur minimale du mot de passe
                    </label>
                    <input
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                      min="6"
                      max="20"
                      className="w-full px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141b2d] rounded-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                    <div>
                      <p className="font-medium text-dark-900 dark:text-white">Authentification à deux facteurs</p>
                      <p className="text-sm text-dark-600 dark:text-primary-300 dark:text-gray-400">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireTwoFactor}
                        onChange={(e) => handleToggle2FA(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#2d2f5e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                      Délai d'expiration de session (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                      min="5"
                      max="240"
                      className="w-full px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Paiement */}
              {activeTab === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Paramètres de paiement</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141b2d] rounded-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">Stripe</p>
                        <p className="text-sm text-dark-600 dark:text-primary-300 dark:text-gray-400">Paiements par carte bancaire</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.stripeEnabled}
                          onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2d2f5e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#141b2d] rounded-lg border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-white">Mobile Money</p>
                        <p className="text-sm text-dark-600 dark:text-primary-300 dark:text-gray-400">Paiements par Orange Money/MTN Mobile Money</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.mobileMoneyEnabled}
                          onChange={(e) => setSettings({ ...settings, mobileMoneyEnabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#2d2f5e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                        Clé Publique Nelsius
                      </label>
                      <input
                        type="text"
                        value={settings.nelsiusPublicKey}
                        onChange={(e) => setSettings({ ...settings, nelsiusPublicKey: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300 mb-2">
                        Devise
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar ($)</option>
                        <option value="XAF">Franc CFA (FCFA)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Apparence */}
              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Personnalisation de l'interface</h2>

                  {/* Mode Sombre / Clair */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300">Mode d'affichage</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'light'
                          ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                          : 'bg-white dark:bg-[#141b2d] border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] text-dark-600 dark:text-primary-300 dark:text-gray-400 hover:border-gray-600'
                          }`}
                      >
                        <Sun className="w-6 h-6" />
                        <span className="text-sm font-medium">Clair</span>
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'dark'
                          ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                          : 'bg-white dark:bg-[#141b2d] border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] text-dark-600 dark:text-primary-300 dark:text-gray-400 hover:border-gray-600'
                          }`}
                      >
                        <Moon className="w-6 h-6" />
                        <span className="text-sm font-medium">Sombre</span>
                      </button>
                      <button
                        onClick={() => setTheme('system')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${theme === 'system'
                          ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                          : 'bg-white dark:bg-[#141b2d] border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] text-dark-600 dark:text-primary-300 dark:text-gray-400 hover:border-gray-600'
                          }`}
                      >
                        <Monitor className="w-6 h-6" />
                        <span className="text-sm font-medium">Système</span>
                      </button>
                    </div>
                  </div>

                  {/* Thème Couleur */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-dark-700 dark:text-primary-200 dark:text-gray-300">Couleur d'accentuation</h3>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { id: 'orange', label: 'Orange', color: 'bg-orange-500' },
                        { id: 'blue', label: 'Vert Citron (Actuel)', color: 'bg-primary-500' },
                        { id: 'green', label: 'Vert Nature', color: 'bg-green-500' },
                        { id: 'purple', label: 'Violet Royal', color: 'bg-accent-500' },
                        { id: 'red', label: 'Rouge Intense', color: 'bg-red-500' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setColorTheme(t.id as any)}
                          className={`group relative flex items-center gap-3 p-3 rounded-xl border transition-all min-w-[160px] ${colorTheme === t.id
                            ? 'bg-white/10 border-white text-dark-900 dark:text-white'
                            : 'bg-white dark:bg-[#141b2d] border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] text-dark-600 dark:text-primary-300 dark:text-gray-400 hover:border-gray-600'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${t.color} shadow-lg flex items-center justify-center`}>
                            {colorTheme === t.id && <CheckCircle className="w-5 h-5 text-dark-900 dark:text-white" />}
                          </div>
                          <span className="text-sm font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-6 bg-white dark:bg-[#141b2d] rounded-xl border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">Aperçu des composants</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                      <button className="bg-primary-500 text-black px-4 py-2 rounded-lg font-bold shadow-lg shadow-primary-500/20">
                        Bouton Principal
                      </button>
                      <button className="border border-primary-500 text-primary-500 px-4 py-2 rounded-lg font-bold">
                        Bouton Secondaire
                      </button>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="text-primary-500 focus:ring-primary-500 rounded" />
                        <span className="text-dark-700 dark:text-primary-200 dark:text-gray-300">Checkbox</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="radio" checked readOnly className="text-primary-600 focus:ring-primary-500" />
                        <span className="text-dark-700 dark:text-primary-200 dark:text-gray-300">Radio</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton de sauvegarde */}
              <div className="mt-8 pt-6 border-t border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 transition-all shadow-md shadow-primary-500/20 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Sauvegarder les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1f2940] rounded-2xl shadow-2xl w-full max-w-md border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e]">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-dark-900 dark:text-white flex items-center">
                    <Shield className="w-6 h-6 mr-2 text-primary-400" />
                    Configuration A2F
                  </h3>
                  <button
                    onClick={() => {
                      setShow2FAModal(false);
                      setSettings((prev: any) => ({ ...prev, requireTwoFactor: false }));
                    }}
                    className="text-dark-600 dark:text-primary-300 dark:text-gray-400 hover:text-dark-900 dark:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="text-dark-700 dark:text-primary-200 dark:text-gray-300 text-sm">
                    1. Installez une application d'authentification (Google Authenticator, Authy, etc.).
                    <br />
                    2. Scannez le QR code ci-dessous.
                  </div>

                  <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-xl">
                    <img src={qrCode} alt="QR Code A2F" className="w-48 h-48" />
                    <div className="flex items-center gap-2 w-full">
                      <code className="flex-1 bg-primary-50 text-gray-800 p-2 rounded text-center text-sm break-all font-mono">
                        {secret}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(secret);
                          toast.success('Copié !');
                        }}
                        className="p-2 bg-primary-50 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        title="Copier le code secret"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-dark-700 dark:text-primary-200 dark:text-gray-300">3. Entrez le code généré</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Ex: 123456"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-white dark:bg-[#141b2d] border border-primary-500/50 dark:border-dark-700 dark:border-[#2d2f5e] rounded-lg text-dark-900 dark:text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>

                  <button
                    onClick={verify2FA}
                    disabled={otp.length !== 6 || verifying2FA}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-black font-bold rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    {verifying2FA ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Vérifier et Activer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Settings;
