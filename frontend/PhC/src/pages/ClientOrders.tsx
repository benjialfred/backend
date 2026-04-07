import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { orderAPI } from '@/services/api';
import type { Order } from '@/types';
import { ShoppingBag, Package, Search, Clock, CheckCircle, Truck, XCircle, ChevronRight, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrderTracking } from '@/components/Dashboard/client/OrderTracking';

const ClientOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const ordersData: any = await orderAPI.getAll();
                const safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData.results || []);
                setOrders(safeOrders);

                // Check if an order ID is passed in the query params to auto-open it
                const params = new URLSearchParams(location.search);
                const orderId = params.get('id');
                if (orderId && safeOrders.length > 0) {
                    const found = safeOrders.find((o: Order) => o.id.toString() === orderId);
                    if (found) {
                        setSelectedOrder(found);
                    }
                }
            } catch (err) {
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [location.search]);

    const handleDownloadInvoice = async (orderNumber: string) => {
        setDownloadingInvoice(true);
        try {
            const blob = await orderAPI.downloadInvoice(orderNumber);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Facture_${orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Facture téléchargée avec succès.');
        } catch (error) {
            console.error('Erreur lors du téléchargement de la facture:', error);
            toast.error('Erreur lors du téléchargement de la facture.');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
            case 'pending':
                return 'bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20';
            case 'confirmed':
            case 'processing':
            case 'measurements_taken':
            case 'cutting':
            case 'sewing':
            case 'fitting':
            case 'in_production':
                return 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
            case 'preparing':
            case 'ready':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
            case 'shipped':
                return 'bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
            case 'delivered':
                return 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
            case 'cancelled':
                return 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
            case 'paid':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            default:
                return 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-gray-500/20';
        }
    };


    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'processing':
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />;
            case 'shipped':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'pending': 'En attente',
            'paid': 'Payée',
            'processing': 'En traitement',
            'confirmed': 'Confirmée',
            'shipped': 'Expédiée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        return labels[status.toLowerCase()] || status;
    };

    const getDisplayStatusLabel = (order: any) => {
        if (['paid', 'confirmed', 'processing'].includes(order.status) && order.production_state && order.production_state !== 'not_started') {
            const stateLabels: Record<string, string> = {
                'measurements_taken': 'Mesures prises',
                'cutting': 'En coupe',
                'sewing': 'En couture',
                'fitting': 'Passer essayer',
                'in_production': 'En confection',
                'ready': 'Prête'
            };
            return stateLabels[order.production_state] || getStatusLabel(order.status);
        }
        return getStatusLabel(order.status);
    };

    const getDisplayStatusColor = (order: any) => {
        if (['paid', 'confirmed', 'processing'].includes(order.status) && order.production_state && order.production_state !== 'not_started') {
             if (order.production_state === 'ready') return 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
             return 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
        }
        return getStatusColor(order.status);
    };
    
    const getDisplayStatusIcon = (order: any) => {
        if (['paid', 'confirmed', 'processing'].includes(order.status) && order.production_state && order.production_state !== 'not_started') {
            if (order.production_state === 'ready') return <Package className="w-4 h-4" />;
            return <CheckCircle className="w-4 h-4" />;
        }
        return getStatusIcon(order.status);
    };

    return (
        <div className="animate-fade-in relative z-10 w-full max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Mes Commandes</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Suivez l'état de confection et d'expédition de vos tenues.</p>
            </div>


                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher par N° de commande..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-white dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-sm min-w-[200px] shadow-sm"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="processing">En traitement</option>
                            <option value="measurements_taken">Mesures prises</option>
                            <option value="cutting">En coupe</option>
                            <option value="sewing">En couture</option>
                            <option value="fitting">Passer essayer</option>
                            <option value="in_production">En confection</option>
                            <option value="shipped">Expédiée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-white/10 border-b-primary-500"></div>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white/90 dark:bg-[#111] backdrop-blur-md p-5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-primary-500/30 hover:shadow-md cursor-pointer transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shadow-sm transition-colors ${order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                        order.status === 'processing' || order.status === 'in_production' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                            'bg-gray-50 text-gray-500 border-gray-200 dark:bg-dark-800 dark:text-gray-400 dark:border-white/10 group-hover:dark:border-white/20'
                                        }`}>
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold font-display text-gray-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">#{order.order_number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 inline-block mx-1"></span>
                                            {order.items?.length || 0} {order.items?.length === 1 ? 'article' : 'articles'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 border-t border-gray-100 dark:border-white/5 md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                                    <div className="text-left md:text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Montant Total</p>
                                        <p className="font-bold font-display text-gray-900 dark:text-white text-lg">
                                            {typeof order.total_amount === 'number' ? order.total_amount.toLocaleString() : order.total_amount} XAF
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getDisplayStatusColor(order)}`}>
                                            {getDisplayStatusIcon(order)}
                                            {getDisplayStatusLabel(order)}
                                        </span>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-black transition-colors border border-gray-200 dark:border-transparent group-hover:border-primary-500">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/90 dark:bg-[#111] backdrop-blur-md p-12 rounded-3xl text-center border border-gray-200 dark:border-white/10 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-white/10">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-2">Aucune commande trouvée</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                            {searchTerm || statusFilter !== 'all'
                                ? "Aucune commande ne correspond à vos critères de recherche."
                                : "Vous n'avez pas encore passé de commande sur notre boutique."}
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                if (!searchTerm && statusFilter === 'all') navigate('/products');
                            }}
                            className="bg-primary-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-sm inline-flex items-center justify-center"
                        >
                            {searchTerm || statusFilter !== 'all' ? 'Réinitialiser les filtres' : 'Découvrir nos produits'}
                        </button>
                    </div>
                )}

                {/* Modal Détails Commande */}
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/80 dark:bg-dark-950/50">
                                <div>
                                    <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-3">
                                        Commande #{selectedOrder.order_number}
                                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${getDisplayStatusColor(selectedOrder)}`}>
                                            {getDisplayStatusLabel(selectedOrder)}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Passée le {new Date(selectedOrder.created_at).toLocaleDateString()} à {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-200 dark:border-white/10 shadow-sm"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                                {/* Suivi de la Commande */}
                                <div className="mb-4">
                                   <OrderTracking status={selectedOrder.status} production_state={selectedOrder.production_state} />
                                </div>

                                {/* Informations Globales */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-gray-50 dark:bg-dark-800/50 border border-gray-100 dark:border-white/5">
                                    <div className="space-y-3">
                                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">Paiement & Livraison</h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400 mr-2">Méthode:</span> <span className="capitalize">{selectedOrder.payment_method}</span></p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400 mr-2">Statut Paiement:</span>
                                            <span className={selectedOrder.payment_status === 'paid' ? 'text-green-600 dark:text-green-400 font-bold ml-1' : 'text-yellow-600 dark:text-yellow-400 font-bold ml-1'}>
                                                {selectedOrder.payment_status === 'paid' ? 'Payé' : 'En attente'}
                                            </span>
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300"><span className="text-gray-500 dark:text-gray-400 mr-2">Expédition:</span> {selectedOrder.shipping_method || 'Standard'}</p>
                                        
                                        {selectedOrder.production_deadline && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">Conception</h3>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-primary-500" />
                                                    <span className="text-gray-500 dark:text-gray-400">Prêt estimé pour :</span> 
                                                    <span className="font-bold">{new Date(selectedOrder.production_deadline).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-2">Récapitulatif</h3>
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>Sous-total</span>
                                            <span>{selectedOrder.subtotal?.toLocaleString()} XAF</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>Frais de port</span>
                                            <span>{selectedOrder.shipping_cost?.toLocaleString()} XAF</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-white/5 mt-2">
                                            <span>Total</span>
                                            <span className="text-primary-600 dark:text-primary-400">{selectedOrder.total_amount?.toLocaleString()} XAF</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Articles */}
                                <div>
                                    <h3 className="text-sm font-bold font-display text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-primary-500" />
                                        Articles ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map((item: any) => (
                                            <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-950/50 border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                                                <div className="w-20 h-20 rounded-lg bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                    {item.product_image ? (
                                                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 text-center sm:text-left">
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.product_name}</h4>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Prix U.: {item.product_price} XAF | Qté: {item.quantity}</p>
                                                </div>
                                                <div className="font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">
                                                    {(parseFloat(item.product_price) * item.quantity).toLocaleString()} XAF
                                                </div>
                                            </div>
                                        ))}
                                        {(!selectedOrder.items || selectedOrder.items.length === 0) && (
                                            <div className="text-center p-4 text-gray-500 dark:text-gray-400 text-sm">Aucun article détaillé.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-dark-950/50 flex justify-end">
                                <button
                                    onClick={() => handleDownloadInvoice(selectedOrder.order_number)}
                                    disabled={downloadingInvoice}
                                    className="px-5 py-2.5 rounded-xl border font-bold flex items-center gap-2 text-sm bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 shadow-sm transition-colors disabled:opacity-50"
                                >
                                    <Download className={`w-4 h-4 ${downloadingInvoice ? 'animate-bounce' : ''}`} />
                                    {downloadingInvoice ? 'Téléchargement...' : 'Télécharger la facture'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
        </div>
    );
};

export default ClientOrders;
