import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, MapPin, Truck, CreditCard,
    Smartphone, ArrowLeft, ShieldCheck, Phone,
    AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import { orderAPI } from '@/services/api';

type CheckoutStep = 'info' | 'delivery' | 'payment';

export default function Checkout() {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form States
    const [info, setInfo] = useState({ phone: user?.phone || '', address: '', city: 'Douala' });
    const [deliveryMethod, setDeliveryMethod] = useState('home_standard'); // home_standard, home_far, pickup
    const [paymentMethod, setPaymentMethod] = useState('orange_money'); // orange_money, mtn_money, card, cash
    
    // Remove auto-select cash if pickup
    useEffect(() => {
        // Ensure default payment method is not cash if delivery mode changes from pickup?
        // Let's just keep the user's choice. If they previously chose cash, and switch to delivery, they can still do 'Paiement à la livraison'.
    }, [deliveryMethod]);
    
    // Calc
    const subtotal = cartTotal;
    const shippingCost = deliveryMethod === 'home_standard' ? 1000 : deliveryMethod === 'home_far' ? 2000 : 0;
    const total = subtotal + shippingCost;
    
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Votre panier est vide</h2>
                <button onClick={() => navigate('/products')} className="text-primary-500 hover:underline">Retourner à la boutique</button>
            </div>
        );
    }

    const handleSubmitOrder = async () => {
        setIsLoading(true);
        try {
            const orderData = {
                items: cartItems.map((item: any) => ({
                    product: typeof item.id === 'string' && item.id.startsWith('prod_') ? null : item.id,
                    product_name: item.nom || item.name || 'Produit sans nom',
                    product_price: item.prix || item.price || 0,
                    product_image: item.image_principale || item.image || '',
                    quantity: item.quantity,
                    custom_measurements: item.coutureProfile ? { morphology: item.coutureProfile.morphology, globalSize: item.coutureProfile.globalSize, gender: item.coutureProfile.gender } : item.measurements || {},
                    custom_notes: item.coutureProfile ? `Coupe: ${item.coutureProfile.fit} | Col: ${item.coutureProfile.collarType} | Longueur: ${item.coutureProfile.lengthAdjustment}` : item.personalization || ''
                })),
                shipping_address: {
                    address: info.address,
                    city: info.city,
                },
                billing_address: {
                    address: info.address,
                    city: info.city
                },
                shipping_method: deliveryMethod.startsWith('home') ? 'home' : deliveryMethod,
                shipping_cost: shippingCost,
                payment_method: paymentMethod === 'cash' ? 'cash' : 'nelsius',
                notes: `Phone: ${info.phone}`
            };

            const orderResponse = await orderAPI.create(orderData);
            
            if (paymentMethod === 'cash') {
                clearCart();
                navigate(`/payment/success?order=${orderResponse.order_number}`);
            } else {
                const paymentResponse = await orderAPI.initiatePayment(orderResponse.order_number, {
                    payment_method: 'nelsius',
                    phone: info.phone
                });
                
                if (paymentResponse.success && paymentResponse.payment_url) {
                    clearCart();
                    window.location.href = paymentResponse.payment_url;
                } else {
                    throw new Error(paymentResponse.error || "Erreur lors de l'initialisation du paiement");
                }
            }
        } catch (error: any) {
            console.error("Erreur lors de la commande:", error);
            alert(`Erreur: ${error.message || "Une erreur est survenue lors de la création de la commande."}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 pt-24 pb-20">
            <Navigation />
            
            <main className="container mx-auto px-4 max-w-6xl">
                <div className="mb-10 flex items-center gap-4">
                    <Link to="/cart" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                        Validation
                    </h1>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    
                    {/* Colonne de Gauche : Formulaire */}
                    <div className="xl:col-span-8 space-y-6">
                        
                        {/* 1. Informations (Adresse + Tel) */}
                        <div className={`bg-white dark:bg-[#111] rounded-3xl border ${currentStep === 'info' ? 'border-gray-900 dark:border-white/30 shadow-xl shadow-gray-200/50 dark:shadow-black/50' : 'border-gray-200/50 dark:border-white/10'} overflow-hidden transition-all duration-300`}>
                            <div 
                                className="p-6 md:p-8 flex items-center justify-between cursor-pointer"
                                onClick={() => setCurrentStep('info')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep === 'info' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : info.address && info.phone ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                        {currentStep === 'info' ? '1' : info.address && info.phone ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informations essentielles</h2>
                                        {currentStep !== 'info' && info.address && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{info.city} • {info.phone}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {currentStep === 'info' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 md:px-8 md:pb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-1.5 md:col-span-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Adresse complète de livraison</label>
                                                <div className="relative">
                                                    <input type="text" value={info.address} onChange={e => setInfo({...info, address: e.target.value})} className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white" placeholder="Quartier, rue, repère..." />
                                                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Ville</label>
                                                <select value={info.city} onChange={e => setInfo({...info, city: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white appearance-none cursor-pointer">
                                                    <option value="Douala">Douala</option>
                                                    <option value="Yaoundé">Yaoundé</option>
                                                    <option value="Bafoussam">Bafoussam</option>
                                                    <option value="Garoua">Garoua</option>
                                                    <option value="Autre">Autre ville</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Numéro de téléphone</label>
                                                <div className="relative">
                                                    <input type="tel" value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white" placeholder="+237 6XX XXX XXX" />
                                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setCurrentStep('delivery')} disabled={!info.address || !info.phone} className="mt-8 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20">
                                            Continuer au mode de récupération
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* 2. Mode de récupération (Choix unique : Livraison / Retrait) */}
                        <div className={`bg-white dark:bg-[#111] rounded-3xl border ${currentStep === 'delivery' ? 'border-gray-900 dark:border-white/30 shadow-xl shadow-gray-200/50 dark:shadow-black/50' : 'border-gray-200/50 dark:border-white/10'} overflow-hidden transition-all duration-300`}>
                            <div 
                                className={`p-6 md:p-8 flex items-center justify-between ${info.address && info.phone ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => info.address && info.phone && setCurrentStep('delivery')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep === 'delivery' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : deliveryMethod ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                        {currentStep === 'delivery' ? '2' : deliveryMethod ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mode de récupération</h2>
                                    </div>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {currentStep === 'delivery' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 md:px-8 md:pb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div 
                                                onClick={() => setDeliveryMethod('home_standard')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'home_standard' ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/30'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <Truck className={`w-6 h-6 ${deliveryMethod === 'home_standard' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                                                    {deliveryMethod === 'home_standard' && <CheckCircle2 className="w-5 h-5 text-gray-900 dark:text-white" />}
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Livraison Standard</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">À domicile (&lt; 5km)</p>
                                                <p className="text-gray-900 dark:text-white font-black mt-3">1,000 FCFA</p>
                                            </div>
                                            <div 
                                                onClick={() => setDeliveryMethod('home_far')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'home_far' ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/30'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <Truck className={`w-6 h-6 ${deliveryMethod === 'home_far' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                                                    {deliveryMethod === 'home_far' && <CheckCircle2 className="w-5 h-5 text-gray-900 dark:text-white" />}
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Livraison Longue Distance</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">À domicile (&gt; 5km)</p>
                                                <p className="text-gray-900 dark:text-white font-black mt-3">2,000 FCFA</p>
                                            </div>
                                            <div 
                                                onClick={() => setDeliveryMethod('pickup')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${deliveryMethod === 'pickup' ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/30'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <MapPin className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
                                                    {deliveryMethod === 'pickup' && <CheckCircle2 className="w-5 h-5 text-gray-900 dark:text-white" />}
                                                </div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">Retrait en atelier</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Passez nous voir !</p>
                                                <p className="text-gray-900 dark:text-white font-black mt-3">Gratuit</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setCurrentStep('payment')} className="mt-8 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20">
                                            Continuer le paiement
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. Payment Method */}
                        <div className={`bg-white dark:bg-[#111] rounded-3xl border ${currentStep === 'payment' ? 'border-gray-900 dark:border-white/30 shadow-xl shadow-gray-200/50 dark:shadow-black/50' : 'border-gray-200/50 dark:border-white/10'} overflow-hidden transition-all duration-300`}>
                            <div 
                                className={`p-6 md:p-8 flex items-center justify-between ${deliveryMethod ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => deliveryMethod && setCurrentStep('payment')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${currentStep === 'payment' ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                        3
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Paiement</h2>
                                    </div>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {currentStep === 'payment' && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 md:px-8 md:pb-8">
                                        <div className="space-y-4">
                                            {/* Mobile Money Options */}
                                            <div 
                                                onClick={() => setPaymentMethod('orange_money')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'orange_money' ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-orange-200 dark:hover:border-orange-500/30'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center">
                                                        <Smartphone className="w-6 h-6 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Orange Money</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Paiement Mobile Rapide</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'orange_money' ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {paymentMethod === 'orange_money' && <div className="w-3 h-3 rounded-full bg-orange-500" />}
                                                </div>
                                            </div>

                                            <div 
                                                onClick={() => setPaymentMethod('mtn_money')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'mtn_money' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-400/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-yellow-200 dark:hover:border-yellow-400/30'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-400/20 rounded-xl flex items-center justify-center">
                                                        <Smartphone className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">MTN Mobile Money</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Paiement Mobile Rapide</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mtn_money' ? 'border-yellow-400' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {paymentMethod === 'mtn_money' && <div className="w-3 h-3 rounded-full bg-yellow-400" />}
                                                </div>
                                            </div>
                                            
                                            {/* Credit Card */}
                                            <div 
                                                onClick={() => setPaymentMethod('card')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'card' ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-gray-300 dark:hover:border-white/30'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-xl flex items-center justify-center">
                                                        <CreditCard className="w-6 h-6 text-gray-900 dark:text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Carte Bancaire</h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Visa, Mastercard</p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-gray-900 dark:bg-white" />}
                                                </div>
                                            </div>

                                            {/* Cash / Pickup Payment */}
                                            <div 
                                                onClick={() => setPaymentMethod('cash')}
                                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'cash' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5' : 'border-gray-200/50 dark:border-white/10 bg-white dark:bg-[#111] hover:border-emerald-200 dark:hover:border-emerald-500/30'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                            {deliveryMethod === 'pickup' ? 'Règlement en Atelier' : 'Paiement à la livraison'}
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                            {deliveryMethod === 'pickup' ? 'Réglez sur place lors du retrait' : 'Réglez lorsque vous recevez la commande'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-emerald-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                                    {paymentMethod === 'cash' && <div className="w-3 h-3 rounded-full bg-emerald-500" />}
                                                </div>
                                            </div>
                                        </div>

                                        {!['cash'].includes(paymentMethod) && (
                                            <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-400">
                                                <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold mb-1">Paiement 100% Sécurisé via Nelsius</p>
                                                    <p className="opacity-80">Règlement finalisé discrètement et en toute conformité par notre partenaire Nelsius.</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Colonne de Droite : Résumé de commande */}
                    <div className="xl:col-span-4">
                        <div className="sticky top-28 bg-white/70 dark:bg-[#111]/70 backdrop-blur-2xl rounded-3xl shadow-xl shadow-gray-200/30 dark:shadow-black/50 border border-gray-200/50 dark:border-white/10 overflow-hidden">
                            <div className="p-6 md:p-8 pb-4">
                                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mb-1">Résumé</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{cartItems.length} article{cartItems.length !== 1 ? 's' : ''}</p>
                            </div>

                            {/* Scrollable Items List */}
                            <div className="px-6 md:px-8 max-h-[40vh] overflow-y-auto space-y-4 mb-6 pt-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 flex-shrink-0 relative">
                                            <img src={item.image_principale} alt={item.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute top-0 right-0 bg-gray-900/80 dark:bg-black/80 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-bl-lg">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.nom}</h4>
                                            {(item as any).coutureProfile && (
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-primary-500 mt-0.5">Pièce Sur-Mesure</p>
                                            )}
                                            <p className="font-bold text-gray-600 dark:text-gray-300 text-xs mt-1">{(item.prix * item.quantity).toLocaleString()} FCFA</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 md:px-8 space-y-4 pb-6">
                                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm font-bold">
                                    <span>Sous-total</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{subtotal.toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-sm font-bold">
                                    <span>Livraison</span>
                                    <span className={`font-medium ${shippingCost === 0 ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>{shippingCost === 0 ? 'Gratuit' : `${shippingCost.toLocaleString()} FCFA`}</span>
                                </div>
                                
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

                            <div className="p-6 md:p-8 pt-0">
                                <button 
                                    onClick={handleSubmitOrder}
                                    disabled={isLoading || !info.address || !info.phone || currentStep !== 'payment'}
                                    className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 rounded-2xl" />
                                    {isLoading ? (
                                        <span className="animate-pulse flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                                            Traitement...
                                        </span>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" />
                                            Valider la commande
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs font-medium text-gray-400 mt-4 leading-relaxed">
                                    En validant, vous acceptez nos <Link to="#" className="text-gray-900 dark:text-white underline hover:no-underline">Conditions Générales</Link>.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}

// Custom-scrollbar styling
const styles = `
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; }
`;
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
}
