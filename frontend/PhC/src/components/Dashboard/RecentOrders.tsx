// src/components/dashboard/RecentOrders.tsx
import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, MoreVertical, ArrowRight, Package } from 'lucide-react';
import { orderAPI } from '@/services/api';
import type { Order } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data: any = await orderAPI.getAll();
      const ordersList = Array.isArray(data) ? data : (data.results || []);
      setOrders(ordersList.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recent orders", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-3.5 h-3.5 text-green-700 dark:text-green-400" />;
      case 'processing': return <Clock className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" />;
      case 'cancelled': return <XCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />;
      case 'paid': return <CheckCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-gray-700 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livrée';
      case 'processing': return 'En traitement';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-800 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400';
      case 'processing': return 'text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400';
      case 'pending': return 'text-orange-800 bg-orange-50 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400';
      case 'cancelled': return 'text-red-800 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400';
      case 'paid': return 'text-emerald-800 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400';
      default: return 'text-gray-800 bg-gray-50 border-gray-200 dark:bg-gray-900/30 dark:border-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-pulse bg-white dark:bg-[#111]">
        <div className="h-6 w-48 bg-gray-200 dark:bg-white/5 rounded mt-2 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-white/5 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-white/5 rounded"></div>
              </div>
              <div className="h-6 w-16 bg-gray-200 dark:bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#111] relative">
      <div className="p-5 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">Commandes récentes</h3>
          </div>
          <button onClick={() => navigate('/dashboard/orders')} className="text-gray-600 dark:text-white/60 hover:text-black dark:hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 group/btn">
            Voir toutes <ArrowRight className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead className="bg-[#F7F9FC] dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/5">
                <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 dark:border-white/5">Commande</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 dark:border-white/5">Client</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Montant</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F7F9FC] dark:hover:bg-white/5 transition-colors group/item">
                        <td className="px-5 py-4 border-r border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] flex items-center justify-center shrink-0">
                                   <Package className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                        #{order.order_number}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                        {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td className="px-5 py-4 border-r border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-900 dark:text-gray-300 font-bold">{order.user_full_name || order.user_email || 'Anonyme'}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-xs">
                            {(order.total_amount || 0).toLocaleString()} <span className="text-[9px] uppercase text-gray-500 tracking-widest">FCFA</span>
                            </p>
                            <button className="mt-1 p-1 text-gray-400 hover:text-black dark:hover:text-white transition-opacity opacity-0 group-hover/item:opacity-100 inline-block" onClick={() => navigate('/dashboard/orders')}>
                              <MoreVertical className="w-3 h-3" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center flex flex-col items-center justify-center h-[200px]">
            <Package className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Aucune commande récente</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default RecentOrders;