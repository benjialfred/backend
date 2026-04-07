import { motion } from 'framer-motion';
import { ArrowRight, User, Tag, BookOpen } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

const BlogPage = () => {
    // Mock blog posts for now - later can be API driven
    const blogPosts = [
        {
            id: 1,
            title: "L'Excellence de la Haute Couture en 2026",
            excerpt: "Découvrez notre programme de formation exclusif qui allie tradition, technique et innovation. Devenez un maître de la création vestimentaire.",
            category: "FORMATION",
            author: "PhC Academy",
            date: "24 Jan 2026",
            image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80",
            link: "/blog/formation",
            featured: true
        },
        {
            id: 2,
            title: "Les Tendances du Pagne Contemporain",
            excerpt: "Comment le Ndop et le Wax se réinventent sur les podiums internationaux avec une touche minimaliste. Une analyse de nos stylistes.",
            category: "TENDANCES",
            author: "Sarah M.",
            date: "10 Jan 2026",
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=3540&auto=format&fit=crop",
            link: "#",
            featured: false
        },
        {
            id: 3,
            title: "Créer un Design System d'Exception",
            excerpt: "Plongée au coeur des méthodes de conception des grandes maisons de mode, et comment elles influencent notre approche esthétique digitale.",
            category: "DESIGN",
            author: "Alex D.",
            date: "05 Jan 2026",
            image: "https://images.unsplash.com/photo-1542496658-e32a65a12866?q=80&w=3474&auto=format&fit=crop",
            link: "#",
            featured: false
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden">
            <Navigation />

            {/* Background Architecture */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-primary-500/5 dark:bg-primary-500/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 pt-32 pb-24">
                {/* Header Section */}
                <div className="container mx-auto px-4 max-w-6xl mb-16 md:mb-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 inline-block"
                    >
                        <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300 font-medium tracking-wide shadow-sm">
                            <BookOpen className="w-5 h-5 text-primary-500" />
                            <span className="font-bold tracking-widest uppercase text-sm">Le Journal</span>
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6"
                    >
                        Inspirations & <br />
                        <span className="text-primary-500 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400"> Réflexions</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto"
                    >
                        Actualités, conseils mode et vie de l'atelier. Plongez dans l'univers de l'excellence sur-mesure.
                    </motion.p>
                </div>

                {/* Content */}
                <section className="container mx-auto px-4 max-w-7xl">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        {blogPosts.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`group relative bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 hover:border-primary-500/30 transition-all duration-500 flex flex-col shadow-sm hover:shadow-xl hover:shadow-primary-500/10 ${post.featured ? 'md:col-span-2 lg:col-span-2' : ''}`}
                            >
                                <div className={`relative ${post.featured ? 'h-72 md:h-[450px]' : 'h-72'} overflow-hidden bg-gray-100 dark:bg-black`}>
                                    <div className="absolute inset-0 bg-gradient-to-t md:from-white md:dark:from-[#111] from-black/60 via-transparent to-transparent z-10 md:opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 left-6 z-20">
                                        <span className="bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider flex items-center gap-2 shadow-sm">
                                            <Tag className="w-3 h-3 text-primary-500" />
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 md:p-10 flex-1 flex flex-col relative z-20 bg-white dark:bg-[#111]">
                                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-white/5 pb-6">
                                        <span className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-primary-500" /> 
                                            <span className="text-gray-900 dark:text-gray-300">{post.author}</span>
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        <span>{post.date}</span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-500 transition-colors leading-tight">
                                        <Link to={post.link} className="focus:outline-none before:absolute before:inset-0">
                                            {post.title}
                                        </Link>
                                    </h2>

                                    <p className="text-gray-600 dark:text-gray-400 mb-8 flex-1 text-base leading-relaxed">
                                        {post.excerpt}
                                    </p>

                                    <div className="inline-flex items-center gap-3 text-gray-900 dark:text-white font-bold uppercase text-sm tracking-widest mt-auto">
                                        <span>Lire l'article</span>
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;