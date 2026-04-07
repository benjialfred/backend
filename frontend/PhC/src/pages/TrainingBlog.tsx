import { motion } from 'framer-motion';
import { Check, Star, ArrowRight, Scissors, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import videos
import vestVideo from '@/assets/vest_presentation.mp4';
import filVideo from '@/assets/fil_couture.mp4';
// Import some images for fallback/textures if needed, or just use colors
// reusing existing assets if useful, but videos are main focus

const TrainingBlog = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section with Vest Video */}
            <section className="relative h-screen flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={vestVideo} type="video/mp4" />
                    </video>
                </div>

                <div className="container mx-auto px-4 relative z-20">
                    <div className="max-w-4xl mx-auto text-center text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-red-600/80 text-white text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm">
                                FORMATION PROFESSIONNELLE
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                L'Excellence de la <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                    Haute Couture
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light max-w-2xl mx-auto">
                                Devenez un maître de la création vestimentaire. Une formation qui allie tradition, technique et innovation.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <Link
                                    to="/contact"
                                    className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Postuler Maintenant <ArrowRight size={20} />
                                </Link>
                                <Link
                                    to="/products"
                                    className="px-8 py-4 bg-transparent border border-white text-white font-bold rounded-full hover:bg-white/10 transition-all"
                                >
                                    Voir nos Créations
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-2">Notre Philosophie</h2>
                            <h3 className="text-4xl font-bold text-dark-900 dark:text-white mb-6">La couture est un art, <br />la précision est notre langage</h3>
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                Chez PhC, nous ne formons pas seulement des couturiers, nous révélons des artistes. Chaque point, chaque coupe, chaque détail compte. Notre programme est conçu pour transmettre les secrets des plus grands ateliers.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Maîtrise des tissus nobles et techniques complexes",
                                    "Création de patrons sur mesure et modélisme",
                                    "Finitions haute couture à la main",
                                    "Développement de votre propre style artistique"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-red-600" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative">
                                <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply z-10" />
                                {/* Using the second video here for detail demonstration */}
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                >
                                    <source src={filVideo} type="video/mp4" />
                                </video>
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-xl shadow-xl max-w-xs z-20 hidden md:block border-l-4 border-red-600">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="p-3 bg-red-50 rounded-full">
                                        <Award className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark-900 dark:text-white">Certificat PhC</h4>
                                        <p className="text-xs text-dark-600 dark:text-primary-300">Reconnu par la profession</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">Un diplôme qui ouvre les portes des plus grandes maisons de couture.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl font-bold text-dark-900 dark:text-white mb-4">Programme de Formation</h2>
                        <p className="text-gray-600 text-lg">Un cursus complet de 3 niveaux pour passer de débutant à expert confirme.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                level: "Niveau 1",
                                title: "Les Fondamentaux",
                                desc: "Découverte de la machine, points de base, et premiers vêtements simples.",
                                icon: Scissors,
                                duration: "3 Mois"
                            },
                            {
                                level: "Niveau 2",
                                title: "Perfectionnement",
                                desc: "Techniques de doublure, pose de zip invisible, cols et manches complexes.",
                                icon: Check,
                                duration: "4 Mois"
                            },
                            {
                                level: "Niveau 3",
                                title: "Expertise & Création",
                                desc: "Veste tailleur, robe de soirée, drapage et création de collection personnelle.",
                                icon: Star,
                                duration: "5 Mois"
                            }
                        ].map((module, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 group">
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform">
                                    <module.icon size={28} />
                                </div>
                                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{module.level}</div>
                                <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">{module.title}</h3>
                                <p className="text-gray-600 mb-6">{module.desc}</p>
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-dark-600 dark:text-primary-300 font-medium text-sm">Durée: {module.duration}</span>
                                    <Link to="/contact" className="text-blue-600 font-bold text-sm hover:underline">En savoir plus</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#1a1c4b] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Prêt à commencer votre voyage ?</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Les places pour la prochaine session sont limitées. Rejoignez l'élite de la couture africaine moderne.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-3 px-10 py-4 bg-white text-[#1a1c4b] text-lg font-bold rounded-full hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        S'inscrire à la formation <ArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default TrainingBlog;
