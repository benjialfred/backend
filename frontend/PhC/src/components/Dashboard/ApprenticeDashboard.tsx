import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    announcementAPI,
    inventoryAPI,
    journalAPI,
    projectAPI
} from '@/services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SewingMachinePattern from '@/components/ui/SewingMachinePattern';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import {
    BookOpen,
    Scissors,
    Award,
    Wrench,
    PenTool,
    Plus,
    Bell,
    Calendar,
    LayoutDashboard
} from 'lucide-react';
import type { Material, DailyJournal, Announcement, WorkerProject } from '@/types';
import ApprenticeCharts from '@/components/Dashboard/ApprenticeCharts';

const ApprenticeDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'materials'>('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    // Data States
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [journals, setJournals] = useState<DailyJournal[]>([]);
    const [projects, setProjects] = useState<WorkerProject[]>([]);

    // Form States
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [newMaterialName, setNewMaterialName] = useState('');
    const [journalEntry, setJournalEntry] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Handle hash navigation on mount and hash change
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (['overview', 'projects', 'materials'].includes(hash)) {
                setActiveTab(hash as any);
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [
                annData,
                matData,
                journData,
                projData
            ] = await Promise.all([
                announcementAPI.getAll({ target_role: 'APPRENTI' }),
                inventoryAPI.getMyMaterials(),
                journalAPI.getAll(),
                projectAPI.getAll().catch(() => ({ results: [] })) // Adjust if separate endpoint exists for apprentice projects
            ]);


            setAnnouncements(Array.isArray(annData) ? annData : (annData.results || []));
            setMaterials(matData.data || []);
            setJournals(Array.isArray(journData) ? journData : (journData.results || []));
            setProjects(Array.isArray(projData) ? projData : (projData.results || []));

        } catch (error) {
            console.error("Error loading dashboard data", error);
            toast.error("Erreur de chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterMaterial = async () => {
        if (!newMaterialName.trim()) return;
        setIsSubmitting(true);
        try {
            await inventoryAPI.addMaterial({
                name: newMaterialName,
                quantity: 1,
                status: 'BON_ETAT',
                owner: user?.id
            });
            toast.success("Outil enregistré !");
            setNewMaterialName('');
            setShowMaterialModal(false);
            // Refresh materials
            const matData = await inventoryAPI.getMyMaterials();
            setMaterials(matData.data || []);
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogWork = async () => {
        if (!journalEntry.trim()) {
            toast.error("Le journal ne peut pas être vide");
            return;
        }
        setIsSubmitting(true);
        try {
            await journalAPI.create({
                content: journalEntry,
                date: new Date().toISOString().split('T')[0],
                apprentice: user?.id
            });
            toast.success("Journal mis à jour !");
            setJournalEntry('');
            // Refresh journals
            const journData = await journalAPI.getAll();
            setJournals(Array.isArray(journData) ? journData : (journData.results || []));
        } catch (error) {
            toast.error("Erreur de sauvegarde");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-dark-950 flex justify-center items-center min-h-screen">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
                </div>
            </div>
        );
    }

    // Explicit nav items to match current functionality + internal linking
    const navItems = [
        { label: "Vue d'ensemble", path: '/dashboard#overview', icon: LayoutDashboard },
        { label: 'Projets', path: '/dashboard#projects', icon: Scissors },
        { label: 'Matériels', path: '/dashboard#materials', icon: Wrench },
    ];

    return (
        <div className="min-h-screen bg-dark-950 font-sans pb-12 relative overflow-hidden selection:bg-primary-500 selection:text-white">
            <DashboardNavbar
                title={`Espace Apprenti`}
                subtitle="Formation & Excellence"
                navItems={navItems}
            />

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
                <SewingMachinePattern opacity={0.03} color="#0ea5e9" />
            </div>

            <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10 pt-24">

                {activeTab === 'overview' && (
                    <>
                        {/* Mobile View */}
                        <div className="md:hidden space-y-6">
                            {/* Stats Carousel */}
                            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-4 px-4">
                                {[
                                    { icon: BookOpen, label: 'Journaux', value: journals.length, color: 'text-primary-400' },
                                    { icon: Scissors, label: 'Projets', value: projects.length, color: 'text-accent-400' },
                                    { icon: Wrench, label: 'Outils', value: materials.length, color: 'text-orange-400' },
                                ].map((stat, index) => (
                                    <div key={index} className="min-w-[160px] snap-center glass-panel p-5 rounded-2xl shadow-sm">
                                        <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                                        <p className="text-2xl font-bold font-display text-white">{stat.value}</p>
                                        <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Journal Mobile */}
                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                                <h3 className="font-bold font-display text-white mb-3 flex items-center gap-2 relative z-10">
                                    <PenTool className="w-5 h-5 text-emerald-400" />
                                    Journal Rapide
                                </h3>
                                <div className="flex flex-col gap-3 relative z-10">
                                    <textarea
                                        value={journalEntry}
                                        onChange={(e) => setJournalEntry(e.target.value)}
                                        placeholder="Qu'avez-vous appris ?"
                                        className="w-full h-24 p-3 bg-dark-900 border border-white/10 rounded-xl text-sm text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none placeholder:text-dark-600 dark:text-primary-300 transition-all"
                                    ></textarea>
                                    <button
                                        onClick={handleLogWork}
                                        disabled={isSubmitting}
                                        className="w-full btn-primary text-sm py-3"
                                    >
                                        {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
                                    </button>
                                </div>
                            </div>

                            {/* Recent Announcements Mobile */}
                            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                                <h3 className="font-bold font-display text-white mb-3 flex items-center gap-2 relative z-10">
                                    <Bell className="w-5 h-5 text-accent-400" />
                                    Annonces
                                </h3>
                                <div className="space-y-3 relative z-10">
                                    {announcements.slice(0, 2).map((ann) => (
                                        <div key={ann.id} className="p-3 bg-dark-800/50 rounded-xl border border-white/5 border-l-2 border-l-accent-500">
                                            <h4 className="font-bold text-gray-200 text-sm">{ann.title}</h4>
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ann.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Desktop View */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { icon: BookOpen, label: 'Journaux', value: journals.length, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
                                    { icon: Scissors, label: 'Projets', value: projects.length, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
                                    { icon: Wrench, label: 'Outils', value: materials.length, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
                                    { icon: Award, label: 'Niveau', value: 'Niveau 1', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="glass-panel p-6 rounded-2xl hover-lift flex flex-col items-center text-center group relative overflow-hidden"
                                    >
                                        <div className="absolute -inset-px bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                                        <div className={`p-3 rounded-xl border backdrop-blur-md mb-3 ${stat.bg} ${stat.border} group-hover:scale-110 transition-transform`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <span className="text-2xl md:text-3xl font-bold font-display text-white mb-1 relative z-10">{stat.value}</span>
                                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest relative z-10">{stat.label}</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Charts Section */}
                            <ApprenticeCharts projects={projects} journals={journals} />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Announcements Feed */}
                                <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden">
                                    {/* Background Glow */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full blur-[60px] pointer-events-none" />

                                    <h3 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-3 relative z-10">
                                        <div className="p-2 border border-accent-500/20 bg-accent-500/10 rounded-lg">
                                            <Bell className="w-5 h-5 text-accent-400" />
                                        </div>
                                        Annonces Atelier
                                    </h3>

                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                                        {announcements.length === 0 ? (
                                            <div className="text-center py-10 text-dark-600 dark:text-primary-300 font-medium">Aucune annonce récente</div>
                                        ) : (
                                            announcements.map((ann) => (
                                                <div key={ann.id} className="p-4 rounded-xl bg-dark-800/50 border border-white/5 border-l-2 border-l-accent-500 hover:bg-white/5 hover:border-white/10 transition-all shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-gray-200 text-sm">{ann.title}</h4>
                                                        <span className="text-[11px] text-dark-600 dark:text-primary-300 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 leading-relaxed">{ann.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Quick Journal Entry */}
                                <div className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

                                    <h3 className="text-xl font-bold font-display text-white mb-6 flex items-center gap-3 relative z-10">
                                        <div className="p-2 border border-emerald-500/20 bg-emerald-500/10 rounded-lg">
                                            <PenTool className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        Journal Rapide
                                    </h3>

                                    <div className="flex-1 flex flex-col gap-4 relative z-10">
                                        <textarea
                                            value={journalEntry}
                                            onChange={(e) => setJournalEntry(e.target.value)}
                                            placeholder="Qu'avez-vous appris aujourd'hui ?"
                                            className="w-full flex-1 min-h-[150px] p-4 bg-dark-900 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none resize-none transition-all placeholder:text-dark-600 dark:text-primary-300 text-white text-sm"
                                        ></textarea>
                                        <button
                                            onClick={handleLogWork}
                                            disabled={isSubmitting}
                                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Journals History */}
                            <div className="mt-8">
                                <h3 className="text-lg font-bold font-display text-white mb-4 px-2">Historique Récent</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {journals.slice(0, 3).map((j, i) => (
                                        <div key={i} className="p-4 rounded-xl glass-panel relative overflow-hidden hover:border-white/10 transition-colors group">
                                            <div className="absolute -inset-px bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            <div className="flex items-center gap-2 mb-2 text-[11px] text-dark-600 dark:text-primary-300 uppercase tracking-widest font-bold relative z-10">
                                                <Calendar className="w-3 h-3 text-primary-400" />
                                                {new Date(j.date).toLocaleDateString()}
                                            </div>
                                            <p className="text-sm text-gray-300 line-clamp-3 relative z-10">{j.content}</p>
                                            {j.supervisor_feedback && (
                                                <div className="mt-3 pt-3 border-t border-white/5 text-xs relative z-10">
                                                    <span className="text-accent-400 font-bold">Feedback:</span> <span className="text-gray-400 block mt-1">{j.supervisor_feedback}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'materials' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display text-white">Mes Matériels</h2>
                            <button
                                onClick={() => setShowMaterialModal(!showMaterialModal)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Ajouter Outil
                            </button>
                        </div>

                        <AnimatePresence>
                            {showMaterialModal && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="overflow-hidden glass-panel p-6 rounded-2xl shadow-xl"
                                >
                                    <h3 className="font-bold font-display text-white mb-4">Nouvel Outil</h3>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={newMaterialName}
                                            onChange={(e) => setNewMaterialName(e.target.value)}
                                            placeholder="Nom de l'outil (ex: Ciseaux)"
                                            className="flex-1 p-3 rounded-xl border border-white/10 text-sm bg-dark-900 text-white focus:border-primary-500 outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-dark-600 dark:text-primary-300"
                                        />
                                        <button
                                            onClick={handleRegisterMaterial}
                                            disabled={isSubmitting}
                                            className="btn-primary"
                                        >
                                            {isSubmitting ? '...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {materials.map((mat) => (
                                <div key={mat.id} className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:border-primary-500/30 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)] transition-all">
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-10 h-10 border border-primary-500/20 bg-primary-500/10 rounded-lg flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform"><Wrench className="w-5 h-5" /></div>
                                        <div>
                                            <span className="font-bold text-gray-200 block text-sm">{mat.name}</span>
                                            <span className="text-[11px] font-bold text-dark-600 dark:text-primary-300 uppercase tracking-widest">Qté: {mat.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-md">
                                        {mat.status}
                                    </span>
                                </div>
                            ))}
                            {materials.length === 0 && (
                                <div className="col-span-full py-12 text-center text-dark-600 dark:text-primary-300 font-medium glass-panel border-dashed">
                                    Aucun matériel enregistré. Ajoutez vos outils !
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'projects' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-display text-white">Mes Projets</h2>
                        </div>

                        {projects.length === 0 ? (
                            <div className="p-12 text-center text-dark-600 dark:text-primary-300 glass-panel border-dashed">
                                <Scissors className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                <p className="font-medium text-gray-400">Aucun projet assigné pour le moment.</p>
                                <p className="text-[11px] uppercase tracking-widest mt-2">Détendez-vous ou consultez les annonces.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {projects.map((proj) => (
                                    <div key={proj.id} className="glass-panel p-6 rounded-2xl hover-lift group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <h3 className="text-xl font-bold font-display text-white">{proj.title}</h3>
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${proj.status === 'IN_PROGRESS' ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' :
                                                proj.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    'bg-dark-800/50 text-gray-400 border-white/10'
                                                }`}>
                                                {proj.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4 leading-relaxed relative z-10">{proj.description}</p>
                                        <div className="text-[11px] font-bold uppercase tracking-widest text-dark-600 dark:text-primary-300 flex gap-4 relative z-10">
                                            <span>Début: {new Date(proj.start_date).toLocaleDateString()}</span>
                                            {proj.end_date && <span>Fin: {new Date(proj.end_date).toLocaleDateString()}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

            </main>
        </div>
    );
};

export default ApprenticeDashboard;
