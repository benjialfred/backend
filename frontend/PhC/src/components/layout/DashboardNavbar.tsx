import {
    LogOut,
    LayoutDashboard,
    Settings,
    ShoppingBag,
    Menu,
    Briefcase,
    Users,
    Book,
    FolderPlus,
    Package
} from 'lucide-react';
import NotificationMenu from '@/components/communications/NotificationMenu';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardNavbar = ({ title, subtitle, navItems }: { title: string; subtitle?: string; navItems?: { label: string; path: string; icon: any }[] }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Default nav items based on role if not provided
    const defaultNavItems = (() => {
        switch (user?.role) {
            case 'ADMIN':
            case 'SUPER_ADMIN':
                return [
                    { label: "Vue d'ensemble", path: '/dashboard', icon: LayoutDashboard },
                    { label: 'Produits', path: '/dashboard/products', icon: Package },
                    { label: 'Utilisateurs', path: '/dashboard/users', icon: Users },
                    { label: 'Commandes', path: '/dashboard/orders', icon: ShoppingBag },
                    { label: 'Paramètres', path: '/dashboard/settings', icon: Settings },
                ];
            case 'WORKER':
                return [
                    { label: "Vue d'ensemble", path: '/dashboard#overview', icon: Briefcase },
                    { label: 'Projets', path: '/dashboard#projects', icon: FolderPlus },
                    { label: 'Équipe', path: '/dashboard#team', icon: Users },
                    { label: 'Journaux', path: '/dashboard#journals', icon: Book },
                ];
            case 'APPRENTI':
                return [
                    { label: "Vue d'ensemble", path: '/dashboard#overview', icon: LayoutDashboard },
                    { label: 'Projets', path: '/dashboard#projects', icon: Briefcase },
                    { label: 'Matériels', path: '/dashboard#materials', icon: Package },
                ];
            case 'CLIENT':
            default:
                return [];
        }
    })();

    const items = navItems || defaultNavItems;

    const handleNavigation = (path: string) => {
        if (path.includes('#')) {
            const [base, hash] = path.split('#');
            if (location.pathname !== base && base) {
                navigate(base);
                setTimeout(() => {
                    window.location.hash = hash;
                }, 100);
            } else {
                window.location.hash = hash;
            }
        } else {
            navigate(path);
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-sm dark:shadow-glass h-16 transition-all duration-300">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div
                            onClick={() => navigate('/dashboard')}
                            className="flex flex-col cursor-pointer group"
                        >
                            <h1 className="text-lg font-bold font-display tracking-wide text-gray-900 dark:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(14,165,233,0.8)]">
                                {title || 'PhC Admin'}
                            </h1>
                            {subtitle && (
                                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-widest hidden sm:block">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1.5 p-1 bg-gray-100/50 dark:bg-[#000000]/50 rounded-full border border-gray-200/50 dark:border-white/5">
                        {items.map((item, index) => {
                            const isActive = location.pathname === item.path || (location.hash && item.path.endsWith(location.hash));
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-widest font-bold transition-all duration-300 overflow-hidden ${isActive
                                        ? 'text-gray-900 dark:text-white shadow-[0_0_15px_rgba(14,165,233,0.2)] bg-transparent'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 dark:from-primary-500/20 dark:to-accent-500/20 border border-gray-200/50 dark:border-white/10 rounded-full" />
                                    )}
                                    <item.icon className={`w-4 h-4 text-primary-400 relative z-10 ${isActive ? 'drop-shadow-[0_0_5px_rgba(14,165,233,0.8)]' : 'opacity-70'}`} />
                                    <span className="relative z-10">{item.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block">
                            <LanguageSwitcher />
                        </div>
                        <div className="relative">
                            <NotificationMenu />
                        </div>

                        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>

                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right hidden sm:block cursor-pointer" onClick={() => navigate('/client/settings')}>
                                <p className="text-sm font-bold font-display text-gray-900 dark:text-white leading-none hover:text-primary-500 transition-colors drop-shadow-md">{user?.prenom}</p>
                                <p className="text-[10px] text-primary-500 font-bold uppercase mt-1 tracking-widest">{user?.role?.replace('_', ' ')}</p>
                            </div>

                            <div className="relative group">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 p-[1.5px] cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.3)] dark:shadow-[0_0_10px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.8)] transition-all duration-300 hover:scale-105">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-dark-950 flex items-center justify-center overflow-hidden">
                                        {user?.photo_profil ? (
                                            <img src={user.photo_profil} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.prenom?.[0]?.toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Dropdown Logout */}
                                <div className="absolute right-0 top-full mt-3 w-48 bg-white/95 dark:bg-[#0a0a0a]/90 backdrop-blur-xl rounded-xl shadow-lg dark:shadow-glass border border-gray-200 dark:border-white/10 p-1.5 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 flex flex-col gap-1">
                                    <div className="px-3 py-2 border-b border-gray-100 dark:border-white/5 mb-1 sm:hidden">
                                        <p className="text-sm font-bold font-display text-gray-900 dark:text-white">{user?.prenom}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-primary-500 font-bold">{user?.role}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/client/settings')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/5"
                                    >
                                        <Settings className="w-4 h-4 text-primary-500" />
                                        Mon Profil
                                    </button>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Se déconnecter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-dark-900 border-r border-white/10 z-50 md:hidden shadow-glass flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-[50px] -mr-16 -mt-16" />
                                <h2 className="text-xl font-bold font-display tracking-wide glow-text relative z-10">
                                    Menu
                                </h2>
                            </div>

                            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                                {items.map((item, index) => {
                                    const isActive = location.pathname === item.path || (location.hash && item.path.endsWith(location.hash));
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleNavigation(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden ${isActive
                                                ? 'text-white border border-white/10 bg-white/5'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 opacity-50" />
                                            )}
                                            {isActive && (
                                                <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-primary-400 to-accent-400 rounded-r-md" />
                                            )}
                                            <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary-400 drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]' : ''}`} />
                                            <span className="relative z-10">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-dark-950/50">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 border border-transparent hover:border-red-500/30 rounded-xl font-medium hover:bg-red-500/20 transition-all shadow-glass"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Se déconnecter
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Lien Paramètres flottant (Client) */}
            {user?.role === 'CLIENT' && (
                <button
                    onClick={() => navigate('/client/settings')}
                    className="fixed bottom-8 right-8 z-[100] p-4 bg-dark-800/80 backdrop-blur-xl border border-white/10 text-primary-400 hover:text-white hover:bg-primary-500/20 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all hover:scale-110 group"
                    title="Aller aux paramètres"
                >
                    <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                </button>
            )}
        </>
    );
};

export default DashboardNavbar;
