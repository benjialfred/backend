
import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationAPI, announcementAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import type { Announcement } from '@/types';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    read: boolean;
    created_at: string;
}

interface NotificationContextType {
    notifications: Notification[];
    announcements: Announcement[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    announcements: [],
    unreadCount: 0,
    loading: false,
    markAsRead: async () => { },
    refresh: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading] = useState(false);

    const lastUnreadCountRef = React.useRef(0);
    const failCountRef = React.useRef(0);
    const MAX_FAILURES = 3;

    const fetchNotifications = async () => {
        if (!user) return;

        // Stop polling after too many consecutive failures
        if (failCountRef.current >= MAX_FAILURES) return;

        try {
            // Fetch personal notifications
            const notifsData: any = await notificationAPI.getAll();
            const notifs = Array.isArray(notifsData) ? notifsData : (notifsData.results || []);
            setNotifications(notifs);

            // Reset failure counter on success
            failCountRef.current = 0;

            const unreadCount = notifs.filter((n: Notification) => !n.read).length;

            if (unreadCount > 0 && unreadCount > lastUnreadCountRef.current) {
                toast('Vous avez de nouveaux messages. Allez les surveiller !', {
                    icon: '📬',
                    duration: 5000,
                    id: 'new-messages-toast',
                });
            }
            lastUnreadCountRef.current = unreadCount;

            // Fetch public/targeted announcements
            const ann = await announcementAPI.getAll();
            const annList = Array.isArray(ann) ? ann : ann.results || [];

            const visibleAnnouncements = annList.filter((a: Announcement) => {
                if (a.is_public) return true;
                if (!user) return false;
                if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
                if (a.target_role === 'ALL') return true;
                return a.target_role === user.role;
            });

            setAnnouncements(visibleAnnouncements);

        } catch (error) {
            failCountRef.current += 1;
            if (failCountRef.current < MAX_FAILURES) {
                console.warn(`Notifications: tentative ${failCountRef.current}/${MAX_FAILURES} échouée`);
            } else {
                console.warn('Notifications: arrêt du polling après 3 échecs consécutifs. Rechargez la page pour réessayer.');
            }
        }
    };

    useEffect(() => {
        if (user) {
            failCountRef.current = 0; // Reset on user change
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setAnnouncements([]);
            lastUnreadCountRef.current = 0;
            failCountRef.current = 0;
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking notification as read', error);
        }
    };

    const refresh = () => {
        fetchNotifications();
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, announcements, unreadCount, loading, markAsRead, refresh }}>
            {children}
        </NotificationContext.Provider>
    );
};
