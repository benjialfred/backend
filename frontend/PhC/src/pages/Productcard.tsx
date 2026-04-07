import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product, quantity: number, taille: string) => void;
    onToggleFavorite?: (productId: string) => void;
    isFavorite?: boolean;
}

const Productcard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onToggleFavorite,
    isFavorite = false
}) => {
    const navigate = useNavigate();
    const [, setIsHovered] = useState(false);

    const handleNavigate = () => {
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToCart) {
            const defaultSize = product.tailles_disponibles?.[0] || 'Standard';
            onAddToCart(product, 1, defaultSize);
        }
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onToggleFavorite) {
            onToggleFavorite(product.id.toString());
        }
    };

    const mainImage = product.images?.find(img => img.is_principal)?.image || product.image_principale || product.image;
    const fallbackImage = 'https://via.placeholder.com/400x500?text=ProphCouture';

    const [imgSrc, setImgSrc] = useState(mainImage || fallbackImage);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    React.useEffect(() => {
        const newSrc = mainImage || fallbackImage;
        if (newSrc !== imgSrc) {
            setImgSrc(newSrc);
            setImageLoaded(false);
            setImageError(false);
        }
    }, [mainImage]);

    const discount = product.prix_promotion 
        ? Math.round(((product.prix - product.prix_promotion) / product.prix) * 100)
        : 0;

    return (
        <div
            className="group relative flex flex-col bg-white dark:bg-black/20 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 border border-gray-100 dark:border-white/5 cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNavigate}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-white/5">
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                
                <img
                    src={imgSrc}
                    alt={product.nom}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        if (!imageError) {
                            setImgSrc(fallbackImage);
                            setImageError(true);
                            setImageLoaded(true); // Stop spinner entirely since we reverted to fallback
                        }
                    }}
                    loading="lazy"
                />

                {/* Gradient Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="px-3 py-1 bg-amber-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                            Dernières pièces
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                            Épuisé
                        </span>
                    )}
                    {discount > 0 && (
                        <span className="px-3 py-1 bg-primary-500/90 backdrop-blur-md text-black text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 dark:bg-black/50 backdrop-blur-md shadow-lg flex items-center justify-center transition-transform duration-300 hover:scale-110"
                >
                    <Heart 
                        className={`w-5 h-5 transition-colors ${
                            isFavorite 
                                ? 'fill-primary-500 text-primary-500' 
                                : 'text-gray-600 dark:text-gray-300 hover:text-primary-500'
                        }`} 
                    />
                </button>

                {/* Quick Actions (Hover Reveal) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex gap-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex-1 bg-primary-500 hover:bg-primary-400 text-black font-bold uppercase tracking-widest text-xs py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Ajouter</span>
                    </button>
                    <button
                        onClick={handleNavigate}
                        className="w-[52px] h-[52px] bg-white/90 dark:bg-white/10 backdrop-blur-md hover:bg-white dark:hover:bg-white/20 text-black dark:text-white rounded-xl shadow-xl flex items-center justify-center transition-all duration-300"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-5 flex flex-col flex-grow bg-white dark:bg-transparent">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 leading-snug">
                        {product.nom}
                    </h3>
                    <div className="text-right flex-shrink-0">
                        {product.prix_promotion ? (
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                                    {product.prix_promotion.toLocaleString()} FCFA
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                    {product.prix.toLocaleString()} FCFA
                                </span>
                            </div>
                        ) : (
                            <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                {product.prix.toLocaleString()} FCFA
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {typeof product.category === 'object' && product.category?.nom ? product.category.nom : 'Collection'}
                    </span>
                    <div className="flex items-center gap-1 opacity-80">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                    star <= 4
                                        ? 'fill-primary-500 text-primary-500'
                                        : 'text-gray-200 dark:text-gray-700'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Productcard;