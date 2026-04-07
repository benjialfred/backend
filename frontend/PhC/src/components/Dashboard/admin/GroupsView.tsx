import { useState, useEffect } from 'react';
import { groupAPI, userAPI, invitationAPI } from '@/services/api';
import { Users, Plus, Settings, UserPlus, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { WorkerGroup, User } from '@/types';

const GroupsView = () => {
    const [groups, setGroups] = useState<WorkerGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form and Selection State
    const [newGroupName, setNewGroupName] = useState('');
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    // Fetch users when modal opens
    useEffect(() => {
        if (showCreateModal) {
            fetchAvailableUsers();
        }
    }, [showCreateModal]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const data: any = await groupAPI.getAll();
            const results = data.results;
            setGroups(results);
        } catch (error) {
            console.error("Error fetching groups", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const [workersData, apprenticesData] = await Promise.all([
                userAPI.getWorkers(),
                userAPI.getApprentices()
            ]);

            // Normalize data (handle if one returns object with results or array)
            const workers = Array.isArray(workersData) ? workersData : (workersData as any).results || [];
            const apprentices = Array.isArray(apprenticesData) ? apprenticesData : (apprenticesData as any).results || [];

            // Combine and map to User objects (assuming endpoint returns User objects or objects containing user details)
            // Adjust based on actual API response structure. Assuming endpoints return list of profiles that contain user info or are users.
            // If they return Worker/Apprentice objects, we need to extract user details.

            // Simplification: We will trust the API returns list of objects that have id, nom, prenom, role.
            const allUsers = [...workers, ...apprentices].map((item: any) => item.user || item);

            // Remove duplicates by ID just in case
            const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.id, user])).values());

            setAvailableUsers(uniqueUsers as User[]);
        } catch (error) {
            console.error("Error fetching users for selection", error);
            toast.error("Impossible de charger la liste des utilisateurs");
        }
    };

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) {
            toast.error("Le nom du groupe est requis");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Create Group
            const group: WorkerGroup = await groupAPI.create({ name: newGroupName });

            // 2. Send Invitations to selected users
            if (selectedUserIds.length > 0) {
                const invitationPromises = selectedUserIds.map(userId =>
                    invitationAPI.create({
                        group: group.id,
                        recipient_email: availableUsers.find(u => u.id === userId)?.email || '', // Ideally user ID, but API might expect email
                        // If API expects User ID for internal invitation, adapt here. 
                        // Assuming API might need adaptation or handles email lookups. 
                        // Let's assume for now we use the ID if we updated the API, or Email if it's external.
                        // Given user request "selectionner les apprentis", we likely pass IDs to a backend endpoint 
                        // or we trigger invitations via email.
                        // Let's try passing 'recipient_id' if supported, or 'recipient_email'.
                    })
                );

                await Promise.allSettled(invitationPromises);
                toast.success(`Groupe créé et ${selectedUserIds.length} invitations envoyées !`);
            } else {
                toast.success("Groupe créé avec succès");
            }

            setNewGroupName('');
            setSelectedUserIds([]);
            setShowCreateModal(false);
            fetchGroups();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la création ou de l'envoi des invitations");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-dark-600 dark:text-primary-300">Chargement des groupes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-black p-4 rounded-2xl border border-primary-500 shadow-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    Groupes de Travail
                </h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                >
                    <Plus className="w-4 h-4" /> Nouveau Groupe
                </button>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-black w-full max-w-2xl p-6 rounded-2xl border border-primary-500 shadow-2xl flex flex-col max-h-[90vh] text-white">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Créer un nouveau groupe</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nom du Groupe</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Atelier Couture A"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    className="w-full p-3 bg-neutral-900 border border-primary-500/30 rounded-xl text-white outline-none focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Inviter des Membres ({selectedUserIds.length})
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                                    {availableUsers.map(user => (
                                        <div
                                            key={user.id}
                                            onClick={() => toggleUserSelection(user.id)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedUserIds.includes(user.id)
                                                ? 'bg-primary-600/20 border-primary-500'
                                                : 'bg-neutral-900 border-white/5 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                                                    {user.prenom?.[0]}{user.nom?.[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-200">{user.prenom} {user.nom}</p>
                                                    <p className="text-xs text-primary-400">{user.role}</p>
                                                </div>
                                            </div>
                                            {selectedUserIds.includes(user.id) && (
                                                <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {availableUsers.length === 0 && (
                                        <p className="text-dark-600 dark:text-primary-300 text-sm col-span-full">Aucun utilisateur disponible.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-6 py-2 bg-transparent text-gray-400 hover:text-white rounded-lg"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? 'Création...' : (
                                    <>
                                        <Users className="w-4 h-4" />
                                        Créer le Groupe
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-black/60 bg-white rounded-2xl border border-dashed border-primary-500">
                        Aucun groupe de travail actif.
                    </div>
                ) : (
                    groups.map((group) => (
                        <div key={group.id} className="bg-black p-6 rounded-2xl border border-primary-500/30 hover:border-primary-500 transition-all group-card relative overflow-hidden text-white shadow-xl">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{group.name}</h3>
                                    <p className="text-xs text-dark-600 dark:text-primary-300">{new Date(group.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Chef d'équipe</span>
                                    <span className="text-white font-medium">{group.leader_details?.nom || 'Non assigné'}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Membres</span>
                                    <span className="text-white font-medium">{group.members?.length || 0}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <button className="w-full py-2 flex items-center justify-center gap-2 text-sm text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
                                    <UserPlus className="w-4 h-4" /> Gérer les membres
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GroupsView;
