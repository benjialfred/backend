import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Package, Sparkles, Scissors, Clock, Calendar, CheckCircle } from 'lucide-react';
import { notificationAPI, type AppNotification } from '@/services/mockNotificationAPI'; // API Mock connectée
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationMenu = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await notificationAPI.getAll();
            setNotifications(data.results || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error marking all as read", error);
        }
    };

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'UserRegistered': return <Sparkles className="w-5 h-5 text-gray-900 dark:text-white" />;
            case 'OrderCreated': return <Package className="w-5 h-5 text-gray-900 dark:text-white" />;
            case 'MeasurementsAdded': return <Scissors className="w-5 h-5 text-gray-900 dark:text-white" />;
            case 'OrderInProduction': return <Clock className="w-5 h-5 text-gray-900 dark:text-white" />;
            case 'OrderCompleted': return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
            case 'AppointmentScheduled': return <Calendar className="w-5 h-5 text-gray-900 dark:text-white" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white dark:ring-[#0a0a0a] shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[340px] md:w-[400px] bg-white dark:bg-[#111] backdrop-blur-3xl rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-black/20">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-[11px]">Notifications</h3>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="text-[10px] uppercase font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {loading && notifications.length === 0 ? (
                                <div className="p-12 flex justify-center">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-10 text-center flex flex-col items-center">
                                    <Bell className="w-8 h-8 mb-3 text-gray-300 dark:text-gray-700" />
                                    <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Aucune notification</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50 dark:divide-white/5">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors relative group cursor-pointer ${!notif.is_read ? 'bg-gray-50/50 dark:bg-[#1a1a1a]' : 'opacity-70'}`}
                                            onClick={(e) => !notif.is_read && markAsRead(notif.id, e)}
                                        >
                                            <div className="flex gap-4">
                                                <div className="mt-1 flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.is_read ? 'bg-white dark:bg-black shadow-sm ring-1 ring-gray-200 dark:ring-white/10' : 'bg-transparent'}`}>
                                                       {getIcon(notif.type)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm tracking-tight leading-snug ${!notif.is_read ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                       <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                                           {format(new Date(notif.created_at), "d MMM, HH:mm", { locale: fr })}
                                                       </p>
                                                       {!notif.is_read && <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {!notif.is_read && (
                                                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => markAsRead(notif.id, e)}
                                                            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/20 rounded transition-all bg-white dark:bg-black"
                                                            title="Marquer comme lu"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer (Link to History) */}
                        <div className="p-3 bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/10 text-center">
                            <button 
                               onClick={() => { setIsOpen(false); navigate('/client/notifications'); }} 
                               className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white hover:underline"
                            >
                                Voir tout l'historique
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationMenu;
