import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

interface MenuItem {
    path: string;
    label: string;
    icon?: React.ElementType; // Lucide Icon
}

interface ButterflyMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
    user?: any; // Pass user for profile section if needed
    logout?: () => void;
}

const ButterflyMenu: React.FC<ButterflyMenuProps> = ({ isOpen, onClose, menuItems, user, logout }) => {

    // Animation Variants
    const menuVariants = {
        closed: {
            opacity: 0,
            x: "100%", // Slide in from right generic
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 40
            } as any
        },
        open: {
            opacity: 1,
            x: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 40,
                staggerChildren: 0.1,
                delayChildren: 0.2
            } as any
        }
    };

    const itemVariants = {
        closed: { x: 50, opacity: 0 },
        open: { x: 0, opacity: 1 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm md:hidden"
                    />

                    {/* Menu Panel */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        className="fixed inset-y-0 right-0 z-[70] w-[85%] max-w-sm bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-3xl border-l border-gray-200/50 dark:border-white/10 shadow-2xl md:hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="relative z-10 p-6 flex justify-between items-center border-b border-gray-200/50 dark:border-white/10">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Menu</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-900 dark:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2">
                            {menuItems.map((item) => (
                                <motion.div key={item.path} variants={itemVariants}>
                                    <NavLink
                                        to={item.path}
                                        onClick={onClose}
                                        className={({ isActive }) => `
                                            group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border border-transparent
                                            ${isActive
                                                ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }
                                        `}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <div className="flex items-center gap-4">
                                                    {item.icon && (
                                                        <div className={`
                                                            p-2.5 rounded-xl transition-all duration-500
                                                            ${isActive 
                                                              ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm border border-gray-200/50 dark:border-white/10 rotate-3' 
                                                              : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-white/10 group-hover:text-gray-900 dark:group-hover:text-white'}
                                                        `}>
                                                            <item.icon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <span className={`font-bold text-lg ${isActive ? 'tracking-wide' : ''}`}>{item.label}</span>
                                                </div>

                                                {/* Butterfly Indicator */}
                                                {isActive ? (
                                                    <motion.div
                                                        layoutId="activeButterfly"
                                                        className="w-2 h-2 rounded-full bg-primary-500"
                                                    />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer / User Profile */}
                        {user && (
                            <motion.div
                                variants={itemVariants}
                                className="relative z-10 p-6 border-t border-gray-200/50 dark:border-white/10 bg-gray-50/50 dark:bg-white/5"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary-400 to-primary-600 p-[2px] shadow-lg">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center overflow-hidden border-2 border-white dark:border-black">
                                            {user?.photo_profil ? (
                                                <img src={user.photo_profil} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-900 dark:text-white font-bold text-lg">{user?.prenom?.[0] || 'U'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{user.prenom} {user.nom}</p>
                                        <p className="text-[10px] text-primary-500 font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { logout?.(); onClose(); }}
                                    className="w-full py-3.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-colors border border-gray-200/50 dark:border-white/10"
                                >
                                    Déconnexion
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ButterflyMenu;
