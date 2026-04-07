import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, Plus, Search, Edit2, Trash2,
    X, Check, Image as ImageIcon, Filter, PartyPopper
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import { eventAPI } from '@/services/api';
import type { Event } from '@/types';
import EventsChart from '@/components/Dashboard/EventsChart';

const AdminEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'AUTRE',
        date: new Date().toISOString().split('T')[0],
        location: '',
        image: null as File | null,
        is_active: true
    });

    const categories = [
        { value: 'DEFILE', label: 'Défilé de Mode' },
        { value: 'SOUTENANCE', 'label': 'Soutenance' },
        { value: 'DON', label: 'Don Caritatif' },
        { value: 'PARTENARIAT', label: 'Partenariat' },
        { value: 'AUTRE', label: 'Autre' }
    ];

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const data = await eventAPI.getAll();
            setEvents(Array.isArray(data) ? data : (data as any).results || []);
        } catch (error) {
            console.error('Failed to load events', error);
            toast.error('Impossible de charger les évènements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'AUTRE',
            date: new Date().toISOString().split('T')[0],
            location: '',
            image: null,
            is_active: true
        });
        setEditingEvent(null);
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            category: event.category,
            date: event.date,
            location: event.location || '',
            image: null,
            is_active: event.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet évènement ?')) {
            try {
                await eventAPI.delete(id);
                toast.success('Évènement supprimé');
                fetchEvents();
            } catch (error) {
                toast.error('Erreur lors de la suppression');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('date', formData.date);
            data.append('location', formData.location);
            data.append('is_active', String(formData.is_active));

            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingEvent) {
                await eventAPI.update(editingEvent.id, data);
                toast.success('Évènement modifié avec succès');
            } else {
                await eventAPI.create(data);
                toast.success('Évènement créé avec succès');
            }

            setShowModal(false);
            resetForm();
            fetchEvents();
        } catch (error: any) {
            console.error('Error submitting event:', error);
            toast.error('Une erreur est survenue lors de l\'opération');
        }
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <PartyPopper className="w-8 h-8 text-primary-500" />
                            Gestion des Évènements
                        </h1>
                        <p className="text-gray-400">Gérez les actualités et moments forts de l'entreprise</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-black font-bold rounded-xl hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvel Évènement
                    </button>
                </div>

                {/* Performance Events */}
                <div className="mb-8 max-w-lg mx-auto lg:max-w-none lg:w-1/3">
                    <EventsChart />
                </div>

                {/* Filtres et Recherche */}
                <div className="bg-black border border-white/5 p-4 rounded-xl shadow-sm mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-600 dark:text-primary-300" />
                        <input
                            type="text"
                            placeholder="Rechercher un évènement..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button className="p-2 border border-white/10 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Liste */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredEvents.map((event) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-black rounded-xl shadow-sm overflow-hidden border border-white/5 group hover:border-primary-500/30 transition-all"
                                >
                                    <div className="relative h-48">
                                        <img
                                            src={event.image || 'https://via.placeholder.com/400x200'}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(event)}
                                                className="p-2 bg-black/80 backdrop-blur-md rounded-full text-primary-400 hover:bg-black border border-white/10"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(event.id)}
                                                className="p-2 bg-black/80 backdrop-blur-md rounded-full text-red-500 hover:bg-black border border-white/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <span className="absolute bottom-2 left-2 px-3 py-1 bg-black/80 text-primary-400 border border-primary-500/20 text-xs rounded-full backdrop-blur-md font-bold">
                                            {event.category}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">{event.title}</h3>
                                            {event.is_active ? (
                                                <span className="w-2 h-2 rounded-full bg-green-500 mt-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" title="Actif"></span>
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-red-500 mt-2" title="Inactif"></span>
                                            )}
                                        </div>
                                        <p className="text-dark-600 dark:text-primary-300 text-sm mb-4 line-clamp-2">{event.description}</p>

                                        <div className="flex items-center gap-4 text-xs text-dark-600 dark:text-primary-300 border-t border-white/5 pt-3">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-primary-500" />
                                                {event.date}
                                            </span>
                                            {event.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-primary-500" />
                                                    {event.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Modal Création/Édition */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="bg-black border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                            >
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-2xl">
                                    <h2 className="text-xl font-bold text-white">
                                        {editingEvent ? 'Modifier l\'évènement' : 'Nouvel Évènement'}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Titre</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-600"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Catégorie</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 text-white"
                                            >
                                                {categories.map(c => (
                                                    <option key={c.value} value={c.value} className="bg-black">{c.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 text-white color-scheme-dark"
                                                style={{ colorScheme: 'dark' }}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Lieu (Optionnel)</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-600 dark:text-primary-300" />
                                                <input
                                                    type="text"
                                                    value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 text-white placeholder-gray-600"
                                                    placeholder="Ex: Yaoundé, Palais des Congrès"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Image</label>
                                            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-primary-500/50 transition-colors bg-white/5">
                                                <ImageIcon className="w-10 h-10 text-dark-600 dark:text-primary-300 mx-auto mb-2" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })}
                                                    className="hidden"
                                                    id="event-image"
                                                />
                                                <label htmlFor="event-image" className="cursor-pointer text-primary-500 font-medium hover:text-primary-400">
                                                    {formData.image ? formData.image.name : "Cliquez pour télécharger une image"}
                                                </label>
                                                <p className="text-xs text-gray-600 mt-1">PNG, JPG jusqu'à 5MB</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="active"
                                                checked={formData.is_active}
                                                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-5 h-5 text-primary-500 rounded border-white/10 bg-white/5 focus:ring-primary-500 focus:ring-offset-black"
                                            />
                                            <label htmlFor="active" className="text-gray-300 font-medium">Visible sur le site</label>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-2 border border-white/10 rounded-lg text-gray-300 hover:bg-white/5 font-medium"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-primary-500 text-black rounded-lg hover:bg-primary-400 font-bold shadow-md flex items-center gap-2"
                                        >
                                            <Check className="w-5 h-5" />
                                            {editingEvent ? 'Mettre à jour' : 'Créer'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
};

export default AdminEvents;
