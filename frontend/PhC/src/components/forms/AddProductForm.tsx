
import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Loader2, DollarSign, Sparkles, Box } from 'lucide-react';
import type { Product, Category } from '@/types';
import { productAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface AddProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: 0,
    prix_promotion: '',
    stock: 0,
    category_id: '',
    image_principale: '',
    style: 'CLASSIC',
    is_featured: false,
    is_active: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom,
        description: product.description || '',
        prix: product.prix,
        prix_promotion: product.prix_promotion?.toString() || '',
        stock: product.stock,
        category_id: product.category?.toString() || product.category_id?.toString() || '', // Handle both object or ID
        image_principale: product.image_principale || '',
        style: product.style || 'CLASSIC',
        is_featured: product.is_featured,
        is_active: product.is_active,
      });
      if (product.galerie_images && Array.isArray(product.galerie_images)) {
        // Assuming backend returns list of strings (urls or base64)
        setImages(product.galerie_images.map((img: any) => typeof img === 'string' ? img : img.image));
      }
    }
  }, [product]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await productAPI.getCategories();
      console.log('Categories API response:', data);

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
        // Handle paginated response if backend adds pagination
        setCategories((data as any).results);
      } else {
        console.error('Invalid categories format (expected array):', data);
        setCategories([]);
        // Optional: show error but don't block the UI too much
        // toast.error('Format de catégories inattendu');
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    // Quick validations
    if (!formData.nom.trim()) {
      const msg = 'Le nom du produit est requis';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.category_id) {
      const msg = 'Catégorie requise';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.image_principale && !product) { // Image required only on creation
      const msg = 'Image principale requise';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (formData.prix <= 0) {
      const msg = 'Prix invalide';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...formData,
        category_id: Number(formData.category_id),
        prix: Number(formData.prix),
        prix_promotion: formData.prix_promotion ? Number(formData.prix_promotion) : null,
        stock: Number(formData.stock),
        galerie_images: images.length > 0 ? images : [], // Backend expects list of base64 strings
      };

      if (product) {
        await productAPI.update(product.id, productData);
      } else {
        await productAPI.create({ ...productData, sku: `PROD-${Date.now()}` });
      }

      setShowSuccessModal(true);
      // onSuccess(); // Deferred to modal confirm
    } catch (error: any) {
      console.error('Creation error:', error);
      const errorMsg = error.response?.data?.detail
        || (typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : null)
        || 'Erreur lors de la sauvegarde';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('L\'image doit être < 5MB'); return; }
    if (!file.type.startsWith('image/')) { setError('Fichier invalide'); return; }

    setImageUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64 = reader.result as string;
        if (!formData.image_principale) setFormData({ ...formData, image_principale: base64 });
        else setImages([...images, base64]);
      }
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 flex justify-between items-center">
          <span className="flex items-center gap-2"><X className="w-4 h-4" /> {error}</span>
          <button type="button" onClick={() => setError('')} className="hover:text-white"><X size={16} /></button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column: Details */}
        <div className="space-y-6">
          <h4 className="text-blue-400 font-medium uppercase tracking-wider text-xs border-b border-[#2d2f5e] pb-2 mb-4">Informations Générales</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nom du Produit</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-[#141b2d] border border-[#2d2f5e] rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="Ex: Robe de Soirée Élégante"
                />
                <Sparkles className="absolute right-4 top-3.5 text-gray-600 w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 flex justify-between">
                  Catégorie
                  {error.includes('catégories') && (
                    <button type="button" onClick={fetchCategories} className="text-xs text-blue-400 hover:text-blue-300 underline">Réessayer</button>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-[#141b2d] border border-[#2d2f5e] rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none appearance-none disabled:opacity-50"
                    disabled={categoriesLoading}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  {categoriesLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Style</label>
                <select
                  value={formData.style}
                  onChange={e => setFormData({ ...formData, style: e.target.value })}
                  className="w-full bg-[#141b2d] border border-[#2d2f5e] rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                >
                  {['CLASSIC', 'MODERN', 'SPORT', 'CASUAL', 'FORMAL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Prix (FCFA)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.prix}
                    onChange={e => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#141b2d] border border-[#2d2f5e] rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                  />
                  <DollarSign className="absolute right-4 top-3.5 text-gray-600 w-4 h-4" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#141b2d] border border-[#2d2f5e] rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none"
                  />
                  <Box className="absolute right-4 top-3.5 text-gray-600 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-[#141b2d] border border-[#2d2f5e] rounded-xl px-4 py-3 text-white focus:border-blue-500 transition-all outline-none resize-none"
            />
          </div>
        </div>

        {/* Right Column: Visuals */}
        <div className="space-y-6">
          <h4 className="text-blue-400 font-medium uppercase tracking-wider text-xs border-b border-[#2d2f5e] pb-2 mb-4">Visuels & Finitions</h4>

          <div className="space-y-4">
            {/* Main Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Image Principale</label>
              <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#2d2f5e] hover:border-blue-500/50 bg-[#141b2d] flex flex-col items-center justify-center transition-all relative overflow-hidden group">
                {formData.image_principale ? (
                  <>
                    <img src={formData.image_principale} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setFormData({ ...formData, image_principale: '' })} className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    {imageUploading ? <Loader2 className="animate-spin text-blue-400" /> : <ImageIcon className="text-gray-600 mb-2 w-8 h-8" />}
                    <span className="text-dark-600 dark:text-primary-300 text-sm">Cliquez pour uploader</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Galerie (Max 5)</label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#2d2f5e] group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="cursor-pointer aspect-square rounded-lg border border-dashed border-[#2d2f5e] hover:border-blue-500 bg-[#141b2d] flex items-center justify-center text-gray-600 hover:text-blue-500 transition-colors">
                    <Plus />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2d2f5e]">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_featured ? 'bg-blue-500' : 'bg-[#2d2f5e]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.is_featured ? 'translate-x-6' : ''}`} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Afficher sur l'accueil</span>
                <input type="checkbox" className="hidden" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-[#2d2f5e]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.is_active ? 'translate-x-6' : ''}`} />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white">Produit Actif</span>
                <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-[#2d2f5e]">
        <button type="button" onClick={onCancel || onSuccess} className="px-6 py-2.5 rounded-xl border border-[#2d2f5e] text-gray-300 hover:bg-[#2d2f5e] transition-colors font-medium">Annuler</button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
          {product ? 'Sauvegarder' : 'Créer le Produit'}
        </button>
      </div>

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onSuccess();
        }}
        onConfirm={() => {
          setShowSuccessModal(false);
        }}
        title="Succès"
        message={product ? "Le produit a été mis à jour avec succès." : "Confirmation d'ajout : Le produit a été créé avec succès."}
        type="success"
        confirmLabel="Parfait"
        cancelLabel="Fermer"
      />
    </form>
  );
};

export default AddProductForm;