import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { userAPI } from '@/services/api';
import { Users, GraduationCap, Briefcase, CheckCircle, XCircle, Search, Edit2, Loader } from 'lucide-react';
import type { User, Apprentice, Worker } from '@/types';
import { toast } from 'react-hot-toast';

// Combined type for display
interface ExtendedApprentice extends Apprentice {
    user_details?: User;
}

interface ExtendedWorker extends Worker {
    user_details?: User;
}

const WorkerManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

    const [activeTab, setActiveTab] = useState<'all' | 'apprentices' | 'workers'>('all');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [apprentices, setApprentices] = useState<ExtendedApprentice[]>([]);
    const [workers, setWorkers] = useState<ExtendedWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'apprentices') {
                const response: any = await userAPI.getApprentices();
                // Handle Axios response vs direct data
                const payload = response.data || response;
                const data = Array.isArray(payload) ? payload : (payload.results || []);
                setApprentices(data);
            } else if (activeTab === 'workers') {
                const response: any = await userAPI.getWorkers();
                const payload = response.data || response;
                const data = Array.isArray(payload) ? payload : (payload.results || []);
                setWorkers(data);
            } else {
                // Fetch All Users
                const response: any = await userAPI.getUsers();
                const payload = response.data || response;
                const data = Array.isArray(payload) ? payload : (payload.results || []);
                setAllUsers(data);
            }
        } catch (error) {
            console.error("Error fetching team data", error);
            toast.error("Erreur lors du chargement des données");
            setApprentices([]);
            setWorkers([]);
            setAllUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingId(item.id);
        setEditForm({ ...item });
    };

    const handleSaveApprentice = async () => {
        try {
            await userAPI.updateApprentice(editingId!, {
                grade: editForm.grade,
                completed_training: editForm.completed_training
            });
            toast.success("Apprenti mis à jour avec succès");
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const toggleTraining = async (apprentice: ExtendedApprentice) => {
        try {
            await userAPI.updateApprentice(apprentice.id, {
                completed_training: !apprentice.completed_training
            });
            toast.success(`Formation ${!apprentice.completed_training ? 'validée' : 'annulée'}`);
            fetchData();
        } catch (error) {
            toast.error("Erreur de mise à jour");
        }
    };

    const filteredApprentices = apprentices.filter(a =>
        a.user_details?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user_details?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredWorkers = workers.filter(w =>
        w.user_details?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.user_details?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAllUsers = allUsers.filter(u =>
        u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Users className="w-8 h-8 text-primary-500" />
                            Gestion d'Équipe
                        </h2>
                        <p className="text-gray-400">Gérez les niveaux des apprentis et les rôles des employés</p>
                    </div>

                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'all' ? 'bg-primary-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Users className="w-4 h-4" /> Tous
                        </button>
                        <button
                            onClick={() => setActiveTab('apprentices')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'apprentices' ? 'bg-primary-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <GraduationCap className="w-4 h-4" /> Apprentis
                        </button>
                        <button
                            onClick={() => setActiveTab('workers')}
                            className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'workers' ? 'bg-primary-500 text-black font-bold shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Briefcase className="w-4 h-4" /> Employés
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-600 dark:text-primary-300" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center">
                    <Loader className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                    <p className="text-dark-600 dark:text-primary-300">Chargement des données...</p>
                </div>
            ) : (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
                    {activeTab === 'all' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Utilisateur</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Rôle</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredAllUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                                        {user.prenom?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{user.prenom} {user.nom}</p>
                                                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full border ${user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                    user.role === 'APPRENTI' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        user.role === 'WORKER' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                                                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                                    <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                    <span className="text-xs">{user.is_active ? 'Actif' : 'Inactif'}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAllUsers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-dark-600 dark:text-primary-300">Aucun utilisateur trouvé.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'apprentices' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Apprenti</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Niveau (Grade)</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Formation</th>
                                        {isAdmin && <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredApprentices.map((apprentice) => (
                                        <tr key={apprentice.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                                        {apprentice.user_details?.prenom?.[0] || 'A'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{apprentice.user_details?.prenom} {apprentice.user_details?.nom}</p>
                                                        <p className="text-xs text-gray-400">{apprentice.user_details?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingId === apprentice.id ? (
                                                    <select
                                                        value={editForm.grade}
                                                        onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                                    >
                                                        <option value="DEBUTANT">Débutant</option>
                                                        <option value="INTERMEDIAIRE">Intermédiaire</option>
                                                        <option value="AVANCE">Avancé</option>
                                                        <option value="MAITRE">Maître</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-2 py-1 text-xs rounded-full border ${apprentice.grade === 'MAITRE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                        apprentice.grade === 'AVANCE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                            apprentice.grade === 'INTERMEDIAIRE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                'bg-white0/10 text-gray-400 border-gray-500/20'
                                                        }`}>
                                                        {apprentice.grade}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => isAdmin && toggleTraining(apprentice)}
                                                        disabled={!isAdmin}
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${apprentice.completed_training
                                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                                            } ${!isAdmin && 'opacity-50 cursor-not-allowed'}`}
                                                    >
                                                        {apprentice.completed_training ? (
                                                            <><CheckCircle className="w-3 h-3" /> Terminée</>
                                                        ) : (
                                                            <><XCircle className="w-3 h-3" /> En cours</>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4">
                                                    {editingId === apprentice.id ? (
                                                        <div className="flex gap-2">
                                                            <button onClick={handleSaveApprentice} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded shadow-lg">Enregistrer</button>
                                                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded">Annuler</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => handleEdit(apprentice)} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {filteredApprentices.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-dark-600 dark:text-primary-300">Aucun apprenti trouvé.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'workers' && (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Employé</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Fonction</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Groupe</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredWorkers.map((worker) => (
                                        <tr key={worker.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary-900/40 flex items-center justify-center text-primary-500 font-bold border border-primary-500/20">
                                                        {worker.user_details?.prenom?.[0] || 'W'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{worker.user_details?.prenom} {worker.user_details?.nom}</p>
                                                        <p className="text-xs text-gray-400">{worker.user_details?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/5">
                                                    {worker.fonction}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-400">
                                                    {worker.groupe}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="text-xs text-dark-600 dark:text-primary-300 hover:text-white underline cursor-pointer">
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredWorkers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-dark-600 dark:text-primary-300">Aucun employé trouvé.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkerManagement;
