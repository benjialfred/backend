
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MessageCircle, HelpCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import { faqData } from '@/data/FAQData';

const FAQPage = () => {
    const [openId, setOpenId] = useState<number | null>(1);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFAQ = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    const filteredFAQs = faqData.filter(
        item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-hidden">
            <Navigation />

            {/* Background Architecture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/5 rounded-full blur-[100px]" />
            </div>

            <main className="pt-32 pb-24 px-4 relative z-10">
                {/* Header */}
                <section className="text-center mb-16 container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 inline-block"
                    >
                        <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300 font-medium tracking-wide shadow-sm">
                            <HelpCircle className="w-5 h-5 text-primary-500" />
                            <span className="font-bold tracking-widest uppercase text-sm">Centre d'Aide</span>
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight"
                    >
                        Comment pouvons-nous
                        <span className="block text-primary-500 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400">vous aider ?</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        Trouvez rapidement des réponses à vos questions sur nos services, produits et processus de création.
                    </motion.p>
                </section>

                {/* Search Bar */}
                <div className="max-w-3xl mx-auto mb-16">
                    <div className="relative group bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-2 shadow-xl shadow-gray-200/50 dark:shadow-black/50 transition-all">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une question ou un mot-clé..."
                            className="block w-full pl-16 pr-6 py-5 bg-transparent border-none rounded-[1.5rem] leading-5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 text-lg font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* FAQs list */}
                <div className="max-w-4xl mx-auto space-y-6">
                    <AnimatePresence>
                        {filteredFAQs.length > 0 ? (
                            filteredFAQs.map((faq, index) => (
                                <motion.div
                                    key={faq.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`transition-all duration-300 rounded-[2rem] overflow-hidden border shadow-sm ${openId === faq.id
                                        ? 'bg-white dark:bg-[#111] border-primary-500/30'
                                        : 'bg-white/80 dark:bg-[#111]/80 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(faq.id)}
                                        className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className={`text-2xl md:text-3xl font-black font-serif opacity-30 ${openId === faq.id ? 'text-primary-500 opacity-100' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary-500 transition-colors'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <h3 className={`text-lg md:text-xl font-bold transition-colors ${openId === faq.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                                                {faq.question}
                                            </h3>
                                        </div>
                                        <span className={`flex-shrink-0 ml-4 p-3 rounded-full transition-all duration-300 border ${openId === faq.id
                                            ? 'bg-primary-500 border-primary-500 text-black rotate-180'
                                            : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                                            }`}>
                                            <Plus size={20} className={`transition-transform duration-300 ${openId === faq.id ? 'rotate-45' : ''}`} />
                                        </span>
                                    </button>

                                    <motion.div
                                        initial={false}
                                        animate={{ height: openId === faq.id ? 'auto' : 0, opacity: openId === faq.id ? 1 : 0 }}
                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 md:px-8 pb-8 pt-0 ml-0 md:ml-12">
                                            <div className="h-px w-full bg-gradient-to-r from-gray-200 dark:from-white/10 to-transparent mb-6" />

                                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-medium leading-relaxed">
                                                {faq.answer}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {faq.details.map((detail, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 + (idx * 0.05) }}
                                                        className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/5"
                                                    >
                                                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-500/20 text-primary-600 dark:text-primary-500 text-xs font-bold border border-primary-500/30 mt-0.5">
                                                            {idx + 1}
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">{detail}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-[#111] rounded-[2rem] border border-gray-200 dark:border-white/10">
                                <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun résultat trouvé</h3>
                                <p className="text-gray-500 dark:text-gray-400">Essayez de modifier vos termes de recherche pour "{searchQuery}".</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Contact CTA */}
                <section className="mt-24 text-center">
                    <div className="inline-block p-[2px] rounded-[2rem] bg-gradient-to-r from-primary-500/20 via-primary-500/50 to-primary-500/20">
                        <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] px-8 md:px-12 py-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                            <div className="text-center md:text-left flex-1">
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Vous ne trouvez pas votre réponse ?</h4>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Notre équipe d'assistance dédiée est là pour vous aider personnellement.</p>
                            </div>
                            <a
                                href="/contact"
                                className="px-8 py-4 bg-primary-500 text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-3 whitespace-nowrap"
                            >
                                <MessageCircle size={18} />
                                Nous contacter
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default FAQPage;
