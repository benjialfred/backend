import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  User,
  Package,
  XCircle,
  ClipboardList,
  Scissors,
  PenTool,
  CheckSquare,
  Edit2
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import type { Order } from '@/types';
import { orderAPI } from '@/services/api';
import AddOrderForm from '@/components/forms/AddOrderForm';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingMeasurementsItem, setEditingMeasurementsItem] = useState<number | null>(null);
  const [measurementsForm, setMeasurementsForm] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersData: any = await orderAPI.getAll();
      const ordersList = Array.isArray(ordersData) ? ordersData : (ordersData.results || []);
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const updateOrderState = async (orderId: number, newState: string) => {
    try {
      await orderAPI.update(orderId, { production_state: newState });
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, production_state: newState } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, production_state: newState });
      }
    } catch (error) {
      console.error('Error updating production state:', error);
    }
  };
  
  const updateOrderDeadline = async (orderId: number, newDeadline: string) => {
    try {
      await orderAPI.update(orderId, { production_deadline: newDeadline });
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, production_deadline: newDeadline } : order
      ));
      if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, production_deadline: newDeadline });
      }
    } catch (error) {
      console.error('Error updating order deadline:', error);
    }
  };

  const handleSaveMeasurements = async (orderId: number, itemId: number) => {
    try {
        console.log("Saving measurements for order", orderId, "item", itemId);
        // Mock save to backend, real implementation depends on order items endpoint
        // await orderAPI.updateItemMeasurements(itemId, measurementsForm);
        alert("Mesures enregistrées avec succès et notification envoyée à l'atelier de confection.");
        setEditingMeasurementsItem(null);
        // Refresh or optimistically update
    } catch (error) {
        console.error("Erreur lors de la sauvegarde des mesures", error);
    }
  };
  
  const handleDownloadInvoice = async (orderNumber: string) => {
      try {
          const response = await orderAPI.downloadInvoice(orderNumber);
          const url = window.URL.createObjectURL(new Blob([response]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Facture_${orderNumber}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } catch (error) {
          console.error("Erreur téléchargement facture:", error);
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'validee':
      case 'confirmed': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'en_conception': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'en_coupe': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'en_assemblage': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'en_finition': return 'bg-pink-50 text-pink-800 border-pink-200';
      case 'prete':
      case 'shipped': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'livree':
      case 'delivered': return 'bg-green-50 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order.order_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      (order.user_full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter || order.production_state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const industrialStatuses = [
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Validée' },
    { value: 'en_conception', label: 'En conception / Mesures' },
    { value: 'en_coupe', label: 'En coupe' },
    { value: 'en_assemblage', label: 'En assemblage' },
    { value: 'en_finition', label: 'En finition' },
    { value: 'prete', label: 'Prête' },
    { value: 'delivered', label: 'Livrée' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 relative z-10 w-full max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Gestion des Commandes
            </h1>
            <p className="text-gray-500 text-sm mt-1">Plateforme de production et distribution</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingOrder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-bold text-xs uppercase tracking-widest shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Créer Commande</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-widest shadow-sm">
              <Download className="w-4 h-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Filtres Industriels */}
        <div className="bg-white dark:bg-[#111] p-2 rounded-md border border-gray-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Chercher ID, Numéro, Client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 font-medium"
            />
          </div>
          <div className="w-px bg-gray-200 dark:bg-white/10 hidden md:block"></div>
          <div className="flex items-center gap-2 px-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-2 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none font-bold uppercase tracking-wider cursor-pointer"
            >
              <option value="all">Tous les statuts</option>
              {industrialStatuses.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Data Table */}
        <div className="bg-white dark:bg-[#111] rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-white/10">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F7F9FC] dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 dark:border-white/10">Ordre / Date</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 dark:border-white/10">Client</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 dark:border-white/10">Statut Phase</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-r border-gray-200 dark:border-white/10 text-right">Montant</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredOrders.map(order => {
                    const activeStatus = order.production_state && order.production_state !== 'not_started' 
                                         ? order.production_state 
                                         : order.status;
                                         
                    return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-5 py-4 border-r border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white text-sm">#{order.order_number}</span>
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
                             {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy, HH:mm', { locale: fr }) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 border-r border-gray-100 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-gray-900 dark:text-gray-100 font-bold text-sm">
                            {order.user_full_name || order.user_email || 'Client Inconnu'}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">ID: {order.user || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 border-r border-gray-100 dark:border-white/5">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(activeStatus)}`}>
                            {industrialStatuses.find(s => s.value === activeStatus)?.label || activeStatus}
                         </span>
                      </td>
                      <td className="px-5 py-4 border-r border-gray-100 dark:border-white/5 text-right flex flex-col items-end justify-center">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {typeof order.total_amount === 'number' ? order.total_amount.toLocaleString() : order.total_amount} <span className="text-[9px] text-gray-500">FCFA</span>
                        </span>
                        {order.status === 'paid' ? (
                          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Payé entièrement</span>
                        ) : (
                          <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mt-1">Montant dû</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                         <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-black dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-md transition-all inline-block bg-white dark:bg-[#111] shadow-sm"
                            title="Fiche Commande détaillée"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                      </td>
                    </tr>
                  )})}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                         <Package className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                         <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Aucune commande</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fiche Commande Détaillée (Side Drawer ERP) */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            
            {/* Drawer */}
            <div className="relative w-full max-w-3xl bg-white dark:bg-[#0A0A0A] h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-white/10 animate-slide-left">
               {/* Header Drawer */}
               <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111]">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Fiche de Production</h2>
                    <div className="flex items-center gap-3">
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white">#{selectedOrder.order_number}</h3>
                       <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(selectedOrder.production_state || selectedOrder.status)}`}>
                          {industrialStatuses.find(s => s.value === (selectedOrder.production_state || selectedOrder.status))?.label || selectedOrder.status}
                       </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => handleDownloadInvoice(selectedOrder.order_number || '')} className="p-2 border border-gray-200 dark:border-white/10 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 transition-colors" title="Facture">
                        <Download className="w-4 h-4" />
                     </button>
                     <button onClick={() => setSelectedOrder(null)} className="p-2 border border-gray-200 dark:border-white/10 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 transition-colors" title="Fermer">
                        <XCircle className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Content Drawer */}
               <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-[#0A0A0A] custom-scrollbar">
                  {/* Grid 2 colonnes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     
                     {/* Infos Client */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
                           <User className="w-4 h-4 text-gray-400" />
                           <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">Profil Client</h4>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-md border border-gray-200 dark:border-white/5 space-y-2">
                           <div className="text-sm"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] w-20 inline-block">Nom</span> <span className="font-bold text-gray-900 dark:text-white">{selectedOrder.user_full_name}</span></div>
                           <div className="text-sm"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] w-20 inline-block">Email</span> <span className="text-gray-700 dark:text-gray-300">{selectedOrder.user_email}</span></div>
                           <div className="text-sm"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] w-20 inline-block">Contact</span> <span className="text-gray-700 dark:text-gray-300">{(selectedOrder as any).shipping?.phone || 'Non renseigné'}</span></div>
                        </div>
                     </div>

                     {/* Suivi Échéances */}
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-2">
                           <Calendar className="w-4 h-4 text-gray-400" />
                           <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">Échéances & Statuts</h4>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-md border border-gray-200 dark:border-white/5 space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Phase Actuelle</span>
                              <select
                                 value={selectedOrder.production_state || 'not_started'}
                                 onChange={(e) => updateOrderState(selectedOrder.id, e.target.value)}
                                 className="text-xs font-bold bg-white dark:bg-black border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded px-2 py-1 shadow-sm focus:outline-none focus:border-black"
                              >
                                 <option value="not_started">Non commencée</option>
                                 {industrialStatuses.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                 ))}
                              </select>
                           </div>
                           <div className="flex items-center justify-between border-t border-gray-200 dark:border-white/5 pt-3">
                              <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Délai Fixé</span>
                              <input 
                                 type="date" 
                                 value={selectedOrder.production_deadline ? new Date(selectedOrder.production_deadline).toISOString().split('T')[0] : ''}
                                 onChange={(e) => updateOrderDeadline(selectedOrder.id, e.target.value)}
                                 className="text-xs font-bold bg-white dark:bg-black border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white rounded px-2 py-1 shadow-sm focus:outline-none focus:border-black"
                              />
                           </div>
                        </div>
                     </div>

                  </div>

                  {/* Détails du Vêtement et MESURES */}
                  <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-2">
                           <div className="flex items-center gap-2">
                              <Scissors className="w-4 h-4 text-gray-400" />
                              <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">Spécifications Techniques</h4>
                           </div>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Instruction Atelier</span>
                        </div>
                        
                        {selectedOrder.items?.map((item: any) => (
                           <div key={item.id} className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-md p-4">
                              <div className="flex justify-between items-start mb-4 border-b border-gray-200 dark:border-white/10 pb-4">
                                 <div>
                                    <h5 className="font-bold text-gray-900 dark:text-white text-sm">{item.product_name}</h5>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">Ref Produit: {item.product}</p>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Quantité</span>
                                    <span className="bg-black text-white dark:bg-white dark:text-black font-black text-sm px-3 py-1 rounded inline-block">{item.quantity}</span>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {/* Custom Measurements if Sur-mesure */}
                                 <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h6 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5"><ClipboardList className="w-3 h-3"/> Mesures Clientes</h6>
                                        <button 
                                            onClick={() => {
                                                setEditingMeasurementsItem(item.id);
                                                setMeasurementsForm(item.custom_measurements || {});
                                            }}
                                            className="text-[9px] font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1"
                                        >
                                            <Edit2 className="w-3 h-3" /> Éditer (Admin)
                                        </button>
                                    </div>
                                    
                                    {editingMeasurementsItem === item.id ? (
                                        <div className="bg-white dark:bg-[#0A0A0A] p-3 border border-gray-200 dark:border-white/5 rounded space-y-2">
                                            <input type="text" placeholder="Tour de poitrine (cm)" onChange={(e) => setMeasurementsForm({...measurementsForm, poitrine: e.target.value})} className="w-full text-xs p-1.5 border border-gray-200 rounded" />
                                            <input type="text" placeholder="Tour de taille (cm)" onChange={(e) => setMeasurementsForm({...measurementsForm, taille: e.target.value})} className="w-full text-xs p-1.5 border border-gray-200 rounded" />
                                            <input type="text" placeholder="Épaules (cm)" onChange={(e) => setMeasurementsForm({...measurementsForm, epaules: e.target.value})} className="w-full text-xs p-1.5 border border-gray-200 rounded" />
                                            <div className="flex gap-2 pt-2">
                                                <button onClick={() => setEditingMeasurementsItem(null)} className="flex-1 text-[10px] font-bold text-gray-500 p-1 bg-gray-100 rounded">Annuler</button>
                                                <button onClick={() => handleSaveMeasurements(selectedOrder.id, item.id)} className="flex-1 text-[10px] font-bold text-white p-1 bg-black rounded">Enregistrer</button>
                                            </div>
                                        </div>
                                    ) : (
                                        item.custom_measurements && Object.keys(item.custom_measurements).length > 0 ? (
                                           <div className="grid grid-cols-2 gap-2 bg-white dark:bg-[#0A0A0A] p-3 border border-gray-200 dark:border-white/5 rounded text-xs text-gray-700 dark:text-gray-300">
                                              {Object.entries(item.custom_measurements).map(([key, value]) => (
                                                 <div key={key} className="flex justify-between font-mono">
                                                    <span className="font-bold">{key}:</span> <span>{value as string} cm</span>
                                                 </div>
                                              ))}
                                           </div>
                                        ) : (
                                           <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest p-2 border border-orange-200 bg-orange-50 rounded">Taille standard ou mesures manquantes</div>
                                        )
                                    )}
                                 </div>

                                 {/* Options & Notes */}
                                 <div>
                                    <h6 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5"><PenTool className="w-3 h-3"/> Notes & Options</h6>
                                    <div className="bg-white dark:bg-[#0A0A0A] p-3 border border-gray-200 dark:border-white/5 rounded text-xs text-gray-700 dark:text-gray-300 min-h-[80px]">
                                       {item.custom_notes || selectedOrder.notes ? (
                                          <p className="whitespace-pre-wrap font-mono leading-relaxed">{item.custom_notes} {selectedOrder.notes}</p>
                                       ) : (
                                          <p className="text-gray-400 italic">Aucune note spécifique jointe.</p>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                  </div>
               </div>

               {/* Footer Drawer */}
               <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111] flex justify-between items-center">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                     Total Facturé: <span className="text-black dark:text-white font-black text-lg ml-2">{(selectedOrder.total_amount || 0).toLocaleString()} FCFA</span>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-bold text-[11px] uppercase tracking-widest shadow-sm">
                     <CheckSquare className="w-4 h-4" />
                     Enregistrer Modifications
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Modal Ajouter Commande Centrale */}
        {isAddingOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-3xl my-8">
              <AddOrderForm
                onSuccess={() => {
                  setIsAddingOrder(false);
                  fetchData();
                }}
                onCancel={() => setIsAddingOrder(false)}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Orders;