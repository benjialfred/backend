import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 pt-24 pb-20">
            <Navigation />

            <main className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="mb-16 md:mb-24">
                    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-8">
                        <a className="hover:text-gray-900 dark:hover:text-white transition-colors" href="/">Accueil</a>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white font-black">À Propos</span>
                    </nav>

                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-gray-900 dark:text-white mb-6"
                        >
                            Notre Maison.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed"
                        >
                            L'élégance du style camerounais, la précision du sur-mesure. Découvrez l'histoire de Prophétie Couture.
                        </motion.p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
                    <div className="md:col-span-5 relative">
                        {/* Abstract visual representation instead of image */}
                        <div className="aspect-[4/5] rounded-3xl bg-gray-900 dark:bg-white/5 border border-gray-200 dark:border-white/10 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-primary-500/10 blur-[50px] group-hover:bg-primary-500/20 transition-colors duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                                <h3 className="text-4xl font-black text-white mix-blend-overlay opacity-30 tracking-widest uppercase rotate-90 whitespace-nowrap">
                                    Prophétie Couture
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-7 flex flex-col justify-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Notre Vision</h3>
                            <div className="w-12 h-1 bg-primary-500 rounded-full" />
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed font-medium">
                                Fondée avec une passion inébranlable pour la mode et l'héritage culturel, Prophétie Couture se consacre à la création de vêtements qui respirent l'authenticité et l'élégance. Nous fusionnons magistralement le riche patrimoine textile camerounais avec des coupes contemporaines pour offrir des pièces véritablement uniques.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-3xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-sm"
                        >
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">L'Artisanat</h4>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Chaque point de couture dans notre atelier de Douala est un témoignage de notre dévouement à l'excellence artisanale. De la sélection minutieuse des tissus à la finition impeccable, nous nous engageons à offrir à nos clients bien plus qu'un simple vêtement : une expérience sartoriale exceptionnelle.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AboutPage;
