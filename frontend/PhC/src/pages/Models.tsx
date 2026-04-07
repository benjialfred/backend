// src/pages/Models.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Scissors,
  Tag,
  Calendar,
  Upload
} from 'lucide-react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Header from '@/components/layout/Header';
import Modal from '@/components/ui/Modal';
import AddModelForm from '@/components/forms/AddModelForm';
import type { Model } from '@/types';
import { modelAPI } from '@/services/api';

const Models = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data: any = await modelAPI.getAll();
      const modelsList = Array.isArray(data) ? data : (data.results || []);
      setModels(modelsList);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        await modelAPI.delete(id);
        setModels(models.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || model.category_id.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#141b2d]">
      <Sidebar />
      <div className="ml-64">
        <Header title="Gestion des Modèles" />

        <main className="p-6">
          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Modèles</h1>
                <p className="text-gray-400">Gérez vos patrons et designs de vêtements</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1f2940] border border-[#2d2f5e] text-gray-300 rounded-lg hover:bg-[#2d2f5e] transition-colors">
                  <Upload className="w-5 h-5" />
                  <span>Importer</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg shadow-blue-600/30"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nouveau Modèle</span>
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un modèle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#1f2940] border border-[#2d2f5e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-[#1f2940] border border-[#2d2f5e] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Toutes catégories</option>
                  <option value="1">Chemises</option>
                  <option value="2">Robes</option>
                  <option value="3">Pantalons</option>
                  <option value="4">Accessoires</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-3 bg-[#1f2940] border border-[#2d2f5e] text-white rounded-lg hover:bg-[#2d2f5e] transition-colors">
                  <Filter className="w-5 h-5" />
                  <span>Filtres avancés</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grille des modèles */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredModels.map(model => (
                <div key={model.id} className="bg-[#1f2940] rounded-xl shadow-lg overflow-hidden border border-[#2d2f5e] hover:shadow-xl transition-shadow group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={model.images[0]}
                      alt={model.nom}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded shadow-lg">
                        Modèle
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white truncate">{model.nom}</h3>
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">Patron</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {model.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>Catégorie {model.category_id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(model.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedModel(model)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#141b2d] text-gray-300 rounded-lg hover:bg-[#2d2f5e] hover:text-white transition-colors border border-[#2d2f5e]"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </button>
                      <button
                        onClick={() => setSelectedModel(model)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredModels.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-400">
                Affichage de 1 à {Math.min(12, filteredModels.length)} sur {filteredModels.length} modèles
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 bg-[#1f2940] border border-[#2d2f5e] text-white rounded-lg hover:bg-[#2d2f5e] transition-colors">
                  Précédent
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  1
                </button>
                <button className="px-3 py-2 bg-[#1f2940] border border-[#2d2f5e] text-white rounded-lg hover:bg-[#2d2f5e] transition-colors">
                  2
                </button>
                <button className="px-3 py-2 bg-[#1f2940] border border-[#2d2f5e] text-white rounded-lg hover:bg-[#2d2f5e] transition-colors">
                  Suivant
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Ajouter/Modifier Modèle */}
      <Modal
        isOpen={showAddModal || !!selectedModel}
        onClose={() => {
          setShowAddModal(false);
          setSelectedModel(null);
        }}
        title={selectedModel ? 'Modifier le Modèle' : 'Nouveau Modèle'}
        size="xl"
      >
        <AddModelForm
          model={selectedModel}
          onSuccess={() => {
            setShowAddModal(false);
            setSelectedModel(null);
            fetchModels();
          }}
        />
      </Modal>
    </div>
  );
};

export default Models;