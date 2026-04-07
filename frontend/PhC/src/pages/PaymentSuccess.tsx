import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight, Calendar, MapPin, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderNumber = searchParams.get('order');
    const transactionId = searchParams.get('transaction_id');
    const { clearCart } = useCart();
    const [showBooking, setShowBooking] = useState(false);

    useEffect(() => {
        // Vider le panier si on arrive sur cette page
        clearCart();
    }, []);

    // Simuler une soumission de RDV
    const handleBookAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Votre demande de rendez-vous a bien été enregistrée. L'atelier vous contactera très vite.");
        setShowBooking(false);
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] font-sans transition-colors duration-300 relative overflow-hidden flex flex-col">
            {/* Background Festive Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-10%] w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 w-full">
                <Navigation />
            </div>

            <main className="flex-grow container mx-auto px-4 py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl items-start">
                
                {/* Colonne Gauche : Confirmation de Paiement Principale */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white/90 dark:bg-[#111] backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200/50 dark:border-white/10 w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="w-24 h-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100 dark:border-green-500/20"
                    >
                        <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
                    </motion.div>

                    <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white mb-4">Commande Confirmée !</h1>

                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        Merci pour votre confiance. Votre commande a été enregistrée avec succès.
                        Notre atelier commence à préparer votre pièce.
                    </p>

                    <div className="bg-gray-50 dark:bg-dark-900/50 rounded-2xl p-6 mb-8 text-left border border-gray-200/50 dark:border-white/5">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Référence</span>
                            <span className="font-bold font-display text-gray-900 dark:text-white">{orderNumber || 'En cours...'}</span>
                        </div>
                        {transactionId && (
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-white/5">
                                <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">ID Nelsius</span>
                                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 px-2 py-1 rounded-md border border-gray-200 dark:border-white/5">{transactionId}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/client/orders"
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-md"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Mes Commandes
                        </Link>

                        <Link
                            to="/products"
                            className="flex-1 flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 px-6 py-4 rounded-xl font-medium transition-colors"
                        >
                            Continuer la visite <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Colonne Droite : Modules Post-Commande / Atelier */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    {/* Module 1: Prise de RDV pour Mesures */}
                    <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-[#111] p-8 md:p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-3">Prise de Mesures en Atelier</h2>
                            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                                Assurez un tombé absolument parfait. Nos tailleurs vous accueillent pour prendre vos mesures exactes et personnaliser votre création.
                            </p>

                            {!showBooking ? (
                                <button 
                                    onClick={() => setShowBooking(true)}
                                    className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Prendre Rendez-vous
                                </button>
                            ) : (
                                <form onSubmit={handleBookAppointment} className="space-y-4 bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <h3 className="font-bold text-sm text-gray-300">Choisissez votre créneau :</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="date" required className="bg-black/50 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white w-full" />
                                        <select required className="bg-black/50 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white w-full">
                                            <option value="">Heure</option>
                                            <option value="10:00">10:00 - 11:00</option>
                                            <option value="14:00">14:00 - 15:00</option>
                                            <option value="16:00">16:00 - 17:00</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setShowBooking(false)} className="px-4 py-2 bg-transparent border border-white/20 text-white text-sm rounded-lg hover:bg-white/5">Annuler</button>
                                        <button type="submit" className="flex-1 px-4 py-2 bg-primary-500 text-black font-bold text-sm rounded-lg hover:bg-primary-600 transition-colors">Confirmer le RDV</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Module 2: Visite de l'atelier (Général) */}
                    <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200/50 dark:border-white/10 flex gap-6 items-start hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer group">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <MapPin className="w-6 h-6 text-gray-900 dark:text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Visite Libre de l'Atelier</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Découvrez les coulisses de notre création, observez nos artisans au travail et laissez-vous conseiller sans engagement.
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <Clock className="w-4 h-4" />
                                Lun - Sam : 09h00 à 18h00
                            </div>
                        </div>
                    </div>

                </motion.div>

            </main>

            <div className="relative z-10 w-full mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default PaymentSuccess;
