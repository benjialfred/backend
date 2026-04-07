import { motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import Productcard from '@/pages/Productcard'; // Ensure correct import path
import Navigation from '@/components/Navigation';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
    const { favorites } = useFavorites();

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] font-sans transition-colors duration-300 relative overflow-hidden flex flex-col">
            <Navigation />

            <main className="flex-grow container mx-auto px-4 py-24 relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <Link to="/products" className="p-3 bg-white/80 dark:bg-[#111] backdrop-blur-md rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-gray-200/50 dark:border-white/10 group">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white" />
                    </Link>
                    <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Heart className="w-8 h-8 text-primary-500 fill-primary-500/20" />
                        Mes Coups de Cœur
                    </h1>
                </div>

                {favorites.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center border border-gray-200/50 dark:border-white/10 bg-white/90 dark:bg-[#111] rounded-3xl backdrop-blur-md shadow-xl shadow-gray-200/30 dark:shadow-black/50"
                    >
                        <div className="w-24 h-24 bg-primary-50 dark:bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <Heart className="w-12 h-12 text-primary-500" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-3">Votre liste est vide</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-lg leading-relaxed">
                            Vous n'avez pas encore ajouté de produits à vos favoris. Explorez notre collection pour trouver vos pièces préférées !
                        </p>
                        <Link
                            to="/products"
                            className="px-8 py-4 bg-primary-500 text-black rounded-2xl font-bold hover:scale-[1.02] hover:bg-primary-600 transition-all shadow-md hover:shadow-primary-500/20 flex items-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Découvrir la collection
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Productcard product={product} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Favorites;
