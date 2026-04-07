import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    ShoppingBag,
    Bell,
    Camera,
    Package,
    Clock,
    Gift,
    LogOut,
    Settings,
    ChevronRight,
    Search,
    Calendar,
    X
} from 'lucide-react';
import NotificationMenu from '@/components/communications/NotificationMenu';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { orderAPI, announcementAPI, authAPI, appointmentAPI } from '@/services/api';
import type { Order, Announcement } from '@/types';

interface Appointment {
    id: string;
    date_requested: string;
    reason: string;
    status: 'PENDING' | 'VALIDATED' | 'CANCELLED';
}

const ClientDashboard = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Appointment Modal State
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentReason, setAppointmentReason] = useState('');
    const [submittingAppointment, setSubmittingAppointment] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Orders
                let safeOrders: Order[] = [];
                try {
                    const ordersData: any = await orderAPI.getAll();
                    safeOrders = Array.isArray(ordersData) ? ordersData : (ordersData.results || []);
                } catch (err) {
                    console.error('Error fetching orders:', err);
                }
                setOrders(safeOrders);

                // Fetch Announcements
                let safeAnnouncements: Announcement[] = [];
                try {
                    const announcementsData: any = await announcementAPI.getAll();
                    const annList = Array.isArray(announcementsData) ? announcementsData : (announcementsData.results || []);
                    safeAnnouncements = annList.filter((a: Announcement) => a.is_public || a.target_role === 'CLIENT');
                } catch (err) {
                    console.error('Error fetching announcements:', err);
                }
                setAnnouncements(safeAnnouncements);

                // Fetch Appointments
                try {
                    const aptData: any = await appointmentAPI.getAll();
                    setAppointments(Array.isArray(aptData) ? aptData : (aptData.results || []));
                } catch (err) {
                    console.error('Error fetching appointments:', err);
                }

            } catch (error) {
                console.error('Critical Error fetching dashboard data:', error);
                toast.error('Impossible de charger les données');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointmentDate || !appointmentReason) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        setSubmittingAppointment(true);
        try {
            const newApt = await appointmentAPI.create({
                date_requested: appointmentDate,
                reason: appointmentReason
            });
            setAppointments([newApt, ...appointments]);
            toast.success('Demande de rendez-vous envoyée avec succès');
            setIsAppointmentModalOpen(false);
            setAppointmentDate('');
            setAppointmentReason('');
        } catch (error) {
            console.error('Error creating appointment:', error);
            toast.error('Erreur lors de la prise de rendez-vous');
        } finally {
            setSubmittingAppointment(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('L\'image ne doit pas dépasser 5MB');
            return;
        }

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('photo_profil', file);

        try {
            const response = await authAPI.updateProfile(formData as any);
            updateUser(response as unknown as any);
            toast.success('Photo de profil mise à jour');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50/50 dark:bg-[#0a0a0a] font-sans overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
            {/* Sidebar Navigation */}
            <aside className={`w-72 bg-white/90 dark:bg-[#111] backdrop-blur-md border-r border-gray-200/50 dark:border-white/10 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full fixed z-20 h-full'}`}>
                <div className="h-20 flex items-center px-8 border-b border-gray-200/50 dark:border-white/10">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-primary-500 text-2xl font-light">Prophétie</span>
                        <span className="text-xl font-bold font-display tracking-tight text-gray-900 dark:text-white"> Couture</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Menu Principal</div>

                    <Link to="/client/dashboard" className="flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-700 rounded-lg group border-l-4 border-primary-500 font-medium">
                        <span className="material-symbols-outlined text-primary-600">dashboard</span>
                        Tableau de bord
                    </Link>

                    <Link to="/client/orders" className="flex items-center gap-3 px-4 py-3 text-dark-700 dark:text-primary-200 hover:bg-white hover:text-dark-900 dark:text-white rounded-lg group transition-colors border-l-4 border-transparent hover:border-primary-500/50 dark:border-dark-600 font-medium">
                        <Package className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        Mes Commandes
                    </Link>

                    <Link to="/products" className="flex items-center gap-3 px-4 py-3 text-dark-700 dark:text-primary-200 hover:bg-white hover:text-dark-900 dark:text-white rounded-lg group transition-colors border-l-4 border-transparent hover:border-primary-500/50 dark:border-dark-600 font-medium">
                        <ShoppingBag className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        Nouvelle Commande
                    </Link>

                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4 mt-8">Mon Compte</div>

                    <Link to="/client/settings" className="flex items-center gap-3 px-4 py-3 text-dark-700 dark:text-primary-200 hover:bg-white hover:text-dark-900 dark:text-white rounded-lg group transition-colors border-l-4 border-transparent hover:border-primary-500/50 dark:border-dark-600 font-medium">
                        <Settings className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" />
                        Paramètres
                    </Link>

                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg group transition-colors border-l-4 border-transparent hover:border-red-500 font-medium text-left">
                        <LogOut className="w-5 h-5 text-red-500" />
                        Déconnexion
                    </button>
                </nav>

                <div className="p-6 border-t border-primary-500/10">
                    <div className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                            {getInitials(user?.prenom || '', user?.nom || '')}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.prenom} {user?.nom}</p>
                            <p className="text-xs text-dark-600 dark:text-primary-300 truncate">Membre Privilège</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-4 w-1/2">
                        <button
                            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <span className="material-symbols-outlined text-2xl">menu</span>
                        </button>

                        <div className="relative w-full max-w-md hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Rechercher une commande, un article..."
                                className="w-full bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 outline-none rounded-full pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:bg-white dark:focus:bg-[#111] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationMenu />

                        <div className="flex items-center gap-3 border-l border-primary-500/50 dark:border-dark-700 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold">{user?.prenom}</p>
                                <p className="text-xs text-dark-600 dark:text-primary-300">Client</p>
                            </div>
                            <div className="relative group/avatar cursor-pointer">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    {user?.photo_profil ? (
                                        <img src={user.photo_profil} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-700">
                                            {getInitials(user?.prenom || '', user?.nom || '')}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full cursor-pointer">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                </label>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Scrollable Content */}
                <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Welcome Banner */}
                        <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-black/50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="absolute right-0 top-0 w-64 h-full bg-primary-500/5 -skew-x-12 transform origin-top pointer-events-none"></div>

                            <div className="relative z-10 text-center md:text-left">
                                <h1 className="text-3xl font-display font-bold mb-2 text-gray-900 dark:text-white">
                                    Bonjour, {user?.prenom} <span className="inline-block animate-wave origin-bottom-right">👋</span>
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 max-w-lg">Prêt à donner vie à vos prochaines créations ? Explorez nos nouveautés ou suivez l'avancement de vos commandes.</p>
                            </div>

                            <div className="relative z-10 flex gap-4 w-full md:w-auto">
                                <button onClick={() => navigate('/products')} className="flex-1 md:flex-none px-6 py-3 bg-primary-500 text-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary-500/20 font-bold tracking-widest text-sm uppercase">
                                    Nouveau Projet
                                </button>
                                <button onClick={() => navigate('/shop')} className="flex-1 md:flex-none px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-medium tracking-widest text-sm uppercase">
                                    Explorer
                                </button>
                            </div>
                        </div>

                        {/* Order Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-md p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-black/50 flex items-center gap-6 group hover:-translate-y-1 transition-transform">
                                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Commandes</p>
                                    <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white">{orders.length}</h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-primary-500/10 shadow-sm flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">En Cours</p>
                                    <h3 className="text-3xl font-serif font-bold">{pendingOrders}</h3>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-primary-500/10 shadow-sm flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Gift className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Points Fidélité</p>
                                    <h3 className="text-3xl font-serif font-bold">120</h3>
                                </div>
                            </div>
                        </div>

                        {/* Split Layout: Orders & Asside block */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Main Orders List (Takes 2 cols) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                                        <Package className="w-5 h-5 text-primary-500" />
                                        Acquisitions Récentes
                                    </h2>
                                    <button
                                        onClick={() => navigate('/client/orders')}
                                        className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors flex items-center gap-1"
                                    >
                                        Tout voir <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-black/50 overflow-hidden">
                                    {orders.length > 0 ? (
                                        <div className="divide-y divide-gray-100 dark:divide-white/5">
                                            {orders.slice(0, 5).map((order) => (
                                                <div key={order.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors flex flex-col sm:flex-row items-center gap-6 group cursor-pointer" onClick={() => navigate(`/client/orders?id=${order.id}`)}>

                                                    {/* Image Placeholder */}
                                                    <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200/50 dark:border-white/10">
                                                        <Package className="w-8 h-8 text-primary-300" />
                                                    </div>

                                                    <div className="flex-1 w-full text-center sm:text-left">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                            <h4 className="font-bold text-lg group-hover:text-primary-600 transition-colors">
                                                                Commande #{order.order_number}
                                                            </h4>
                                                            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                                order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-primary-50 text-dark-700 dark:text-primary-200'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-dark-600 dark:text-primary-300 mb-2">
                                                            Enregistrée le {new Date(order.created_at).toLocaleDateString()}
                                                        </p>
                                                        <div className="flex items-center justify-center sm:justify-start gap-4 text-sm font-medium">
                                                            <span className="text-primary-600">{order.total_amount.toLocaleString()} XAF</span>
                                                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                                            <span className="text-dark-600 dark:text-primary-300">{order.items?.length || 1} articles</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0">
                                                        <button className="w-10 h-10 rounded-full bg-white border border-primary-500/50 dark:border-dark-700 flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-black group-hover:border-primary-500 transition-all shadow-sm">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 pl-24 text-center">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                                                <ShoppingBag className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">Aucune commande</h3>
                                            <p className="text-dark-600 dark:text-primary-300 mb-6">Vous n'avez pas encore passé de commande.</p>
                                            <button onClick={() => navigate('/products')} className="btn-premium px-6 py-2.5 bg-primary-500 text-black rounded-lg hover:bg-primary-600 transition-colors uppercase tracking-widest text-sm font-bold">
                                                Explorer les offres
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Info (Takes 1 col) */}
                            <div className="space-y-6">
                                {/* Next Appointment/Measure Card */}
                                <div className="bg-white rounded-2xl border border-primary-500/50 dark:border-dark-700 shadow-sm p-6 relative overflow-hidden">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center pointer-events-none">
                                        <Calendar className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-dark-600 dark:text-primary-300 uppercase tracking-widest mb-4">Mes Rendez-vous</h3>

                                    {appointments.length > 0 ? (
                                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                            {appointments.slice(0, 3).map(apt => (
                                                <div key={apt.id} className="bg-white rounded-xl p-4 border border-primary-500/50 dark:border-dark-700">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-bold text-dark-800 dark:text-white text-sm line-clamp-1">{apt.reason}</p>
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${apt.status === 'VALIDATED' ? 'bg-emerald-100 text-emerald-700' :
                                                            apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {apt.status === 'VALIDATED' ? 'Confirmé' : apt.status === 'CANCELLED' ? 'Annulé' : 'En attente'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-primary-600 font-medium font-serif">
                                                        {new Date(apt.date_requested).toLocaleString('fr-FR', {
                                                            weekday: 'short', day: 'numeric', month: 'short',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-xl p-4 border border-primary-500/50 dark:border-dark-700 mb-4 text-sm text-dark-600 dark:text-primary-300">
                                            Aucun rendez-vous prévu.
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setIsAppointmentModalOpen(true)}
                                        className="w-full py-2.5 bg-primary-500 text-black rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-primary-600 transition-all shadow-md"
                                    >
                                        Prendre Rendez-vous
                                    </button>
                                </div>

                                {/* Announcements */}
                                <div className="bg-white rounded-2xl border border-primary-500/10 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        Informations
                                    </h3>

                                    <div className="space-y-4">
                                        {announcements.length > 0 ? (
                                            announcements.slice(0, 3).map((announcement) => (
                                                <div key={announcement.id} className="border-l-2 border-primary-400 pl-4 py-1 hover:bg-white transition-colors rounded-r-lg">
                                                    <h4 className="font-bold text-sm text-dark-800 dark:text-primary-100 mb-1">{announcement.title}</h4>
                                                    <p className="text-xs text-dark-600 dark:text-primary-300 line-clamp-2">{announcement.content}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-sm text-dark-600 dark:text-primary-300 text-center py-4 bg-white rounded-lg">Rien à signaler pour le moment.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
            {/* Appointment Booking Modal */}
            {isAppointmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-primary-500/20">
                        <div className="p-6 text-center border-b border-primary-500/10 relative">
                            <button
                                onClick={() => setIsAppointmentModalOpen(false)}
                                className="absolute right-4 top-4 text-dark-600 dark:text-primary-200 hover:text-dark-900 dark:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <Calendar className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                            <h2 className="text-2xl font-serif font-black italic text-dark-900 dark:text-white">Rendez-vous Atelier</h2>
                            <p className="text-sm text-dark-600 dark:text-primary-300 mt-1">Discutez de votre prochaine création sur-mesure ou ajustements.</p>
                        </div>

                        <form onSubmit={handleCreateAppointment} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-dark-800 dark:text-white mb-2">
                                    Date et Heure Souhaitée
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-primary-500/50 dark:border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-dark-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold uppercase tracking-widest text-dark-800 dark:text-white mb-2">
                                    Motif de la visite
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={appointmentReason}
                                    onChange={(e) => setAppointmentReason(e.target.value)}
                                    placeholder="Ex: Prise de mesures pour un costume, essayage de la robe..."
                                    className="w-full px-4 py-3 bg-white border border-primary-500/50 dark:border-dark-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-dark-900 dark:text-white resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submittingAppointment}
                                className="w-full py-4 bg-primary-500 text-black font-black uppercase tracking-widest text-sm rounded-lg hover:bg-primary-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submittingAppointment ? 'Envoi en cours...' : 'Envoyer la demande'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDashboard;
