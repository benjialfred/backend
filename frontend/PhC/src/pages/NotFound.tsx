import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';

export const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col transition-colors duration-500">
            <Navigation />
            
            <main className="flex-grow flex items-center justify-center p-4 pt-24 pb-12 relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-10 text-center max-w-2xl mx-auto space-y-8"
                >
                    <div className="space-y-4">
                        <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                            404
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Page introuvable
                        </h2>
                    </div>

                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-relaxed">
                        L'adresse que vous avez saisie est incorrecte ou la page n'existe plus dans notre catalogue.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <button 
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-[#111] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Retour
                        </button>
                        <Link 
                            to="/"
                            className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold transition-transform hover:scale-[1.02] shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20 flex items-center justify-center gap-3"
                        >
                            <Home className="w-5 h-5" />
                            Accueil
                        </Link>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};