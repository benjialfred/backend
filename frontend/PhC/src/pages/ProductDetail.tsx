import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    ShoppingBag,
    Ruler,
    Truck,
    Shield,
    Clock,
    Star,
    Share2,
    Sparkles
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import SizeGuideModal from '@/components/products/SizeGuideModal';
import ProductReviews from '@/components/products/ProductReviews';
import { productAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import type { Product } from '@/types';
import CoutureFlowModal from '@/components/CoutureFlow/CoutureFlowModal';
import type { CoutureProfile } from '@/components/CoutureFlow/types';

// Images placeholders
import placeholder1 from '@/assets/african_royal_ndop.png';
import placeholder2 from '@/assets/modern_cameroon_fashion.png';

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Gallery
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [images, setImages] = useState<string[]>([]);

    // Options
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [showCoutureFlow, setShowCoutureFlow] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'shipping' | 'reviews'>('details');

    const { addToCart } = useCart();
    const { favorites, toggleFavorite } = useFavorites();

    const isFavorite = product ? favorites.some(f => f.id === product.id) : false;

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await productAPI.getById(parseInt(id));
                setProduct(data);

                // Set images array from main image + gallery (if available)
                let actualImages: string[] = [];
                
                if (data.image_principale) {
                    actualImages.push(data.image_principale);
                }
                
                if (data.galerie_images && Array.isArray(data.galerie_images)) {
                  data.galerie_images.forEach((img: any) => {
                    const imgUrl = typeof img === 'string' ? img : img.image;
                    if (imgUrl && !actualImages.includes(imgUrl)) {
                      actualImages.push(imgUrl);
                    }
                  });
                }
                
                if (data.images && Array.isArray(data.images)) {
                  data.images.forEach((img: any) => {
                    const imgUrl = typeof img === 'string' ? img : img.image;
                    if (imgUrl && !actualImages.includes(imgUrl)) {
                      actualImages.push(imgUrl);
                    }
                  });
                }

                if (actualImages.length === 0) {
                    actualImages = [placeholder1, placeholder2]; // Fallback
                }
                
                setImages(actualImages);

                if (data.taille) {
                    setSelectedSize(data.taille);
                }
            } catch (error) {
                console.error("Erreur chargement produit", error);
                toast.error("Impossible de charger le produit");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = (profile?: CoutureProfile) => {
        if (!product) return;
        
        // Incorporate couture customization details if available
        let productToAdd = { ...product };
        if (profile) {
            // Note: Ideally cart item type would hold these custom properties
            // We inject it as a string to the category/options for now, or just alert text
            (productToAdd as any).coutureProfile = profile;
        }

        addToCart(productToAdd, quantity);
        toast.success(`${product.nom} a été ajouté au panier ${profile ? "avec vos personnalisations" : ""}`);
    };

    const handleShare = async () => {
        const shareData = {
            title: product?.nom || 'Prophétique Couture',
            text: 'Découvrez cette création exceptionnelle',
            url: window.location.href,
        };
        try {
            if (navigator.share && window.isSecureContext) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Lien copié dans le presse-papier !");
            }
        } catch (err) {
            console.error("Erreur lors du partage:", err);
        }
    };

    const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <Navigation />
                <div className="w-10 h-10 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center text-black dark:text-white p-4">
                <Navigation />
                <h1 className="text-4xl font-black font-serif italic mb-4">Produit introuvable</h1>
                <Link to="/products" className="px-6 py-3 bg-primary-500 text-black font-bold text-base font-medium uppercase tracking-widest rounded-lg">Retour à la boutique</Link>
            </div>
        );
    }

    // Extraction potentielle des tailles si c'est une chaîne séparée par des virgules
    const availableSizes = ['S', 'M', 'L', 'XL']; // Fallback mock 

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans">
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap');`}
            </style>

            <Navigation />

            <div className="pt-24 pb-12 px-4 md:px-10 max-w-7xl mx-auto">
                <nav className="flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-8">
                    <Link to="/products" className="hover:text-primary-500 transition-colors">Boutique</Link>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-gray-500 dark:text-gray-400">
                        {typeof product.category === 'object' ? product.category?.nom : 'Collection'}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="text-gray-900 dark:text-white font-bold truncate max-w-[200px]">{product.nom}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Galerie d'images */}
                    <div className="lg:sticky lg:top-28 lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
                        {/* Thumbnails */}
                        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto hide-scrollbar w-full lg:w-20 flex-shrink-0 order-2 lg:order-1 pb-4 lg:pb-0">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImageIndex(idx)}
                                    className={`relative aspect-[3/4] overflow-hidden flex-shrink-0 w-20 transition-all duration-300 border ${
                                        idx === activeImageIndex 
                                        ? 'border-black dark:border-white opacity-100' 
                                        : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt={`${product.nom} vue ${idx + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image */}
                        <div className="relative flex-1 overflow-hidden bg-gray-50 dark:bg-white/5 order-1 lg:order-2 group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImageIndex}
                                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    src={images[activeImageIndex]}
                                    alt={product.nom}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {product.prix_promotion && (
                                <div className="absolute top-6 left-6 px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest z-10">
                                    -{Math.round((1 - product.prix_promotion / product.prix) * 100)}%
                                </div>
                            )}

                            {/* Slider Controls (Hover) */}
                            {images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-white/10">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 dark:bg-black/50 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-gray-200 dark:border-white/10">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Informations Produit */}
                    <div className="flex flex-col py-4">
                        <div className="mb-8">
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-500 mb-4">
                                {typeof product.category === 'object' ? product.category?.nom : 'Collection Exclusive'}
                            </p>
                            <h1 className="text-4xl md:text-5xl font-black font-serif text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                                {product.nom}
                            </h1>
                            <div className="flex items-center gap-4 mb-6">
                                {product.prix_promotion ? (
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-serif font-black text-primary-600 dark:text-primary-400">
                                            {product.prix_promotion.toLocaleString()} <span className="text-xl font-sans font-bold text-gray-500 dark:text-gray-400">FCFA</span>
                                        </span>
                                        <span className="text-xl text-gray-400 dark:text-gray-500 line-through font-serif mt-1">
                                            {product.prix.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-4xl font-serif font-black text-gray-900 dark:text-white">
                                        {product.prix.toLocaleString()} <span className="text-xl font-sans font-bold text-gray-500 dark:text-gray-400">FCFA</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-primary-500 text-primary-500" />)}
                                </div>
                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors cursor-pointer border-b border-transparent hover:border-primary-500">12 avis authentifiés</span>
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-200 dark:bg-white/10 mb-8" />

                        {/* Options - Apple Store Style */}
                        <div className="space-y-10 mb-10">
                            {/* Color Selection */}
                            {product.couleur && (
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Couleur</h3>
                                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{product.couleur}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="relative w-12 h-12 border border-black dark:border-white p-1 flex items-center justify-center transition-all hover:scale-105" title={product.couleur}>
                                            <div className="w-full h-full bg-zinc-800" />
                                        </button>
                                        <button className="relative w-12 h-12 border border-transparent p-1 flex items-center justify-center transition-all hover:border-gray-300 dark:hover:border-gray-600 hover:scale-105">
                                            <div className="w-full h-full bg-orange-800" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Taille</h3>
                                    <button onClick={() => setShowSizeGuide(true)} className="flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                        <Ruler className="w-4 h-4" /> Guide des tailles
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {availableSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`relative h-14 border flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                                                selectedSize === size 
                                                ? 'border-black dark:border-white text-black dark:text-white bg-gray-50 dark:bg-white/10' 
                                                : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Quantité</h3>
                                </div>
                                <div className="inline-flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all">-</button>
                                    <div className="w-16 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</div>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 transition-all">+</button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={() => setShowCoutureFlow(true)}
                                className="flex-1 py-4 flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                style={{ pointerEvents: product.stock ? 'auto' : 'none', opacity: product.stock ? 1 : 0.5 }}
                            >
                                <Sparkles className="w-5 h-5 mr-3" />
                                Personnaliser ce Modèle
                            </button>
                            <button
                                onClick={() => toggleFavorite(product)}
                                className={`w-[60px] h-[60px] flex items-center flex-shrink-0 justify-center border transition-all duration-300 ${isFavorite ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-500/10' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-black dark:hover:border-white'}`}
                            >
                                <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={handleShare} className="w-[60px] h-[60px] flex flex-shrink-0 items-center justify-center border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Accordion / Tabs description */}
                        <div className="border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden mb-10 bg-white dark:bg-transparent">
                            <div className="flex border-b border-gray-200 dark:border-white/10">
                                <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'details' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                    Détails
                                    {activeTab === 'details' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                                </button>
                                <button onClick={() => setActiveTab('materials')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-l border-gray-200 dark:border-white/10 relative ${activeTab === 'materials' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                    Matières
                                    {activeTab === 'materials' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                                </button>
                                <button onClick={() => setActiveTab('shipping')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-l border-gray-200 dark:border-white/10 relative ${activeTab === 'shipping' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                    Livraison
                                    {activeTab === 'shipping' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                                </button>
                                <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors border-l border-gray-200 dark:border-white/10 relative ${activeTab === 'reviews' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                                    Avis clients
                                    {activeTab === 'reviews' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                                </button>
                            </div>
                            <div className="p-6 text-gray-600 dark:text-gray-300 leading-relaxed min-h-[140px]">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'details' && (
                                        <motion.div key="details" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                            <p>{product.description}</p>
                                            {product.stock > 0 && (
                                                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-green-600 dark:text-green-400 flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                    En Stock ({product.stock} pièces)
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                    {activeTab === 'materials' && (
                                        <motion.div key="materials" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                            <p>Confectionné dans notre atelier avec des matières de premier choix. Ce vêtement nécessite un entretien délicat (nettoyage à sec recommandé) pour préserver la qualité des fibres et la tenue des couleurs.</p>
                                        </motion.div>
                                    )}
                                    {activeTab === 'shipping' && (
                                        <motion.div key="shipping" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                            <ul className="space-y-4">
                                                <li className="flex items-start gap-3"><Truck className="w-5 h-5 text-gray-400 mt-0.5" /> Livraison standard sous 2 à 5 jours ouvrés à Douala.</li>
                                                <li className="flex items-start gap-3"><Clock className="w-5 h-5 text-gray-400 mt-0.5" /> Possibilité de retrait direct à l'atelier sur rendez-vous.</li>
                                                <li className="flex items-start gap-3"><Shield className="w-5 h-5 text-gray-400 mt-0.5" /> Retours acceptés sous 7 jours pour les pièces non personnalisées.</li>
                                            </ul>
                                        </motion.div>
                                    )}
                                    {activeTab === 'reviews' && (
                                        <motion.div key="reviews" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                                            <ProductReviews productId={product.id} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Badges assurances */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500/50 transition-colors">
                                <Shield className="w-8 h-8 text-primary-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Paiement Sécurisé</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary-500/50 transition-colors">
                                <Star className="w-8 h-8 text-primary-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Qualité Premium</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <SizeGuideModal isOpen={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
            
            {product && (
                <CoutureFlowModal 
                    isOpen={showCoutureFlow} 
                    onClose={() => setShowCoutureFlow(false)} 
                    product={product}
                    onAddToCart={handleAddToCart}
                />
            )}
        </div>
    );
};

export default ProductDetail;
