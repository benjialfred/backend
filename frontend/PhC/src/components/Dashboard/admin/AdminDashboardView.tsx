// @ts-nocheck
// src/components/dashboard/admin/AdminDashboardView.tsx
import { useNavigate } from 'react-router-dom';
import {
    Users,
    ShoppingBag,
    DollarSign,
    Briefcase,
    TrendingUp,
    TrendingDown,
    Package,
    UserPlus,
    Activity
} from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import DashboardCharts from '../../Dashboard/DashboardCharts';
import RecentOrders from "../../Dashboard/RecentOrders";
import CreateAnnouncementForm from '@/components/communications/CreateAnnouncementForm';
import AnnouncementList from '@/components/communications/AnnouncementList';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminAppointments from '@/components/Dashboard/admin/AdminAppointments';

const AdminDashboardView = () => {
    const { stats, loading } = useDashboardData();
    const navigate = useNavigate();

    if (loading && !stats.total_revenue) {
        return (
            <AdminLayout className="flex justify-center items-center min-h-screen bg-[#faf9f6] dark:bg-[#050505]">
                <div className="relative">
                    <div className="w-16 h-16 border-2 border-gray-200 dark:border-white/10 border-t-[#D4AF37] rounded-full animate-spin"></div>
                    <div className="absolute inset-0 bg-[#D4AF37]/20 blur-2xl rounded-full"></div>
                </div>
            </AdminLayout>
        );
    }

    const statCards = [
        {
            title: 'Utilisateurs',
            value: stats.total_users || 0,
            icon: <Users className="w-6 h-6 text-[#D4AF37]" />,
            color: 'from-[#D4AF37]/20 to-transparent dark:from-[#D4AF37]/10 dark:to-transparent',
            iconBg: 'bg-[#D4AF37]/10 border-[#D4AF37]/20',
            change: 'Global',
            isIncrease: true,
        },
        {
            title: 'Clients',
            value: stats.total_clients || 0,
            icon: <UserPlus className="w-6 h-6 text-gray-900 dark:text-white" />,
            color: 'from-gray-200 to-transparent dark:from-white/10 dark:to-transparent',
            iconBg: 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10',
            change: 'Inscrits',
            isIncrease: true,
        },
        {
            title: 'Commandes Enregistrées',
            value: stats.total_orders || 0,
            icon: <ShoppingBag className="w-6 h-6 text-gray-900 dark:text-white" />,
            color: 'from-gray-200 to-transparent dark:from-white/10 dark:to-transparent',
            iconBg: 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10',
            change: 'Total',
            isIncrease: true,
        },
        {
            title: 'Produit Plus Populaire',
            value: stats.popular_products?.[0]?.nom || '-',
            icon: <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />,
            color: 'from-gray-200 to-transparent dark:from-white/10 dark:to-transparent',
            iconBg: 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10',
            change: 'Favori',
            isIncrease: true,
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-10 relative z-10 w-full max-w-[1800px] mx-auto pb-12">
                {/* Hero Header Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end opacity-0 animate-fade-in-up">
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-black font-serif text-gray-900 dark:text-white tracking-tight">
                            Bonjour, Admin
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide">
                            Voici la performance de Prophétie Couture aujourd'hui.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 px-4 py-2 bg-white dark:bg-dark-900 rounded-full border border-gray-200 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(255,255,255,0.02)] flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">Système Opérationnel</span>
                    </div>
                </div>

                {/* Premium Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((card, idx) => (
                        <div 
                            key={idx} 
                            className={`relative group overflow-hidden bg-white dark:bg-[#0A0A0A] p-8 rounded-2xl border border-gray-200 dark:border-white/5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.03)] hover:-translate-y-1 opacity-0 animate-fade-in-up`}
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            {/* Inner Subtle Gradient Glow */}
                            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${card.color} rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 opacity-60`} />

                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <div className={`p-3 rounded-2xl border ${card.iconBg} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                                    {card.icon}
                                </div>
                                <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md border ${card.isIncrease ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'}`}>
                                    {card.isIncrease ? <TrendingUp className="w-4 h-4 mr-1.5" /> : <TrendingDown className="w-4 h-4 mr-1.5" />}
                                    {card.change}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wide mb-2">{card.title}</h3>
                                <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Split (Charts & Actions) */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Visualisation Data Section */}
                    <div className="xl:col-span-2 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-white/5 p-8 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
                        {/* Background Luxury Glow */}
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-2">
                                Performance Commerciale
                            </h3>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-8">Vue analytique des commandes</p>
                            
                            <DashboardCharts />
                        </div>
                    </div>

                    {/* Operational Sidebar */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6 relative z-10">Accès Rapide</h3>
                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <button onClick={() => navigate('/dashboard/products')} className="relative overflow-hidden p-6 bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 transition-all text-center group active:scale-95">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Package className="w-8 h-8 text-gray-400 group-hover:text-[#D4AF37] mx-auto mb-3 transition-colors duration-300" />
                                    <span className="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 font-bold">Produits</span>
                                </button>
                                <button onClick={() => navigate('/dashboard/users')} className="relative overflow-hidden p-6 bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 transition-all text-center group active:scale-95">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <UserPlus className="w-8 h-8 text-gray-400 group-hover:text-[#D4AF37] mx-auto mb-3 transition-colors duration-300" />
                                    <span className="text-xs uppercase tracking-widest text-gray-700 dark:text-gray-300 font-bold">Clients</span>
                                </button>
                            </div>
                        </div>

                        {/* Internal Announcements */}
                        <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative flex flex-col min-h-[300px]">
                            <div className="flex justify-between items-center mb-6 relative z-20">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Annonces</h3>
                                <CreateAnnouncementForm onSuccess={() => { }} />
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-20">
                                <AnnouncementList />
                            </div>
                            {/* Seamless fade out at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-[#0A0A0A] to-transparent pointer-events-none z-20 rounded-b-2xl"></div>
                        </div>
                    </div>
                </div>

                {/* Additional Section: Recent Orders & Appointments */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <RecentOrders />
                    </div>
                    <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-6">Atelier & Rendez-vous</h3>
                        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <AdminAppointments />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardView;
