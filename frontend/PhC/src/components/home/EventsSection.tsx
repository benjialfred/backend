import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import { eventAPI } from '@/services/api';
import type { Event } from '@/types';

const EventsSection = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await eventAPI.getAll();
                // Filtrer pour n'afficher que les événements actifs, et prendre les 3 plus récents
                // Note: L'API renvoie { results: [], count: ... } ou [] selon la pagination
                const eventList = Array.isArray(response) ? response : (response as any).results || [];
                setEvents(eventList.slice(0, 3));
            } catch (error) {
                console.error('Erreur chargement évènements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading || events.length === 0) {
        return null; // Ne rien afficher si pas d'évènements ou chargement très rapide
    }

    const getCategoryLabel = (cat: string) => {
        const map: Record<string, string> = {
            'DEFILE': 'Défilé de Mode',
            'SOUTENANCE': 'Soutenance',
            'DON': 'Don Caritatif',
            'PARTENARIAT': 'Partenariat',
            'AUTRE': 'Évènement'
        };
        return map[cat] || cat;
    };

    return (
        <section className="py-32 bg-white dark:bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block py-1.5 px-4 rounded-full bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-[0.2em] mb-6"
                        >
                            Agenda & Actualités
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight font-serif tracking-tight"
                        >
                            Vivez la mode <span className="text-gray-400 dark:text-gray-500 font-serif">Autrement.</span>
                        </motion.h2>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="hidden md:block"
                    >
                        <a
                            href="/events"
                            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black dark:text-white hover:text-primary-500 transition-colors pb-1"
                        >
                            Voir tout l'agenda
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </a>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="group relative glass-panel overflow-hidden hover-lift p-0"
                        >
                            {/* Image Container */}
                            <div className="relative h-72 overflow-hidden m-2 rounded-xl">
                                <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 animate-pulse" />
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-10 relative"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80';
                                    }}
                                />

                                {/* Date Badge */}
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-xl p-3 text-center min-w-[70px] border border-black/5 dark:border-white/10 z-20 shadow-sm">
                                    <span className="block text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                        {new Date(event.date).getDate()}
                                    </span>
                                    <span className="block text-xs font-bold text-gray-500 uppercase mt-1">
                                        {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                </div>

                                {/* Category Tag */}
                                <div className="absolute top-4 right-4 z-20">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md border border-white/20 text-white ${event.category === 'DEFILE' ? 'bg-black/60' :
                                        event.category === 'DON' ? 'bg-primary-600/60' :
                                            'bg-gray-800/60'
                                        }`}>
                                        {getCategoryLabel(event.category)}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2 text-sm font-medium">
                                    {event.location && (
                                        <>
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate">{event.location}</span>
                                        </>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-primary-500 transition-colors">
                                    {event.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm mb-6 leading-relaxed">
                                    {event.description}
                                </p>
                                <div>
                                    <span className="inline-flex items-center gap-2 text-sm font-bold tracking-wide group-hover:text-primary-500 transition-colors uppercase">
                                        En savoir plus
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View All Button */}
                <div className="mt-12 text-center md:hidden">
                    <a
                        href="/events"
                        className="btn-premium px-8 py-3"
                    >
                        Voir tout l'agenda
                    </a>
                </div>
            </div>
        </section>
    );
};

export default EventsSection;
