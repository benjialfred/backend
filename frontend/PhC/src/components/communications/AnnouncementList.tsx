import { useEffect, useState } from 'react';
import { announcementAPI } from '@/services/api';
import { Bell, Calendar, Trash2, Filter, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

interface Announcement {
    id: string;
    title: string;
    content: string;
    author_details: {
        nom: string;
        prenom: string;
    };
    created_at: string;
    expires_at?: string;
    is_public: boolean;
    target_role: string;
    author: number; // User ID
}

const AnnouncementList = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ACTIVE');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await announcementAPI.getAll();
            const results = Array.isArray(data) ? data : data.results || [];
            setAnnouncements(results);
        } catch (err) {
            console.error(err);
            toast.error('Impossible de charger les annonces');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await announcementAPI.delete(id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            toast.success('Annonce supprimée');
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de la suppression');
        }
    };

    const filteredAnnouncements = announcements.filter(ann => {
        const now = new Date();
        const expirationDate = ann.expires_at ? new Date(ann.expires_at) : null;
        const isExpired = expirationDate ? expirationDate < now : false;

        if (filter === 'ACTIVE') return !isExpired;
        if (filter === 'EXPIRED') return isExpired;
        return true;
    });

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            ALL: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            WORKER: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            APPRENTI: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            CLIENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        };
        const labels: Record<string, string> = {
            ALL: 'Tout le monde',
            WORKER: 'Employés',
            APPRENTI: 'Apprentis',
            CLIENT: 'Clients',
        };
        return (
            <span className={`px-2 py-1 text-xs rounded-full font-medium border ${styles[role] || styles.ALL}`}>
                {labels[role] || role}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Annonces  <span className="text-sm font-normal text-dark-600 dark:text-primary-300 ml-2">({filteredAnnouncements.length})</span>
                </h2>

                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setFilter('ACTIVE')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'ACTIVE' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Actives
                    </button>
                    <button
                        onClick={() => setFilter('EXPIRED')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'EXPIRED' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Expirées
                    </button>
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Toutes
                    </button>
                </div>
            </div>

            {filteredAnnouncements.length === 0 ? (
                <div className="p-12 bg-black rounded-xl shadow-lg border border-white/5 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-white">Aucune annonce trouvée</h3>
                    <p className="text-gray-400 mt-1">Essayez de modifier vos filtres.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAnnouncements.map((announcement) => (
                        <div key={announcement.id} className={`bg-black p-6 rounded-xl shadow-lg border transition-all ${filter === 'EXPIRED' ? 'border-red-900/30 opacity-75' : 'border-white/5 hover:border-orange-500/30'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {getRoleBadge(announcement.target_role)}
                                        {announcement.is_public && (
                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium border border-green-500/20">
                                                Public
                                            </span>
                                        )}
                                        {announcement.expires_at && (
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium border flex items-center gap-1 ${new Date(announcement.expires_at) < new Date() ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-dark-800 text-gray-300 border-gray-700'}`}>
                                                <Clock className="w-3 h-3" />
                                                Expire le {format(new Date(announcement.expires_at), 'dd MMM')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(announcement.id)}
                                        className="p-2 text-dark-600 dark:text-primary-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <p className="text-gray-300 mb-4 whitespace-pre-wrap">{announcement.content}</p>

                            <div className="flex items-center justify-between text-sm text-dark-600 dark:text-primary-300 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-xs text-orange-400 font-bold">
                                        {announcement.author_details?.prenom?.[0] || 'A'}
                                    </div>
                                    <span>
                                        {announcement.author_details?.prenom} {announcement.author_details?.nom}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {format(new Date(announcement.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                    </span>
                                </div>
                            </div>

                            {/* Delete Confirmation Modal/Overlay */}
                            {showDeleteConfirm === announcement.id && (
                                <div className="absolute inset-0 bg-black/90 flex items-center justify-center rounded-xl z-10 backdrop-blur-sm">
                                    <div className="text-center p-6">
                                        <p className="text-white font-medium mb-4">Confirmer la suppression ?</p>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => setShowDeleteConfirm(null)}
                                                className="px-4 py-2 rounded-lg bg-dark-800 text-white text-sm hover:bg-gray-700"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnouncementList;
