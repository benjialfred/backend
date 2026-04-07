
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

    const fetchNotifications = async () => {
        if (!user) return;

        try {
            // Fetch personal notifications
            const notifsData: any = await notificationAPI.getAll();
            const notifs = Array.isArray(notifsData) ? notifsData : (notifsData.results || []);
            setNotifications(notifs);

            const unreadCount = notifs.filter((n: Notification) => !n.read).length;

            // Notify only if we have NEW unread messages (count increased)
            // or if it's the first load (lastRef is 0) and we have unread messages.
            // But to avoid spam on reload, maybe we only want to notify if count INCREASES from a non-zero value?
            // User request: "retire tous les doublons".
            // Let's being conservative: Notify only if unreadCount > lastUnreadCountRef.current
            // This means on first load (0->N), it notifies. On poll (N->N), it doesn't.
            // On new message (N->N+1), it notifies.
            if (unreadCount > 0 && unreadCount > lastUnreadCountRef.current) {
                toast('Vous avez de nouveaux messages. Allez les surveiller !', {
                    icon: '📬',
                    duration: 5000,
                    id: 'new-messages-toast', // dedupe ID
                });
            }
            lastUnreadCountRef.current = unreadCount;

            // Fetch public/targeted announcements
            const ann = await announcementAPI.getAll();
            const annList = Array.isArray(ann) ? ann : ann.results || [];

            // Client-side filtering if backend doesn't filter perfectly (it should though)
            const visibleAnnouncements = annList.filter((a: Announcement) => {
                if (a.is_public) return true;
                if (!user) return false;
                if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
                if (a.target_role === 'ALL') return true;
                return a.target_role === user.role;
            });

            setAnnouncements(visibleAnnouncements);

        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setAnnouncements([]);
            lastUnreadCountRef.current = 0; // Reset count on logout
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
