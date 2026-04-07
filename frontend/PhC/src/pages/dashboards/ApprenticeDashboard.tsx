import React, { useState, useEffect } from 'react';
import { announcementAPI, inventoryAPI, journalAPI } from '@/services/api';
import type { Announcement, Material, DailyJournal } from '@/types';
import { Box, Plus, Wrench, Book, Star, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiClient from '@/services/api';
import NotificationMenu from '@/components/communications/NotificationMenu';

const ApprenticeDashboard = () => {
    const [activeTab, setActiveTab] = useState<'home' | 'materials' | 'journal'>('home');

    // Data States
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [journals, setJournals] = useState<DailyJournal[]>([]);
    const [apprenticeData, setApprenticeData] = useState<any>(null);

    // Form States
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [newMaterial, setNewMaterial] = useState({ name: '', quantity: 1, description: '' });

    const [showJournalForm, setShowJournalForm] = useState(false);
    const [newJournalContent, setNewJournalContent] = useState('');

    useEffect(() => {
        fetchData();
        fetchApprenticeDetails();
    }, []);

    const fetchData = async () => {
        try {
            const [annResponse, matResponse, journalResponse] = await Promise.all([
                announcementAPI.getAll(),
                inventoryAPI.getMyMaterials(),
                journalAPI.getAll()
            ]);
            setAnnouncements(annResponse.results || []);
            setMaterials(matResponse.data || []);
            setJournals(journalResponse.data.results || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchApprenticeDetails = async () => {
        try {
            // Need to fetch specific apprentice profile
            const response = await apiClient.get('/users/apprentices/');
            if (response.data && response.data.results && response.data.results.length > 0) {
                setApprenticeData(response.data.results[0]);
            }
        } catch (error) {
            console.error("Error fetching apprentice details", error);
        }
    }

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await inventoryAPI.addMaterial(newMaterial);
            toast.success('Matériel ajouté avec succès');
            setShowMaterialForm(false);
            setNewMaterial({ name: '', quantity: 1, description: '' });
            inventoryAPI.getMyMaterials().then(res => setMaterials(res.data || []));
        } catch (error) {
            toast.error("Erreur lors de l'ajout du matériel");
        }
    };

    const handleAddJournal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await journalAPI.create({ content: newJournalContent });
            toast.success('Journal enregistré');
            setShowJournalForm(false);
            setNewJournalContent('');
            journalAPI.getAll().then(res => setJournals(res.data.results || []));
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement du journal");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Espace Apprenti</h1>
                    <p className="text-dark-600 dark:text-primary-300">Gérez votre progression et vos outils</p>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationMenu />
                    {apprenticeData && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-3">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <div>
                                <p className="text-xs opacity-80 uppercase font-semibold">Niveau actuel</p>
                                <p className="font-bold">{apprenticeData.grade}</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-white'
                        }`}
                >
                    <Bell className="w-4 h-4" />
                    Accueil & Annonces
                </button>
                <button
                    onClick={() => setActiveTab('materials')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'materials' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-white'
                        }`}
                >
                    <Box className="w-4 h-4" />
                    Mon Matériel
                </button>
                <button
                    onClick={() => setActiveTab('journal')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'journal' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-white'
                        }`}
                >
                    <Book className="w-4 h-4" />
                    Journal de bord
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'home' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-in">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Annonces récentes</h2>
                        </div>
                        {announcements.length === 0 ? (
                            <p className="text-dark-600 dark:text-primary-300 text-sm">Aucune annonce pour le moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <h3 className="font-medium text-blue-900">{ann.title}</h3>
                                        <p className="text-sm text-blue-800 mt-1">{ann.content}</p>
                                        <div className="mt-2 text-xs text-blue-600 flex justify-between">
                                            <span>Par: {ann.author_details?.prenom || 'Admin'}</span>
                                            <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'materials' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Inventaire Personnel</h2>
                            <button
                                onClick={() => setShowMaterialForm(!showMaterialForm)}
                                className="flex items-center gap-1 text-sm bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter Matériel
                            </button>
                        </div>

                        {showMaterialForm && (
                            <form onSubmit={handleAddMaterial} className="mb-6 p-4 bg-white rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Nom du matériel"
                                        className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                                        required
                                        value={newMaterial.name}
                                        onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantité"
                                        className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-200 outline-none"
                                        min="1"
                                        required
                                        value={newMaterial.quantity}
                                        onChange={e => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (optionnel)"
                                        className="p-2 border rounded-lg md:col-span-2 focus:ring-2 focus:ring-purple-200 outline-none"
                                        value={newMaterial.description}
                                        onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    />
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowMaterialForm(false)}
                                        className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Enregistrer</button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {materials.map((mat) => (
                                <div key={mat.id} className="p-4 border border-primary-500/50 dark:border-dark-700 rounded-lg hover:shadow-md transition-shadow group relative">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-medium text-dark-900 dark:text-white">{mat.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${mat.status === 'BON_ETAT' ? 'bg-green-100 text-green-700' : 'bg-primary-50 text-gray-600'}`}>
                                            {mat.status === 'BON_ETAT' ? 'Bon état' : mat.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-dark-600 dark:text-primary-300 mt-1">{mat.description || 'Aucune description'}</p>
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-dark-600 dark:text-primary-300">
                                        <span>Qté: {mat.quantity}</span>
                                        <span>{new Date(mat.date_added).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                            {materials.length === 0 && !showMaterialForm && (
                                <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-lg border-2 border-dashed border-primary-500/50 dark:border-dark-700">
                                    <Wrench className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Votre inventaire est vide.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'journal' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">Journal de Bord</h2>
                            <button
                                onClick={() => setShowJournalForm(!showJournalForm)}
                                className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Nouvelle Entrée
                            </button>
                        </div>

                        {showJournalForm && (
                            <form onSubmit={handleAddJournal} className="mb-6 p-4 bg-white rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Qu'avez-vous appris ou réalisé aujourd'hui ?
                                </label>
                                <textarea
                                    className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-green-200 outline-none"
                                    placeholder="Décrivez vos tâches..."
                                    value={newJournalContent}
                                    onChange={e => setNewJournalContent(e.target.value)}
                                    required
                                />
                                <div className="mt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowJournalForm(false)}
                                        className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-200 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Sauvegarder</button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-4">
                            {journals.map((entry) => (
                                <div key={entry.id} className="p-4 border-l-4 border-green-500 bg-white rounded-r-lg hover:bg-white transition-colors border-y border-r border-primary-500/50 dark:border-dark-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-dark-900 dark:text-white">
                                            {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="text-xs text-dark-600 dark:text-primary-300">
                                            {new Date(entry.created_at).toLocaleTimeString().slice(0, 5)}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>

                                    {entry.supervisor_feedback && (
                                        <div className="mt-3 pt-3 border-t border-primary-500/50 dark:border-dark-700">
                                            <p className="text-xs font-semibold text-purple-600 mb-1">Feedback Superviseur:</p>
                                            <p className="text-sm text-gray-600 italic bg-purple-50 p-2 rounded">{entry.supervisor_feedback}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {journals.length === 0 && !showJournalForm && (
                                <div className="text-center py-12 text-gray-400 bg-white rounded-lg border-2 border-dashed border-primary-500/50 dark:border-dark-700">
                                    <Book className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                    <p>Votre journal est vide.</p>
                                    <p className="text-sm">Commencez à noter vos progrès dès aujourd'hui.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default ApprenticeDashboard;
