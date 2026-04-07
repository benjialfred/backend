import { useState, useEffect } from 'react';
import { notificationAPI, type AppNotification } from '@/services/mockNotificationAPI';
import { Bell, Check, Package, Sparkles, Scissors, Clock, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navigation from '@/components/Navigation';

const ClientNotifications = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await notificationAPI.getAll();
            setNotifications(data.results || []);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const markAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Error", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error", error);
        }
    };

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'UserRegistered': return <Sparkles className="w-5 h-5" />;
            case 'OrderCreated': return <Package className="w-5 h-5" />;
            case 'MeasurementsAdded': return <Scissors className="w-5 h-5" />;
            case 'OrderInProduction': return <Clock className="w-5 h-5" />;
            case 'OrderCompleted': return <CheckCircle className="w-5 h-5" />;
            case 'AppointmentScheduled': return <Calendar className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] font-sans pt-24 pb-12">
            <Navigation />
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative z-10 px-4 md:px-8 text-gray-900 dark:text-white">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Historique des Notifications</h1>
                        <p className="text-gray-500 mt-2 text-sm">Retrouvez ici toutes vos alertes et jalons de confection.</p>
                    </div>
                    {notifications.some(n => !n.is_read) && (
                        <button 
                            onClick={markAllAsRead}
                            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm"
                        >
                            Tout marquer comme lu
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-16 text-center shadow-sm">
                        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Aucune notification</h3>
                        <p className="text-gray-500">Votre historique est vide pour le moment.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
                        <ul className="divide-y divide-gray-100 dark:divide-white/5">
                            {notifications.map((notif) => (
                                <li 
                                    key={notif.id} 
                                    className={`p-6 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 flex gap-6 ${!notif.is_read ? 'bg-gray-50/50 dark:bg-[#1a1a1a]' : ''}`}
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!notif.is_read ? 'bg-white dark:bg-black shadow-md ring-1 ring-gray-200 dark:ring-white/10 text-black dark:text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600'}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-base tracking-tight ${!notif.is_read ? 'font-black leading-snug text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold whitespace-nowrap ml-4">
                                                {format(new Date(notif.created_at), "d MMM yyyy, HH:mm", { locale: fr })}
                                            </p>
                                        </div>
                                        
                                        {!notif.is_read && (
                                            <div className="mt-4 flex">
                                                <button 
                                                    onClick={(e) => markAsRead(notif.id, e)} 
                                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white px-3 py-1.5 rounded-full transition-colors"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Marquer lu
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientNotifications;
