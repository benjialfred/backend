import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Footer from '../components/layout/Footer';
import Navigation from '@/components/Navigation';
import { contactAPI } from '@/services/api';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await contactAPI.sendMessage(formData);
            setSubmitted(true);
            toast.success('Message envoyé avec succès !');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'envoi du message.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 pt-24 pb-20">
            <Navigation />

            <main className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
                    <nav className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-8">
                        <a className="hover:text-gray-900 dark:hover:text-white transition-colors" href="/">Accueil</a>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-black">Contact</span>
                    </nav>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-gray-900 dark:text-white mb-6"
                    >
                        Parlons de vous.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed"
                    >
                        Une question sur nos créations, une demande de sur-mesure ou simplement envie de discuter ? Notre équipe est à votre écoute pour concevoir l'exceptionnel.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                    {/* Info Sidebar */}
                    <aside className="lg:col-span-4 order-2 lg:order-1">
                        <div className="lg:sticky lg:top-32 space-y-12">
                            {/* Contact Details */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">Coordonnées</h3>
                                <ul className="space-y-8">
                                    <li className="flex items-start gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">Téléphone</span>
                                            <span className="text-gray-600 dark:text-gray-400 text-lg font-medium">+237 670 69 01 94</span>
                                            <span className="block text-sm text-gray-500 mt-1">Dispo 9h - 18h</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">Email</span>
                                            <span className="text-gray-600 dark:text-gray-400 text-lg font-medium">contact@phc.com</span>
                                            <span className="block text-sm text-gray-500 mt-1">Réponse sous 24h</span>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">Atelier Central</span>
                                            <span className="text-gray-600 dark:text-gray-400 text-lg font-medium">Douala, Cameroun</span>
                                            <span className="block text-sm text-gray-500 mt-1">Ndogpassi II, St Nicolas</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* Social or Additional Info */}
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">Réseaux</h3>
                                <div className="flex gap-4">
                                    <button className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm hover:shadow-md">
                                        <span className="text-sm font-bold">IG</span>
                                    </button>
                                    <button className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm hover:shadow-md">
                                        <span className="text-sm font-bold">FB</span>
                                    </button>
                                    <button className="w-12 h-12 rounded-2xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-primary-500 hover:text-primary-500 transition-all shadow-sm hover:shadow-md">
                                        <span className="text-sm font-bold">WA</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Contact Form Section */}
                    <section className="lg:col-span-8 order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-[#111] rounded-[2rem] p-8 md:p-12 shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200/50 dark:border-white/10 relative overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center py-16 relative z-10"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 text-emerald-500">
                                            <Send className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Message Envoyé</h3>
                                        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-md mx-auto">
                                            Merci de nous avoir contactés. Notre équipe d'artisans vous répondra dans les plus brefs délais.
                                        </p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:scale-[1.02] transition-transform shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20"
                                        >
                                            Envoyer un autre message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10"
                                    >
                                        <div className="mb-10 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary-500">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Laissez-nous un message</h2>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Nom Complet</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all focus:bg-white dark:focus:bg-[#111]"
                                                        placeholder="Jean Dupont"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Adresse Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all focus:bg-white dark:focus:bg-[#111]"
                                                        placeholder="jean@exemple.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Sujet de votre demande</label>
                                                <input
                                                    type="text"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all focus:bg-white dark:focus:bg-[#111]"
                                                    placeholder="Prise de mesure, commande en cours..."
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Votre Message</label>
                                                <textarea
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    required
                                                    rows={5}
                                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none focus:bg-white dark:focus:bg-[#111] min-h-[150px]"
                                                    placeholder="Décrivez votre besoin en détail..."
                                                />
                                            </div>

                                            <div className="pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full md:w-auto px-10 py-4 bg-primary-500 hover:bg-primary-600 text-black font-bold rounded-2xl shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                                                >
                                                    {isSubmitting ? (
                                                        <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            Envoyer le message
                                                            <Send className="w-5 h-5" />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactPage;
