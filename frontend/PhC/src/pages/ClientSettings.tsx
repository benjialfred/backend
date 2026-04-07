import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-hot-toast';
import {
    User,
    Bell,
    Shield,
    Smartphone,
    Moon,
    Sun,
    Monitor,
    Camera,
    Mail,
    MapPin,
    Phone,
    Save,
    Loader2
} from 'lucide-react';
// import DashboardNavbar from '@/components/layout/DashboardNavbar';

const ClientSettings = () => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');

    // États pour le formulaire de profil
    const [profileData, setProfileData] = useState({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        email: user?.email || '',
        telephone: user?.telephone || '',
        ville: user?.ville || '',
        pays: user?.pays || 'Cameroun',
        adresse: user?.adresse_livraison || ''
    });

    // États pour la sécurité
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Gestion de la sauvegarde du profil
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulation API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Profil mis à jour avec succès');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    // Gestion du mot de passe
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error('Les nouveaux mots de passe ne correspondent pas');
            return;
        }
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Mot de passe modifié avec succès');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error('Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', icon: User, label: 'Mon Profil' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'security', icon: Shield, label: 'Sécurité' },
        { id: 'appearance', icon: Monitor, label: 'Apparence' },
    ];

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Paramètres du compte</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez vos informations personnelles et préférences</p>
            </div>

                {/* Top Tabs Navigation (Replacing Sidebar) */}
                <div className="bg-white/80 dark:bg-[#111] backdrop-blur-md rounded-2xl p-2 shadow-sm border border-gray-200 dark:border-white/10 mb-8 flex flex-wrap gap-2">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-[11px] uppercase tracking-widest shadow-sm ${activeSection === item.id
                                ? 'bg-primary-500 text-black dark:text-gray-900 shadow-[0_4px_15px_rgba(132,204,22,0.3)] border border-primary-400'
                                : 'bg-white dark:bg-dark-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-white/5'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-white/90 dark:bg-[#111] backdrop-blur-md rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 p-6 md:p-8 animate-fade-in relative overflow-hidden">

                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />

                    {/* Section Profil */}
                    {activeSection === 'profile' && (
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-900 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-bold overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
                                        {user?.photo_profil ? (
                                            <img src={user.photo_profil} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            user?.prenom?.[0] || 'U'
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-primary-500 p-2 rounded-full text-white dark:text-black cursor-pointer hover:bg-primary-600 dark:hover:bg-primary-400 transition-colors shadow-sm border border-white dark:border-primary-400/20">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-2xl font-black font-serif text-gray-900 dark:text-white capitalize">
                                        {user?.prenom} {user?.nom}
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{user?.email}</p>
                                    <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-500/20">
                                        Compte Client
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Prénom</label>
                                        <input
                                            type="text"
                                            value={profileData.prenom}
                                            onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Nom</label>
                                        <input
                                            type="text"
                                            value={profileData.nom}
                                            onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                disabled
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-dark-950/50 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={profileData.telephone}
                                                onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Adresse de livraison</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <textarea
                                                value={profileData.adresse}
                                                onChange={(e) => setProfileData({ ...profileData, adresse: e.target.value })}
                                                rows={3}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none placeholder-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 bg-primary-500 text-black border border-primary-400 rounded-xl hover:bg-primary-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 font-bold text-xs uppercase tracking-widest shadow-[0_4px_15px_rgba(132,204,22,0.3)]"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Enregistrer
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Section Notifications */}
                    {activeSection === 'notifications' && (
                        <div className="relative z-10 animate-fade-in">
                            <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-6">Préférences de notifications</h2>
                            <div className="space-y-4">
                                {[
                                    { title: 'Commandes', desc: 'Mises à jour sur le statut de vos commandes', default: true },
                                    { title: 'Promotions', desc: 'Offres exclusives et réductions', default: false },
                                    { title: 'Newsletters', desc: 'Dernières tendances et actualités', default: true },
                                    { title: 'Sécurité', desc: 'Alertes de connexion et modifications de compte', default: true }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-colors bg-gray-50 dark:bg-dark-900/50">
                                        <div>
                                            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-200">{item.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 dark:bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border border-gray-300 dark:border-white/10 peer-checked:bg-primary-500 peer-checked:after:bg-white dark:peer-checked:after:bg-black shadow-inner"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section Apparence */}
                    {activeSection === 'appearance' && (
                        <div className="relative z-10 animate-fade-in">
                            <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-6">Thème de l'application</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: 'light', label: 'Clair', icon: Sun },
                                    { id: 'dark', label: 'Sombre', icon: Moon },
                                    { id: 'system', label: 'Système', icon: Smartphone },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as any)}
                                        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${theme === t.id
                                            ? 'border-primary-500/50 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm'
                                            : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-dark-900/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-white/10 hover:text-gray-900 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        <t.icon className="w-8 h-8" />
                                        <span className="font-bold text-[11px] uppercase tracking-widest">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section Sécurité */}
                    {activeSection === 'security' && (
                        <div className="relative z-10 animate-fade-in">
                            <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-6">Changer le mot de passe</h2>
                            <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Mot de passe actuel</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Confirmer</label>
                                    <input
                                        type="password"
                                        required
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                    />
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-primary-500 text-black border border-primary-400 rounded-xl hover:bg-primary-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 font-bold text-xs uppercase tracking-widest shadow-[0_4px_15px_rgba(132,204,22,0.3)] flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Mettre à jour le mot de passe
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default ClientSettings;
