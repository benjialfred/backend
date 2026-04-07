
import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { X, Megaphone, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotificationBanner = () => {
    const { announcements } = useNotifications();
    const navigate = useNavigate();
    const [currentAnnouncement, setCurrentAnnouncement] = useState<any | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (announcements.length > 0) {
            // Filter out expired announcements
            const activeAnnouncements = announcements.filter(a => {
                if (a.expires_at) {
                    return new Date(a.expires_at) > new Date();
                }
                // If no expiration, fallback to 48h recency or keep it indefinitely? 
                // Let's say indefinite but prioritized by creation date
                return true;
            });

            if (activeAnnouncements.length > 0) {
                // Pick the most recent one
                const latest = activeAnnouncements[0];

                // Optional: Recency check (e.g., only show if created in last 72h OR it's marked as important/public)
                // For now, let's show the absolute latest active announcement
                setCurrentAnnouncement(latest);
                setVisible(true);
            }
        }
    }, [announcements]);

    if (!visible || !currentAnnouncement) return null;

    // Show for everyone, or restrict based on logic. 
    // User requested "Announcements for the client (top banner)" & "Buttons to delete or define duration"
    // So we should probably show this to everyone but tailored style.

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gradient-to-r from-primary-600 to-primary-500 text-white relative z-50 shadow-md"
                >
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <div className="p-2 bg-white/20 rounded-full shrink-0 animate-pulse">
                                <Megaphone className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                                <span className="font-bold text-xs uppercase tracking-wide bg-black/20 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                                    Nouveau
                                </span>
                                <p className="text-sm font-medium truncate sm:whitespace-normal">
                                    <span className="font-bold mr-2">{currentAnnouncement.title}:</span>
                                    <span className="opacity-90">{currentAnnouncement.content}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            {currentAnnouncement.expires_at && (
                                <div className="hidden md:flex items-center gap-1 text-xs text-white/70 bg-black/10 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" />
                                    <span>Expire: {new Date(currentAnnouncement.expires_at).toLocaleDateString()}</span>
                                </div>
                            )}
                            <button
                                onClick={() => navigate('/dashboard/announcements')}
                                className="hidden sm:block text-xs font-bold underline decoration-white/50 hover:decoration-white transition-all whitespace-nowrap"
                            >
                                Voir tout
                            </button>
                            <button
                                onClick={() => setVisible(false)}
                                className="p-1 hover:bg-black/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationBanner;
