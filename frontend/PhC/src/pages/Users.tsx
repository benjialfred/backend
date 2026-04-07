// src/pages/Users.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import Modal from '@/components/ui/Modal';
import AddUserForm from '@/components/forms/AddUserForm';
import type { User } from '@/types';
import { userAPI } from '@/services/api';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data: any = await userAPI.getUsers();
      // Safely handle paginated or array response
      const usersList = Array.isArray(data) ? data : (data.results || []);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userAPI.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await userAPI.updateUser(user.id, { is_active: !user.is_active });
      setUsers(users.map(u =>
        u.id === user.id ? { ...u, is_active: !u.is_active } : u
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-500/50',
    WORKER: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    APPRENTI: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    CLIENT: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/10 dark:text-gray-400 dark:border-gray-500/20',
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white tracking-wide">
              Utilisateurs
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium">Gérez les comptes utilisateurs et permissions ({users.length} utilisateurs)</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-primary-600 transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder-gray-400 font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
            >
              <option value="all">Tous les rôles</option>
              <option value="ADMIN">Administrateurs</option>
              <option value="WORKER">Travailleurs</option>
              <option value="APPRENTI">Apprentis</option>
              <option value="CLIENT">Clients</option>
            </select>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors font-medium">
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white dark:bg-[#111] rounded-[2rem] shadow-sm overflow-hidden border border-gray-200 dark:border-white/10">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-white/10 border-b-primary-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      Utilisateur
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      Rôle
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
                      Inscription
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={user.photo_profil || `https://ui-avatars.com/api/?name=${user.prenom}+${user.nom}&background=a3e635&color=000`}
                            alt={`${user.prenom} ${user.nom}`}
                            className="w-10 h-10 rounded-full object-cover mr-4 border border-gray-200 dark:border-white/10"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {user.prenom} {user.nom}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.email}</span>
                          </div>
                          {user.telephone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{user.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${roleColors[user.role] || 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors border ${user.is_active
                            ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 dark:hover:bg-green-500/20'
                            : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20'
                            }`}
                        >
                          {user.is_active ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Actif
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              Inactif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:text-green-400 dark:hover:bg-green-500/10 rounded-xl transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Affichage de <span className="text-gray-900 dark:text-white font-bold">1</span> à <span className="text-gray-900 dark:text-white font-bold">{Math.min(10, filteredUsers.length)}</span> sur <span className="text-gray-900 dark:text-white font-bold">{filteredUsers.length}</span> utilisateurs
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium text-sm">
                Précédent
              </button>
              <button className="px-4 py-2 bg-primary-500 text-black font-bold rounded-xl hover:bg-primary-600 transition-colors shadow-sm text-sm">
                1
              </button>
              <button className="px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium text-sm">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Ajouter/Modifier Utilisateur */}
      <Modal
        isOpen={showAddModal || !!selectedUser}
        onClose={() => {
          setShowAddModal(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
        size="lg"
      >
        <AddUserForm
          user={selectedUser}
          onSuccess={() => {
            setShowAddModal(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      </Modal>
    </AdminLayout>
  );
};

export default Users;