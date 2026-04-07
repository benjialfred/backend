import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Tag,
  Shield,
  Truck,
  Heart,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Star,
  Lock,
  Gift
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@pages/Productcard';
import AuthModal from '@/components/auth/AuthModal';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState<any>(false);
  const [couponError, setCouponError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Simuler des produits suggérés
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cartItems.length > 0) {
        try {
          // Utilise la catégorie du premier article dans le panier
          const firstItem = cartItems[0];
          // @ts-ignore
          const categoryId = firstItem.category_id || firstItem.category?.id || firstItem.categorie?.id || firstItem.categorie;
          
          if (categoryId) {
            // @ts-ignore (Assuming productAPI is already imported or will be)
            const { productAPI } = await import('@/services/api');
            const response = await productAPI.getAll({ category: categoryId });
            const products = response.results || response;
            
            // Filtrer les produits déjà dans le panier
            const cartProductIds = cartItems.map(item => item.id);
            const suggestions = Array.isArray(products) 
              ? products.filter(p => !cartProductIds.includes(p.id)).slice(0, 4)
              : [];
              
            setSuggestedProducts(suggestions);
          } else {
             // Fallback si pas de catégorie trouvée
             setSuggestedProducts([]);
          }
        } catch (error) {
          console.error("Failed to fetch product suggestions", error);
        }
      } else {
        setSuggestedProducts([]);
      }
    };

    fetchSuggestions();
  }, [cartItems]);

  const removeItem = (id: number) => {
    removeFromCart(id);
  };

  const applyCoupon = () => {
    setIsLoading(true);
    setCouponError('');

    // Simuler une requête API
    setTimeout(() => {
      const validCoupons = [
        { code: 'PROPH10', discount: 0.1, label: '10% de réduction' },
        { code: 'PROPH15', discount: 0.15, label: '15% de réduction' },
        { code: 'LIVRAISON', discount: 0, shipping: 0, label: 'Livraison gratuite' }
      ];

      const couponData = validCoupons.find(c => c.code === coupon.toUpperCase());

      if (couponData) {
        setCouponApplied(couponData);
        setCouponError('');
      } else {
        setCouponError('Code promo invalide. Essayez PROPH10, PROPH15 ou LIVRAISON');
        setCouponApplied(false);
      }
      setIsLoading(false);
    }, 500);
  };

  const subtotal = cartTotal;
  const shipping = couponApplied?.shipping === 0 ? 0 : 1000;
  const discount = couponApplied?.discount ? subtotal * couponApplied.discount : 0;
  const total = subtotal + shipping - discount;

  const continueShopping = () => {
    navigate('/products');
  };

  const proceedToCheckout = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    navigate('/checkout');
  };

  const saveForLater = (item: any) => {
    // Implémentez la logique pour sauvegarder pour plus tard
    console.log('Sauvegardé pour plus tard:', item);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 pt-20">
      <Navigation />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Veuillez vous connecter pour valider votre commande et accéder au paiement sécurisé."
      />

      {/* Notification de succès */}
      <AnimatePresence>
        {couponApplied && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md"
          >
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">Code promo appliqué !</p>
              <p className="text-sm opacity-90">{couponApplied.label}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb et en-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Continuer vos achats</span>
            </Link>

            {cartItems.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-black/50 hover:text-red-600 text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Vider le panier
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
                Votre Panier
                {cartItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold text-sm px-3 py-1 rounded-full border border-gray-200/50 dark:border-white/10 align-middle"
                  >
                    {cartItems.length} article{cartItems.length !== 1 ? 's' : ''}
                  </motion.span>
                )}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {cartItems.length === 0
                  ? "Découvrez nos collections exclusives"
                  : "Presque terminé ! Vérifiez vos articles ci-dessous"
                }
              </p>
            </div>

            {cartItems.length > 0 && (
              <div className="bg-white dark:bg-white/5 rounded-2xl px-6 py-4 border border-gray-200/50 dark:border-white/10 shadow-sm flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Total Estimé</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{total.toLocaleString()} FCFA</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-white/10"></div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Livraison</p>
                  <p className={`font-bold ${shipping === 0 ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                    {shipping === 0 ? 'Offerte' : `${shipping.toLocaleString()} FCFA`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Panier vide */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="relative inline-block mb-8">
              <ShoppingBag className="w-32 h-32 text-black/20 dark:text-primary-200" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-primary-400" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Votre panier vous attend !
            </h2>
            <p className="text-black/60 dark:text-primary-300 text-lg mb-8 max-w-lg mx-auto">
              Ajoutez vos articles préférés et profitez de nos collections exclusives
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={continueShopping}
                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:scale-105 transition-all shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20"
              >
                Découvrir nos produits
              </button>
              <Link
                to="/collections"
                className="px-8 py-4 bg-white dark:bg-white/10 border border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white rounded-full font-bold hover:bg-gray-50 dark:hover:bg-white/20 transition-all"
              >
                Voir les collections
              </Link>
            </div>

            {/* Services mise en avant */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-2xl">
                    <Truck className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Livraison Express</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-left">Sous 24-48h dans tout le Cameroun, offerte dès 100,000 FCFA d'achat.</p>
              </div>

              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-2xl">
                    <Shield className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Paiement Sécurisé</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-left">Transactions cryptées de bout en bout avec Stripe et Orange Money.</p>
              </div>

              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-white/10 rounded-2xl">
                    <RefreshCw className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Retours Faciles</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-left">30 jours pour changer d'avis avec notre politique de retour sans tracas.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Panier avec articles */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Liste des articles */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10 overflow-hidden group hover:shadow-md transition-shadow p-2"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Image */}
                      <div className="md:w-48 relative overflow-hidden rounded-2xl">
                        <img
                          src={item.image_principale || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop"}
                          alt={item.nom}
                          className="w-full h-full min-h-[200px] object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {item.prix_promotion && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            -{Math.round((1 - item.prix_promotion / item.prix) * 100)}%
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-sm hover:scale-110 transition-all text-gray-400 hover:text-red-500"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Link to={`/product/${item.id}`}>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-primary-500 transition-colors">
                                  {item.nom}
                                </h3>
                              </Link>
                              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{item.description}</p>
                            </div>
                            <div className="text-right pl-4">
                              <div className="text-xl font-black text-gray-900 dark:text-white">
                                {item.prix.toLocaleString()} FCFA
                              </div>
                              {item.prix_promotion && (
                                <div className="text-gray-400 line-through text-sm font-medium">
                                  {item.prix_promotion.toLocaleString()} FCFA
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Caractéristiques */}
                          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6 mt-4">
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 pl-1.5 pr-3 py-1 rounded-full border border-gray-100 dark:border-white/5">
                              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                              <span>Taille: <span className="text-gray-900 dark:text-white">{item.taille}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 pl-1.5 pr-3 py-1 rounded-full border border-gray-100 dark:border-white/5">
                              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                              <span>Couleur: <span className="text-gray-900 dark:text-white">{item.couleur}</span></span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-500/10 pl-1.5 pr-3 py-1 rounded-full border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span>
                                {item.stock} dispo{item.stock !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Contrôles quantité et actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-1 relative">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center text-sm font-bold text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                disabled={item.quantity >= item.stock}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-gray-900 dark:text-white font-bold hidden sm:block">
                              = {(item.prix * item.quantity).toLocaleString()} FCFA
                            </div>
                          </div>

                          <div className="flex items-center">
                            <button
                              onClick={() => saveForLater(item)}
                              className="flex items-center gap-2 group text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                              <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span>Sauvegarder</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Code promo et actions */}
              <div className="space-y-6 pt-4">
                {/* Code promo */}
                <div className="bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-200/50 dark:border-white/10 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-400 rounded-xl">
                      <Gift className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold text-black dark:text-white">Code promo</h3>
                      <p className="text-sm text-black/60 dark:text-primary-300">Utilisez PROPH10, PROPH15 ou LIVRAISON</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => {
                            setCoupon(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          placeholder="Code promo"
                          className="w-full px-5 py-4 pl-12 bg-gray-50 !border-0 dark:bg-[#111] dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-bold"
                        />
                        <Tag className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                      {couponError && (
                        <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1.5 ml-4">
                          <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                        </p>
                      )}
                      {couponApplied && (
                        <p className="mt-2 text-xs font-bold text-emerald-500 flex items-center gap-1.5 ml-4">
                          <CheckCircle className="w-3.5 h-3.5" /> {couponApplied.label} appliqué
                        </p>
                      )}
                    </div>
                    <button
                      onClick={applyCoupon}
                      disabled={isLoading || !coupon}
                      className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                      {isLoading ? '...' : 'Appliquer'}
                    </button>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={continueShopping}
                    className="p-4 bg-white dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-center text-sm font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continuer
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-center text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Vider le panier
                  </button>
                </div>
              </div>
            </div>

            {/* Résumé de la commande (sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 transition-all duration-500 z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 dark:bg-[#111]/70 backdrop-blur-2xl rounded-3xl shadow-xl shadow-gray-200/30 dark:shadow-black/50 border border-gray-200/50 dark:border-white/10 overflow-hidden"
                >
                  {/* En-tête résumé */}
                  <div className="p-8 pb-6">
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-1">Résumé</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{cartItems.length} article{cartItems.length !== 1 ? 's' : ''}</p>
                  </div>

                  {/* Détails des prix */}
                  <div className="px-8 space-y-4">
                    <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm font-bold">
                      <span>Sous-total</span>
                      <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                    </div>

                    {couponApplied && couponApplied.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Réduction ({couponApplied.discount * 100}%)</span>
                        <span className="font-medium">-{discount.toLocaleString()} FCFA</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm font-bold">
                      <span>Livraison</span>
                      <span className={`${shipping === 0 ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                        {shipping === 0 ? 'Offerte 🎉' : `${shipping.toLocaleString()} FCFA`}
                      </span>
                    </div>

                    {couponApplied?.shipping === 0 && shipping > 0 && (
                      <div className="flex justify-between text-emerald-500 text-sm font-bold">
                        <span>Livraison offerte</span>
                        <span>Offerte</span>
                      </div>
                    )}

                    <div className="border-t border-gray-200/50 dark:border-white/10 pt-6 mt-6">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                          {total.toLocaleString()} FCFA
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 text-right uppercase tracking-widest font-bold">TVA incluse</p>
                    </div>
                  </div>

                  {/* Bouton de validation */}
                  <div className="p-8 pt-6">
                    <button
                      onClick={proceedToCheckout}
                      className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-5 h-5" />
                      Passer la commande
                    </button>
                  </div>

                  {/* Garanties */}
                  <div className="bg-gray-50 dark:bg-white/5 p-6 border-t border-gray-200/50 dark:border-white/10 space-y-5">
                    <div className="flex items-center gap-4">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Paiement 100% sécurisé</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Livraison 24-48h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <RefreshCw className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Retours gratuits sous 30j</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Badge économie */}
                {couponApplied && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-2xl shadow-sm text-center"
                  >
                    <div className="text-xl font-black mb-0.5">
                      -{discount.toLocaleString()} FCFA
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider">Économie appliquée</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Produits recommandés */}
        {cartItems.length > 0 && suggestedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
                  Complétez votre look
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Articles fréquemment achetés ensemble</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-200/50 dark:border-white/10 text-gray-900 dark:text-white">
                <Star className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold uppercase tracking-wider">Nos meilleures ventes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Panier */}
        {cartItems.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="space-y-4">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl"><Truck className="w-5 h-5 text-gray-900 dark:text-white" /></div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Livraison</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-12 text-sm">Récupération gratuite à la boutique, ou livraison express 24/48h avec suivi en temps réel.</p>
                </div>
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl"><RefreshCw className="w-5 h-5 text-gray-900 dark:text-white" /></div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Retours</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-12 text-sm">30 jours pour changer d'avis. Le processus de retour est simple, rapide et entièrement gratuit.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl"><Shield className="w-5 h-5 text-gray-900 dark:text-white" /></div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Sécurité</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-12 text-sm">Vos données de paiement sont protégées par un cryptage SSL 256-bit de niveau bancaire.</p>
                </div>
                <div className="bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl"><CheckCircle className="w-5 h-5 text-gray-900 dark:text-white" /></div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Support Client</h3>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 pl-12 text-sm">Une équipe dévouée, disponible 7j/7 pour vous accompagner à chaque étape de votre commande.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de confirmation vider panier */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#111] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-white/10"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                  Vider le panier ?
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Vous êtes sur le point de supprimer <strong className="text-gray-900 dark:text-white">{cartItems.length} article{cartItems.length !== 1 ? 's' : ''}</strong>. Cette action est irréversible.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    clearCart();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Cart;