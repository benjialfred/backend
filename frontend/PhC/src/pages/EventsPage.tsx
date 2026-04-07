import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, Search, ArrowRight,
    Heart, Gift, Sparkles, PartyPopper, Music
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import { eventAPI } from '@/services/api';
import type { Event } from '@/types';
import PremiumLoader from '@/components/ui/PremiumLoader';

const EventsPage = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await eventAPI.getAll();
                const allEvents = Array.isArray(data) ? data : (data as any).results || [];
                setEvents(allEvents.filter((e: Event) => e.is_active));
            } catch (error) {
                console.error("Failed to fetch events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'ALL' || event.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { id: 'ALL', label: 'Tout', icon: Sparkles },
        { id: 'DEFILE', label: 'Défilés', icon: PartyPopper },
        { id: 'SOUTENANCE', label: 'Soutenances', icon: Music },
        { id: 'DON', label: 'Caritatif', icon: Heart },
        { id: 'PARTENARIAT', label: 'Partenariats', icon: Gift }
    ];

    if (loading) return <PremiumLoader />;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden relative">
            <Navigation />

            {/* Background Effects - Professional & Modern */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Subtle Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 md:pb-24 container mx-auto px-4 z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="mb-8 inline-block"
                >
                    <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium tracking-wide shadow-sm">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        <span className="text-gray-900 dark:text-gray-300 font-bold tracking-widest uppercase text-sm">Événements</span>
                    </span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-gray-900 dark:text-white leading-tight">
                    Nos <span className="text-primary-500 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">Rendez-vous</span>
                    <br />
                    Incontournables
                </h1>

                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 font-medium">
                    Des défilés éblouissants aux soirées caritatives, rejoignez-nous pour partager des moments de joie, de créativité et de magie.
                </p>

                {/* Search & Filter - Floating Glass Effect */}
                <div className="max-w-4xl mx-auto bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-[2rem] p-4 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-all">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un événement..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar scroll-smooth p-1">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id)}
                                    className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${filterCategory === cat.id
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md transform scale-[1.02]'
                                        : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-transparent hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <cat.icon className={`w-4 h-4 ${filterCategory === cat.id ? 'text-primary-400 dark:text-primary-600 animate-pulse' : ''}`} />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Grid */}
            <section className="container mx-auto px-4 pb-24 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    layout
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 hover:border-primary-500/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary-500/10"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-72 overflow-hidden bg-gray-100 dark:bg-black">
                                        <div className="absolute inset-0 bg-gradient-to-t md:from-white md:dark:from-[#111] from-black/60 via-transparent to-transparent z-10 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <img
                                            src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80'}
                                            alt={event.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />

                                        {/* Floating Badge */}
                                        <div className="absolute top-5 left-5 z-20">
                                            <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-sm">
                                                <Sparkles className="w-3 h-3 text-primary-500" />
                                                {event.category}
                                            </span>
                                        </div>

                                        {/* Date Badge */}
                                        <div className="absolute top-5 right-5 z-20 bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-3 text-center min-w-[70px] shadow-sm group-hover:bg-gray-900 group-hover:dark:bg-white group-hover:text-white group-hover:dark:text-black transition-colors duration-300">
                                            <span className="block text-3xl font-black leading-none mb-1">
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className="block text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase">
                                                {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="relative p-8 z-20 bg-white dark:bg-[#111]">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors line-clamp-2 leading-tight">
                                            {event.title}
                                        </h3>

                                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-6">
                                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-transparent">
                                                <Calendar className="w-4 h-4 text-primary-500" />
                                                <span>{new Date(event.date).getFullYear()}</span>
                                            </div>
                                            {event.location && (
                                                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-transparent">
                                                    <MapPin className="w-4 h-4 text-primary-500" />
                                                    <span className="truncate max-w-[150px]">{event.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 mb-8 line-clamp-3 leading-relaxed">
                                            {event.description}
                                        </p>

                                        <button className="w-full py-4 rounded-2xl bg-gray-100 peer hover:bg-gray-900 group-hover:bg-gray-900 dark:bg-white/5 dark:hover:bg-white dark:group-hover:bg-white text-gray-900 hover:text-white group-hover:text-white dark:text-white dark:hover:text-gray-900 dark:group-hover:text-gray-900 font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-3">
                                            <span>Participer</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-32 text-center">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative inline-block"
                                >
                                    <div className="bg-gray-100 dark:bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Calendar className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Aucun événement n'est prévu</h3>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">Essayez une autre catégorie ou revenez plus tard.</p>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
            
            <Footer />
        </div>
    );
};

export default EventsPage;
