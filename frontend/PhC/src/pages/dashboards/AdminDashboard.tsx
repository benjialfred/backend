// @ts-nocheck
import { useState, useEffect } from 'react';
import {
    Users,
    ShoppingBag,
    DollarSign,
    GraduationCap,
    MoreVertical,
    Save,
    Wrench,
    Book,
    AlertCircle,
    ChevronDown,
    ArrowUpRight
} from 'lucide-react';
import { dashboardAPI, announcementAPI } from '@/services/api';
import apiClient from '@/services/api';
import type { Material, DailyJournal } from '@/types';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const dummyChartData = [
  { name: '1D', value: 30000, secondary: 15000 },
  { name: '2D', value: 45000, secondary: 20000 },
  { name: '3D', value: 25000, secondary: 10000 },
  { name: '4D', value: 60000, secondary: 30000 },
  { name: '5D', value: 35000, secondary: 40000, isCurrent: true },
  { name: '6D', value: 40000, secondary: 15000 },
  { name: '7D', value: 50000, secondary: 25000 },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'apprentices'>('overview');

    // Stats State
    const [stats, setStats] = useState({
        total_users: 0,
        total_orders: 0,
        total_revenue: 0,
        active_apprentices: 0
    });

    // Apprentices State
    const [apprentices, setApprentices] = useState<any[]>([]);
    const [selectedApprentice, setSelectedApprentice] = useState<string | null>(null);
    const [apprenticeDetails, setApprenticeDetails] = useState<{
        materials: Material[];
        journals: DailyJournal[];
    }>({ materials: [], journals: [] });
    const [editingGrade, setEditingGrade] = useState<string>('');

    // Announcements State
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
        fetchApprentices(); // Fetch apprentices immediately for the list
    }, []);

    useEffect(() => {
        if (selectedApprentice) {
            fetchApprenticeDetails(selectedApprentice);
        }
    }, [selectedApprentice]);

    const fetchDashboardData = async () => {
        try {
            const [statsData, annData] = await Promise.all([
                dashboardAPI.getStats(),
                announcementAPI.getAll()
            ]);
            setStats(statsData);
            setAnnouncements(annData.results || []);
        } catch (error) {
            console.error("Error fetching dashboard data", error);
        }
    };

    const fetchApprentices = async () => {
        try {
            const response = await apiClient.get('/users/apprentices/');
            setApprentices(response.data.results || []);
        } catch (error) {
            console.error("Error fetching apprentices", error);
        }
    };

    const fetchApprenticeDetails = async (apprenticeId: string) => {
        try {
            const apprentice = apprentices.find(a => a.id === apprenticeId);
            if (!apprentice) return;

            const [matResponse, journalResponse] = await Promise.all([
                apiClient.get('/users/materials/', { params: { owner_id: apprentice.user.id } }),
                apiClient.get('/communications/daily-journals/', { params: { apprentice_id: apprentice.user.id } })
            ]);

            const allMaterials = matResponse.data.results || matResponse.data || [];
            const userMaterials = allMaterials.filter((m: any) => m.owner === apprentice.user.id);
            const allJournals = journalResponse.data.results || journalResponse.data || [];

            setApprenticeDetails({
                materials: userMaterials,
                journals: allJournals
            });
            setEditingGrade(apprentice.grade);
        } catch (error) {
            console.error("Error fetching apprentice details", error);
        }
    };

    const handleUpdateGrade = async (apprenticeId: string) => {
        try {
            await apiClient.patch(`/users/apprentices/${apprenticeId}/`, { grade: editingGrade });
            toast.success("Niveau mis à jour");
            fetchApprentices(); 
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    // Derived stats for UI
    const statCards = [
        { label: 'Utilisateurs', value: stats.total_users, color: 'text-gray-900', bg: 'bg-[#FDFDFA]' },
        { label: 'Clients', value: stats.total_clients || 0, color: 'text-gray-900', bg: 'bg-[#FDFDFA]' },
        { label: 'Commandes', value: stats.total_orders, color: 'text-gray-900', bg: 'bg-[#FDFDFA]' },
        { label: 'Top Produit', value: stats.popular_products?.[0]?.nom || '-', color: 'text-[#8CE158]', bg: 'bg-[#FDFDFA]' },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 min-h-screen">
            {/* Left Main Content */}
            <div className="flex-1 space-y-8 max-w-full overflow-hidden">
                {/* Header Welcome */}
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                            👋 {getGreeting()}, {user?.prenom || 'Admin'}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm ml-[40px]">Here's what's happening with your platform today.</p>
                    </div>
                </div>

                {/* Dashboard Tabs / Modes */}
                <div className="flex items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-2">
                   <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-2 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'overview' ? 'border-[#8CE158] text-gray-900 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Vue d'ensemble
                    </button>
                    <button
                        onClick={() => setActiveTab('apprentices')}
                        className={`pb-2 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'apprentices' ? 'border-[#8CE158] text-gray-900 dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        Gestion Apprentis
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Table Section: Recent Users/Apprentices ("Lead Preview") */}
                        <div className="bg-[#EBF7F0] dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-[#D5F0DE] dark:border-white/5 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recent Users & Apprentices</h3>
                                <button className="text-xs font-bold text-gray-500 bg-white dark:bg-dark-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                                    View All <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="text-xs text-gray-500 border-b border-white/40 dark:border-white/10 uppercase tracking-widest font-bold">
                                            <th className="pb-4 font-bold w-1/4">Profile</th>
                                            <th className="pb-4 font-bold w-1/4">Contact</th>
                                            <th className="pb-4 font-bold text-center w-1/6">Role</th>
                                            <th className="pb-4 font-bold w-1/3">Status/Grade</th>
                                            <th className="pb-4 font-bold text-center">Option</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/40 dark:divide-white/10">
                                        {apprentices.slice(0, 4).map((app, idx) => (
                                            <tr key={app.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                                                <td className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${app.user.id})`, backgroundColor: '#e2e8f0' }}></div>
                                                        <div>
                                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{app.user.prenom} {app.user.nom}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                Just now
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="text-xs space-y-1">
                                                        <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">✉ {app.user.prenom.toLowerCase()}@example.com</p>
                                                        <p className="text-gray-500 dark:text-gray-400">📞 +228 90 00 00 00</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="text-xs font-bold text-gray-600 bg-white dark:bg-dark-800 px-3 py-1 rounded-lg">APPRENTI</span>
                                                </td>
                                                <td className="py-4">
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate max-w-[200px]">
                                                        Currently level: {app.grade}
                                                    </p>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <button className="text-gray-400 hover:text-gray-800 dark:hover:text-white p-2 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Chart Section ("Top conversation" equivalent) */}
                        <div className="bg-[#EBF7F0] dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-[#D5F0DE] dark:border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Revenue Overview</h3>
                                <div className="flex gap-2">
                                    <button className="text-xs font-bold text-gray-500 bg-white/50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 flex items-center gap-1">
                                        Filter <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button className="text-xs font-bold text-gray-500 bg-white/50 dark:bg-dark-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 flex items-center gap-1">
                                        Last 10 days <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dummyChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dx={-10} tickFormatter={(val) => `${val/1000}k`} />
                                        <Tooltip 
                                            cursor={{fill: 'transparent'}}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', padding: '10px 15px' }}
                                        />
                                        <Bar dataKey="secondary" stackId="a" fill="#EBF7F0" radius={[0, 0, 10, 10]} barSize={35}>
                                            {dummyChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#FCD34D' : '#D1F0DA'} />
                                            ))}
                                        </Bar>
                                        <Bar dataKey="value" stackId="a" fill="#A5E77A" radius={[10, 10, 0, 0]} barSize={35}>
                                            {dummyChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#8CE158' : '#A5E77A'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'apprentices' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        {/* List */}
                        <div className="bg-[#EBF7F0] dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-[#D5F0DE] dark:border-white/5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Liste des Apprentis</h2>
                            <div className="space-y-3">
                                {apprentices.map((app) => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApprentice(app.id)}
                                        className={`p-4 rounded-2xl cursor-pointer transition-all border group ${selectedApprentice === app.id
                                            ? 'bg-white dark:bg-dark-800 border-[#8CE158] shadow-[0_4px_15px_rgba(140,225,88,0.2)]'
                                            : 'bg-white/50 dark:bg-dark-800/50 border-transparent hover:bg-white dark:hover:bg-dark-800'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="w-12 h-12 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(https://i.pravatar.cc/150?u=${app.user.id})`, backgroundColor: '#e2e8f0' }}></div>
                                              <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{app.user.prenom} {app.user.nom}</p>
                                                <p className="text-xs text-[#8CE158] font-bold tracking-wider">{app.grade}</p>
                                              </div>
                                            </div>
                                            <ChevronDown className="w-5 h-5 text-gray-300 group-hover:text-[#8CE158] -rotate-90" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details View */}
                        <div className="space-y-6">
                            {selectedApprentice ? (
                                <>
                                    {/* Grade Management */}
                                    <div className="bg-[#EBF7F0] dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-[#D5F0DE] dark:border-white/5">
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Niveau d'Évolution</h3>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={editingGrade}
                                                onChange={(e) => setEditingGrade(e.target.value)}
                                                className="p-3 border-none bg-white dark:bg-dark-800 rounded-xl flex-1 font-bold text-gray-700 shadow-sm outline-none ring-2 ring-transparent focus:ring-[#8CE158]"
                                            >
                                                <option value="DEBUTANT">Débutant</option>
                                                <option value="INTERMEDIAIRE">Intermédiaire</option>
                                                <option value="AVANCE">Avancé</option>
                                                <option value="MAITRE">Maître</option>
                                            </select>
                                            <button
                                                onClick={() => handleUpdateGrade(selectedApprentice)}
                                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8CE158] to-[#6BC835] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold hover:scale-105 active:scale-95"
                                            >
                                                <Save className="w-4 h-4" /> Save
                                            </button>
                                        </div>
                                    </div>

                                    {/* Materials */}
                                    <div className="bg-white dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-purple-400" /> Matériel Déclaré
                                        </h3>
                                        {apprenticeDetails.materials.length === 0 ? (
                                            <p className="text-gray-400 text-sm italic">Aucun matériel déclaré.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {apprenticeDetails.materials.map((mat) => (
                                                    <div key={mat.id} className="p-3 bg-gray-50 dark:bg-dark-800 rounded-xl flex justify-between items-center border border-gray-100 dark:border-white/5">
                                                        <div>
                                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{mat.name}</p>
                                                            <p className="text-xs text-gray-500">Qté: {mat.quantity}</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white dark:bg-dark-900 rounded-lg text-gray-500 shadow-sm">{mat.status}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Journals */}
                                    <div className="bg-white dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Book className="w-4 h-4 text-blue-400" /> Journal de Bord
                                        </h3>
                                        {apprenticeDetails.journals.length === 0 ? (
                                            <p className="text-gray-400 text-sm italic">Aucune entrée de journal.</p>
                                        ) : (
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                {apprenticeDetails.journals.map((journal) => (
                                                    <div key={journal.id} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-2xl border-l-4 border-blue-400 relative">
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{new Date(journal.date).toLocaleDateString()}</p>
                                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{journal.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200 p-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="font-medium text-gray-500">Sélectionnez un apprenti pour voir les détails</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar (Stats / PRO members / Updates) */}
            <div className="w-full xl:w-80 flex-shrink-0 space-y-6">
                
                {/* Department Dropdown Equivalent */}
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="font-bold text-sm text-gray-800 px-3">All Roles</span>
                    <div className="bg-gray-100 p-2 rounded-xl">
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                </div>

                {/* PRO Members / Stats */}
                <div className="bg-white dark:bg-dark-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><Users className="w-4 h-4 text-blue-600"/></span> 
                            Key Metrics
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {statCards.map((stat, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                                <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 bg-[#A5E77A] text-black font-bold text-sm py-3 rounded-xl hover:bg-[#8CE158] transition-colors shadow-sm">
                        See all details
                    </button>
                </div>

                {/* Notifications/Announcements ("New clients/Phase") */}
                <div className="bg-[#EBF7F0] dark:bg-dark-900/40 rounded-3xl p-6 shadow-sm border border-[#D5F0DE] dark:border-white/5">
                    <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider mb-5">Platform Updates</h3>
                    
                    <div className="space-y-4">
                        {announcements.slice(0, 3).map((ann, idx) => (
                            <div key={ann.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl flex gap-3 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900 truncate">{ann.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{ann.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors py-2">
                        View All <ArrowUpRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
