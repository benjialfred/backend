import { useState, useEffect } from 'react';
import { journalAPI, userAPI } from '@/services/api';
import { Calendar, User, Search, BookOpen, Users, Mail, Phone } from 'lucide-react';
import type { DailyJournal, User as UserType } from '@/types';

const ReportsView = () => {
    const [activeTab, setActiveTab] = useState<'journals' | 'members'>('journals');
    const [journals, setJournals] = useState<DailyJournal[]>([]);
    const [members, setMembers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'journals') {
                const data: any = await journalAPI.getAll();
                const results = Array.isArray(data) ? data : (data.results || []);
                setJournals(results);
            } else {
                const data: any = await userAPI.getUsers();
                const results = Array.isArray(data) ? data : (data.results || []);
                // Filter for internal members mostly (Workers, Apprentices, Admins)
                setMembers(results);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJournals = journals.filter(j =>
        (j.apprentice_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
        j.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMembers = members.filter(m =>
        m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats for members
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.is_active).length;
    const apprenticesCount = members.filter(m => m.role === 'APPRENTI').length;

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="bg-[#1e293b]/60 p-4 rounded-2xl border border-primary-500/10 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-primary-500" />
                            Centre de Rapports
                        </h2>
                        <p className="text-sm text-gray-400">Gérez les rapports journaliers et les membres</p>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-primary-500/10">
                        <button
                            onClick={() => setActiveTab('journals')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'journals' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-white'
                                } `}
                        >
                            <BookOpen className="w-4 h-4" /> Rapports
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'members' ? 'bg-primary-500 text-black shadow-lg shadow-primary-500/20' : 'text-gray-400 hover:text-white'
                                } `}
                        >
                            <Users className="w-4 h-4" /> Membres
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-600 dark:text-primary-300" />
                    <input
                        type="text"
                        placeholder={activeTab === 'journals' ? "Rechercher un rapport..." : "Rechercher un membre..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-[#0f172a] border border-primary-500/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-dark-600 dark:text-primary-300">Chargement des données...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'journals' && (
                        <div className="grid gap-4">
                            {filteredJournals.length === 0 ? (
                                <div className="text-center py-12 text-dark-600 dark:text-primary-300 bg-[#1e293b]/30 rounded-2xl border border-dashed border-white/10">
                                    Aucun rapport trouvé.
                                </div>
                            ) : (
                                filteredJournals.map((journal) => (
                                    <div key={journal.id} className="bg-[#1e293b]/60 backdrop-blur-md p-6 rounded-2xl border border-primary-500/10 hover:border-primary-500/30 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold border border-primary-500/20 group-hover:scale-110 transition-transform">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-white">{journal.apprentice_name || 'Apprenti Inconnu'}</h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Calendar className="w-3 h-3 text-primary-500" />
                                                        {new Date(journal.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 text-xs rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                                                Journalier
                                            </span>
                                        </div>

                                        <div className="bg-[#0f172a]/50 p-4 rounded-xl border border-primary-500/10 mb-4">
                                            <p className="text-gray-300 whitespace-pre-wrap">{journal.content}</p>
                                        </div>

                                        {journal.supervisor_feedback && (
                                            <div className="pl-4 border-l-2 border-green-500/50">
                                                <p className="text-xs text-green-400 font-bold mb-1">Feedback Superviseur</p>
                                                <p className="text-sm text-gray-400">{journal.supervisor_feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'members' && (
                        <div className="space-y-6">
                            {/* Member Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#1e293b]/40 p-4 rounded-xl border border-primary-500/10">
                                    <h3 className="text-sm text-gray-400 mb-1">Total Membres</h3>
                                    <p className="text-2xl font-bold text-white">{totalMembers}</p>
                                </div>
                                <div className="bg-[#1e293b]/40 p-4 rounded-xl border border-primary-500/10">
                                    <h3 className="text-sm text-gray-400 mb-1">Membres Actifs</h3>
                                    <p className="text-2xl font-bold text-green-400">{activeMembers}</p>
                                </div>
                                <div className="bg-[#1e293b]/40 p-4 rounded-xl border border-primary-500/10">
                                    <h3 className="text-sm text-gray-400 mb-1">Apprentis</h3>
                                    <p className="text-2xl font-bold text-primary-400">{apprenticesCount}</p>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl border border-primary-500/10 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-primary-500/5">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Utilisateur</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rôle</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredMembers.map((member) => (
                                            <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {member.photo_profil ? (
                                                            <img src={member.photo_profil} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                                                {member.prenom?.[0]}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-sm font-bold text-white max-w-[150px] truncate">{member.prenom} {member.nom}</p>
                                                            <p className="text-xs text-dark-600 dark:text-primary-300">ID: {member.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded-full border ${member.role === 'ADMIN' ? 'bg-primary-900/40 text-primary-400 border-primary-500/30' :
                                                        member.role === 'APPRENTI' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                                        } `}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs text-gray-300">
                                                            <Mail className="w-3 h-3" /> {member.email}
                                                        </div>
                                                        {member.telephone && (
                                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                <Phone className="w-3 h-3" /> {member.telephone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 ${member.is_active ? 'text-green-400' : 'text-red-400'} `}>
                                                        <div className={`w-2 h-2 rounded-full ${member.is_active ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'} `}></div>
                                                        <span className="text-xs font-bold">{member.is_active ? 'Actif' : 'Inactif'}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default ReportsView;
