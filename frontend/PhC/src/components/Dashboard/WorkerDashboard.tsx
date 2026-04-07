import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AnnouncementList from '@/components/communications/AnnouncementList';
import { groupAPI, projectAPI, invitationAPI, journalAPI, taskAPI } from '@/services/api';
import type { WorkerGroup, WorkerProject, WorkerTask } from '@/types';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import {
    Users,
    Bell,
    Settings,
    UserPlus,
    Briefcase,
    Plus,
    FolderPlus,
    Calendar,
    Book,
    ListTodo
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import SewingMachinePattern from '@/components/ui/SewingMachinePattern';
import TaskBoard from './TaskBoard';

const WorkerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'projects' | 'tasks' | 'groups' | 'settings' | 'journals'>('overview');
    const location = useLocation();

    // Data State
    const [groups, setGroups] = useState<WorkerGroup[]>([]);
    const [projects, setProjects] = useState<WorkerProject[]>([]);
    const [tasks, setTasks] = useState<WorkerTask[]>([]);
    const [journals, setJournals] = useState<any[]>([]);

    // UI/Form State
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', status: 'PLANNED' });

    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [editingTask, setEditingTask] = useState<WorkerTask | null>(null);
    const [newTask, setNewTask] = useState({ title: '', description: '', project: '', status: 'TODO', assigned_to: '' });

    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');

    // Check hash on mount/update
    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (['team', 'projects', 'tasks', 'groups', 'settings', 'journals'].includes(hash)) {
            setActiveTab(hash as any);
        } else if (hash === 'overview' || hash === '') {
            setActiveTab('overview');
        }
    }, [location.hash]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [groupsRes, projectsRes, tasksRes, journalRes] = await Promise.all([
                groupAPI.getAll(),
                projectAPI.getAll(),
                taskAPI.getAll(),
                journalAPI.getAll()
            ]);
            setGroups(groupsRes.data.results || []);
            setProjects(projectsRes.data.results || []);
            setTasks(tasksRes.data.results || []);
            setJournals(journalRes?.data.results || journalRes?.data || []);
        } catch (error) {
            console.error("Error fetching worker data", error);
        }
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await groupAPI.create({ name: newGroupName, description: newGroupDesc });
            toast.success("Groupe créé avec succès !");
            setShowCreateGroup(false);
            setNewGroupName('');
            setNewGroupDesc('');
            fetchAllData();
        } catch (error) {
            toast.error("Erreur lors de la création du groupe");
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await projectAPI.create(newProject);
            toast.success("Projet créé avec succès !");
            setShowCreateProject(false);
            setNewProject({ title: '', description: '', status: 'PLANNED' });
            fetchAllData();
        } catch (error) {
            toast.error("Erreur lors de la création du projet");
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await taskAPI.create(newTask);
            toast.success("Tâche créée avec succès !");
            setShowCreateTask(false);
            setNewTask({ title: '', description: '', project: '', status: 'TODO', assigned_to: '' });
            fetchAllData();
        } catch (error) {
            toast.error("Erreur lors de la création de la tâche");
        }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTask) return;
        try {
            const { id, title, description, status } = editingTask;
            // We only send editable fields. Project usually doesn't change but can.
            await taskAPI.update(id, { title, description, status });
            toast.success("Tâche mise à jour !");
            setShowEditTask(false);
            setEditingTask(null);
            fetchAllData();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const openEditModal = (task: WorkerTask) => {
        setEditingTask(task);
        setShowEditTask(true);
    };

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroupId) {
            toast.error("Veuillez sélectionner un groupe");
            return;
        }
        try {
            await invitationAPI.create({ recipient_email: inviteEmail, group: selectedGroupId });
            toast.success("Invitation envoyée !");
            setShowInvite(false);
            setInviteEmail('');
        } catch (error) {
            toast.error("Erreur lors de l'envoi de l'invitation");
        }
    };

    const navItems = [
        { label: 'Vue d\'ensemble', path: '/dashboard#overview', icon: Briefcase },
        { label: 'Projets', path: '/dashboard#projects', icon: FolderPlus },
        { label: 'Tâches', path: '/dashboard#tasks', icon: ListTodo },
        { label: 'Journaux', path: '/dashboard#journals', icon: Book },
        { label: 'Équipe & Groupes', path: '/dashboard#team', icon: Users },
        { label: 'Paramètres', path: '/dashboard#settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-dark-950 font-sans relative overflow-hidden pb-8 text-gray-200 selection:bg-primary-500 selection:text-white">
            <DashboardNavbar
                title="Espace Atelier"
                subtitle="Plateforme Travailleur"
                navItems={navItems}
            />
            {/* Background Pattern */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                <SewingMachinePattern opacity={0.03} color="#0ea5e9" />
            </div>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10 pt-24">

                {/* Modals */}
                {showCreateGroup && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-dark-800">
                            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" />
                                Créer un nouveau groupe
                            </h3>
                            <form onSubmit={handleCreateGroup} className="space-y-4">
                                <input className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Nom du groupe" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required />
                                <textarea className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Description" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateGroup(false)} className="px-5 py-2.5 text-slate-400 font-medium hover:text-white transition-colors">Annuler</button>
                                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-600/20 transition-all">Créer</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showCreateProject && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-dark-800">
                            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                                <FolderPlus className="w-5 h-5 text-amber-500" />
                                Nouveau Projet
                            </h3>
                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <input className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Titre du projet" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} required />
                                <textarea className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} required />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateProject(false)} className="px-5 py-2.5 text-slate-400 font-medium hover:text-white transition-colors">Annuler</button>
                                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-600/20 transition-all">Créer</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showCreateTask && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-dark-800">
                            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                                <ListTodo className="w-5 h-5 text-amber-500" />
                                Nouvelle Tâche
                            </h3>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <input className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Titre" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                                <textarea className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Description" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
                                <select className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" value={newTask.project} onChange={e => setNewTask({ ...newTask, project: e.target.value })} required>
                                    <option value="" className="bg-dark-900">Sélectionner un projet</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="bg-dark-900">{p.title}</option>)}
                                </select>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowCreateTask(false)} className="px-5 py-2.5 text-slate-400 font-medium hover:text-white transition-colors">Annuler</button>
                                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-600/20 transition-all">Créer</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showEditTask && editingTask && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-dark-800">
                            <h3 className="text-xl font-bold mb-4 text-white">Modifier la Tâche</h3>
                            <form onSubmit={handleUpdateTask} className="space-y-4">
                                <input
                                    className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                                    placeholder="Titre"
                                    value={editingTask.title}
                                    onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                    required
                                />
                                <textarea
                                    className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                                    placeholder="Description"
                                    value={editingTask.description}
                                    onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowEditTask(false)} className="px-5 py-2.5 text-slate-400 font-medium hover:text-white transition-colors">Annuler</button>
                                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-600/20 transition-all">Mettre à jour</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showInvite && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-dark-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-dark-800">
                            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-amber-500" />
                                Inviter un membre
                            </h3>
                            <form onSubmit={handleInviteUser} className="space-y-4">
                                <select className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} required>
                                    <option value="" className="bg-dark-900">Sélectionner un groupe</option>
                                    {groups.map(g => <option key={g.id} value={g.id} className="bg-dark-900">{g.name}</option>)}
                                </select>
                                <input type="email" className="w-full p-3 bg-slate-950 border border-dark-800 text-white rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none" placeholder="Email du destinataire" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setShowInvite(false)} className="px-5 py-2.5 text-slate-400 font-medium hover:text-white transition-colors">Annuler</button>
                                    <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-600/20 transition-all">Envoyer</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <>
                        {/* Mobile View Overview */}
                        <div className="md:hidden space-y-6">
                            {/* Stats Carousel */}
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4">
                                <div className="min-w-[240px] snap-center glass-panel p-5 rounded-2xl shadow-sm relative overflow-hidden">
                                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10">Projets en cours</h3>
                                    <p className="text-3xl font-bold font-display text-white relative z-10">{projects.filter(p => p.status === 'IN_PROGRESS').length}</p>
                                    <div className="absolute top-0 right-0 p-3 bg-primary-500/10 rounded-bl-2xl text-primary-400">
                                        <FolderPlus className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="min-w-[240px] snap-center glass-panel p-5 rounded-2xl shadow-sm relative overflow-hidden">
                                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10">Groupes Actifs</h3>
                                    <p className="text-3xl font-bold font-display text-white relative z-10">{groups.length}</p>
                                    <div className="absolute top-0 right-0 p-3 bg-accent-500/10 rounded-bl-2xl text-accent-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="min-w-[240px] snap-center glass-panel p-5 rounded-2xl shadow-sm relative overflow-hidden">
                                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10">Notifications</h3>
                                    <p className="text-3xl font-bold font-display text-white relative z-10">0</p>
                                    <div className="absolute top-0 right-0 p-3 bg-red-500/10 rounded-bl-2xl text-red-500">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Actions Grid */}
                            <div>
                                <h3 className="text-white font-bold mb-4 px-1 font-display">Actions Rapides</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setShowCreateProject(true)} className="p-4 glass-panel rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover-lift">
                                        <div className="p-3 bg-primary-500/10 rounded-full text-primary-400">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-300">Nouveau Projet</span>
                                    </button>
                                    <button onClick={() => setShowInvite(true)} className="p-4 glass-panel rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform hover-lift">
                                        <div className="p-3 bg-accent-500/10 rounded-full text-accent-400">
                                            <UserPlus className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-300">Inviter Membre</span>
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Recent Projects List */}
                            <div className="glass-panel rounded-2xl p-5 shadow-sm">
                                <h3 className="font-bold text-white mb-4 font-display">Projets Récents</h3>
                                <div className="space-y-3">
                                    {projects.slice(0, 3).map(proj => (
                                        <div key={proj.id} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-white/5">
                                            <div>
                                                <p className="font-bold text-sm text-gray-200">{proj.title}</p>
                                                <p className="text-[10px] text-dark-600 dark:text-primary-300 uppercase tracking-widest">{new Date(proj.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${proj.status === 'IN_PROGRESS' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : 'bg-dark-800/50 text-gray-400 border border-white/10'}`}>
                                                {proj.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                        {/* Desktop View Overview */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-panel p-6 rounded-2xl hover-lift group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[40px] pointer-events-none" />
                                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10 group-hover:text-primary-400 transition-colors">Projets en cours</h3>
                                    <p className="text-4xl font-bold font-display text-white mt-1 group-hover:scale-105 transition-transform origin-left relative z-10">{projects.filter(p => p.status === 'IN_PROGRESS').length}</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl hover-lift group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-[40px] pointer-events-none" />
                                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10 group-hover:text-accent-400 transition-colors">Groupes Actifs</h3>
                                    <p className="text-4xl font-bold font-display text-white mt-1 group-hover:scale-105 transition-transform origin-left relative z-10">{groups.length}</p>
                                </div>
                                <div className="glass-panel p-6 rounded-2xl hover-lift group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none" />
                                    <h3 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2 relative z-10">Notifications</h3>
                                    <p className="text-4xl font-bold font-display text-white mt-1 group-hover:scale-105 transition-transform origin-left relative z-10">0</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Announcements */}
                                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                                    <h3 className="text-xl font-bold font-display mb-6 flex items-center gap-3 text-white relative z-10">
                                        <div className="p-2 border border-accent-500/20 bg-accent-500/10 rounded-lg text-accent-400">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        Annonces
                                    </h3>
                                    <div className="text-gray-300 relative z-10">
                                        <AnnouncementList />
                                    </div>
                                </div>

                                {/* Recent Projects */}
                                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-6 relative z-10">
                                        <h3 className="text-xl font-bold font-display flex items-center gap-3 text-white">
                                            <div className="p-2 border border-primary-500/20 bg-primary-500/10 rounded-lg text-primary-400">
                                                <FolderPlus className="w-5 h-5" />
                                            </div>
                                            Projets Récents
                                        </h3>
                                        <button onClick={() => setActiveTab('projects')} className="text-xs uppercase tracking-widest text-primary-400 font-bold hover:text-primary-300 transition-colors">Voir tout</button>
                                    </div>
                                    <div className="space-y-3 relative z-10">
                                        {projects.slice(0, 3).map(proj => (
                                            <div key={proj.id} className="p-4 bg-dark-800/50 rounded-2xl flex justify-between items-center hover:bg-white/5 transition-colors border border-white/5">
                                                <span className="font-bold text-gray-200 text-sm">{proj.title}</span>
                                                <span className={`text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${proj.status === 'IN_PROGRESS' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 'bg-dark-800/50 text-gray-400 border-white/10'}`}>{proj.status}</span>
                                            </div>
                                        ))}
                                        {projects.length === 0 && <p className="text-dark-600 dark:text-primary-300 text-sm text-center py-4">Aucun projet récent.</p>}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'projects' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display text-white">Mes Projets</h2>
                            <button onClick={() => setShowCreateProject(true)} className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Nouveau Projet
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(proj => (
                                <div key={proj.id} className="glass-panel p-6 rounded-2xl hover-lift group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <h3 className="font-bold font-display text-white text-lg group-hover:text-primary-400 transition-colors">{proj.title}</h3>
                                        <span className={`text-[9px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border ${proj.status === 'IN_PROGRESS' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 'bg-dark-800/50 text-gray-400 border-white/10'}`}>{proj.status}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed relative z-10">{proj.description}</p>
                                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-dark-600 dark:text-primary-300 relative z-10">
                                        <Calendar className="w-4 h-4 text-primary-400" />
                                        {new Date(proj.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'tasks' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 h-[calc(100vh-200px)]">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display text-white">Tableau des Tâches</h2>
                            <button onClick={() => setShowCreateTask(true)} className="btn-primary flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Nouvelle Tâche
                            </button>
                        </div>
                        <div className="glass-panel rounded-2xl p-4 h-full overflow-hidden">
                            <TaskBoard
                                tasks={tasks}
                                projects={projects}
                                onTaskUpdate={fetchAllData}
                                onEditTask={openEditModal}
                            />
                        </div>
                    </motion.div>
                )}

                {activeTab === 'team' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display text-white">Mes Groupes & Équipe</h2>
                            <div className="flex gap-3">
                                <button onClick={() => setShowInvite(true)} className="btn-secondary flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" /> Inviter
                                </button>
                                <button onClick={() => setShowCreateGroup(true)} className="btn-primary flex items-center gap-2">
                                    <Users className="w-5 h-5" /> Créer Groupe
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groups.map(group => (
                                <div key={group.id} className="glass-panel p-6 rounded-2xl hover-lift group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <h3 className="font-bold font-display text-white text-lg mb-2 group-hover:text-accent-400 transition-colors relative z-10">{group.name}</h3>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed relative z-10">{group.description || 'Aucune description'}</p>
                                    <div className="flex justify-between items-center text-sm pt-4 border-t border-white/5 relative z-10">
                                        <span className="text-accent-400 font-bold bg-accent-500/10 px-3 py-1 rounded-md text-[10px] uppercase tracking-wider">{group.members?.length || 0} membres</span>
                                        <button
                                            onClick={() => { setSelectedGroupId(group.id); setShowInvite(true); }}
                                            className="text-dark-600 dark:text-primary-300 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                                        >
                                            + Ajouter membre
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'journals' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Journal des Apprentis</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Rechercher un apprenti..."
                                    className="p-3 bg-dark-900 border border-dark-800 rounded-xl text-sm w-72 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 outline-none placeholder:text-dark-600 dark:text-primary-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {journals.length === 0 ? (
                                <p className="text-dark-600 dark:text-primary-300 text-center py-12 bg-dark-900 rounded-3xl border border-dark-800">Aucun journal trouvé.</p>
                            ) : (
                                journals.map(journal => (
                                    <div key={journal.id} className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <h3 className="font-bold font-display text-white">{journal.apprentice_name || 'Apprenti inconnu'}</h3>
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-dark-600 dark:text-primary-300">{new Date(journal.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-[9px] px-2.5 py-1 bg-green-500/10 text-green-400 rounded-md font-bold uppercase tracking-wider border border-green-500/20">
                                                {new Date(journal.created_at).toLocaleTimeString().slice(0, 5)}
                                            </span>
                                        </div>

                                        <p className="text-gray-300 mb-6 bg-dark-900 mt-2 p-5 rounded-xl border border-white/5 leading-relaxed text-sm relative z-10">
                                            {journal.content}
                                        </p>

                                        <div className="border-t border-white/5 pt-4 relative z-10">
                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Feedback Superviseur</h4>
                                            <form
                                                onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.currentTarget);
                                                    const feedback = formData.get('feedback') as string;
                                                    try {
                                                        await journalAPI.update(journal.id, { supervisor_feedback: feedback });
                                                        toast.success('Feedback envoyé');
                                                        fetchAllData(); // Refresh
                                                    } catch (err) {
                                                        toast.error('Erreur lors de l\'envoi du feedback');
                                                    }
                                                }}
                                                className="flex gap-3"
                                            >
                                                <input
                                                    name="feedback"
                                                    className="flex-1 p-3 bg-dark-950 border border-white/10 rounded-xl text-sm text-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none placeholder:text-dark-600 dark:text-primary-300"
                                                    placeholder="Ajouter un commentaire ou une correction..."
                                                    defaultValue={journal.supervisor_feedback || ''}
                                                />
                                                <button type="submit" className="btn-primary py-2.5 px-6">
                                                    Enregistrer
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold font-display text-white mb-6">Paramètres du Compte</h2>

                        <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none" />
                            <h3 className="text-lg font-bold font-display text-white border-b border-white/5 pb-4 relative z-10">Profil</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Nom</label>
                                    <input type="text" value={user?.nom || ''} disabled className="w-full p-3 bg-dark-950 rounded-xl border border-white/5 text-dark-600 dark:text-primary-300 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Prénom</label>
                                    <input type="text" value={user?.prenom || ''} disabled className="w-full p-3 bg-dark-950 rounded-xl border border-white/5 text-dark-600 dark:text-primary-300 cursor-not-allowed" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Email</label>
                                    <input type="email" value={user?.email || ''} disabled className="w-full p-3 bg-dark-950 rounded-xl border border-white/5 text-dark-600 dark:text-primary-300 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-8 rounded-3xl space-y-6">
                            <h3 className="text-lg font-bold font-display text-white border-b border-white/5 pb-4">Sécurité</h3>
                            <button className="text-accent-500 hover:text-accent-400 hover:underline text-sm font-bold">Changer le mot de passe</button>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default WorkerDashboard;
