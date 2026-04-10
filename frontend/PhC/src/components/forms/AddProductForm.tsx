
import React, { useState, useEffect } from 'react';
import { X, Plus, Image as ImageIcon, Loader2, Sparkles, Box, Tag, Type, FileText, Layers, Star, Power, ChevronDown, Upload } from 'lucide-react';
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
        category_id: product.category?.toString() || product.category_id?.toString() || '',
        image_principale: product.image_principale || '',
        style: product.style || 'CLASSIC',
        is_featured: product.is_featured,
        is_active: product.is_active,
      });
      if (product.galerie_images && Array.isArray(product.galerie_images)) {
        setImages(product.galerie_images.map((img: any) => typeof img === 'string' ? img : img.image));
      }
    }
  }, [product]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await productAPI.getCategories();
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
        setCategories((data as any).results);
      } else {
        setCategories([]);
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

    if (!formData.nom.trim()) {
      const msg = 'Le nom du produit est requis';
      setError(msg); toast.error(msg); return;
    }
    if (!formData.category_id) {
      const msg = 'Catégorie requise';
      setError(msg); toast.error(msg); return;
    }
    if (!formData.image_principale && !product) {
      const msg = 'Image principale requise';
      setError(msg); toast.error(msg); return;
    }
    if (formData.prix <= 0) {
      const msg = 'Prix invalide';
      setError(msg); toast.error(msg); return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        category_id: Number(formData.category_id),
        prix: Number(formData.prix),
        prix_promotion: formData.prix_promotion ? Number(formData.prix_promotion) : null,
        stock: Number(formData.stock),
        galerie_images: images.length > 0 ? images : [],
      };

      if (product) {
        await productAPI.update(product.id, productData);
      } else {
        await productAPI.create({ ...productData, sku: `PROD-${Date.now()}` });
      }
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Creation error:', error);
      console.error('Creation error response data:', JSON.stringify(error.response?.data));
      
      let errorMsg = 'Erreur lors de la sauvegarde';
      const errData = error.response?.data;

      if (!error.response || error.message === 'Network Error') {
        errorMsg = "Impossible de joindre le serveur. Vérifiez votre connexion.";
      } else if (errData) {
        if (typeof errData === 'string') {
          errorMsg = errData;
        } else if (errData.detail) {
          errorMsg = errData.detail;
        } else if (errData.non_field_errors) {
          errorMsg = Array.isArray(errData.non_field_errors) ? errData.non_field_errors.join(', ') : errData.non_field_errors;
        } else {
          // Extract all field errors
          const fieldErrors = Object.entries(errData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          errorMsg = fieldErrors || JSON.stringify(errData);
        }
      }

      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("L'image doit être < 5MB"); return; }
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

  const styleOptions = [
    { value: 'CLASSIC', label: '👔 Classic' },
    { value: 'MODERN', label: '✨ Modern' },
    { value: 'SPORT', label: '🏃 Sport' },
    { value: 'CASUAL', label: '👕 Casual' },
    { value: 'FORMAL', label: '🎩 Formal' },
  ];

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* ============================================ */}
      {/* STICKY SUBMIT BUTTON - Always visible on top */}
      {/* ============================================ */}
      <div className="sticky top-0 z-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4" style={{ background: 'linear-gradient(to bottom, rgba(10, 10, 30, 0.98) 60%, rgba(10, 10, 30, 0))' }}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 truncate">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #d4af37, #b8860b)' }}>
                {product ? <Sparkles size={16} className="text-black" /> : <Plus size={16} className="text-black" />}
              </div>
              {product ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel || onSuccess}
              className="px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#aaa',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#aaa'; }}
            >
              Annuler
            </button>
            <button
              id="submit-product-btn"
              type="submit"
              disabled={loading}
              className="px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 min-w-[180px]"
              style={{
                background: loading ? '#666' : 'linear-gradient(135deg, #d4af37 0%, #f5d76e 40%, #d4af37 70%, #b8860b 100%)',
                color: '#000',
                boxShadow: loading ? 'none' : '0 0 25px rgba(212, 175, 55, 0.5), 0 4px 15px rgba(0,0,0,0.3)',
                transform: 'scale(1)',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 0 35px rgba(212, 175, 55, 0.7), 0 6px 20px rgba(0,0,0,0.4)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.5), 0 4px 15px rgba(0,0,0,0.3)'; }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Plus size={20} strokeWidth={3} />
                  {product ? 'SAUVEGARDER' : 'AJOUTER LE PRODUIT'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============ ERROR BANNER ============ */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl flex items-start gap-3 animate-fade-in"
          style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
        >
          <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-300 text-sm flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-white transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* FORM CONTENT */}
      {/* ============================================ */}
      <div className="space-y-6">

        {/* ======= SECTION 1: Informations de base ======= */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
              <Type size={14} className="text-blue-400" />
            </div>
            <h4 className="text-blue-400 font-semibold text-sm uppercase tracking-wider">Informations Générales</h4>
          </div>

          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Nom du Produit <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nom}
                  onChange={e => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Robe de Soirée Élégante"
                  className="w-full rounded-xl px-4 py-3.5 text-white text-base placeholder-gray-600 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#d4af37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <Sparkles className="absolute right-4 top-4 text-gray-600 w-5 h-5" />
              </div>
            </div>

            {/* Category + Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Catégorie <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    disabled={categoriesLoading}
                    className="w-full rounded-xl px-4 py-3.5 text-white text-base outline-none transition-all duration-200 appearance-none disabled:opacity-50"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#d4af37'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {categoriesLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Style</label>
                <div className="relative">
                  <select
                    value={formData.style}
                    onChange={e => setFormData({ ...formData, style: e.target.value })}
                    className="w-full rounded-xl px-4 py-3.5 text-white text-base outline-none transition-all duration-200 appearance-none"
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      border: '1.5px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#d4af37'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {styleOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                <FileText size={14} className="inline mr-1" />
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Décrivez votre produit..."
                className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-all duration-200 resize-none"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => { e.target.style.borderColor = '#d4af37'; e.target.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* ======= SECTION 2: Prix & Stock ======= */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <Tag size={14} className="text-emerald-400" />
            </div>
            <h4 className="text-emerald-400 font-semibold text-sm uppercase tracking-wider">Prix & Stock</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Prix (FCFA) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.prix}
                  onChange={e => setFormData({ ...formData, prix: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-base outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <span className="absolute right-4 top-3.5 text-gray-500 text-sm font-medium">FCFA</span>
              </div>
            </div>

            {/* Prix Promo */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Prix Promo</label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.prix_promotion}
                  onChange={e => setFormData({ ...formData, prix_promotion: e.target.value })}
                  placeholder="Optionnel"
                  className="w-full rounded-xl px-4 py-3.5 text-white text-base placeholder-gray-600 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Stock <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.stock}
                  onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl px-4 py-3.5 text-white text-base outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <Box className="absolute right-4 top-4 text-gray-600 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ======= SECTION 3: Images ======= */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
              <ImageIcon size={14} className="text-purple-400" />
            </div>
            <h4 className="text-purple-400 font-semibold text-sm uppercase tracking-wider">Photos du Produit</h4>
          </div>

          {/* Main Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Image Principale <span className="text-red-400">*</span>
            </label>
            <div
              className="w-full rounded-2xl overflow-hidden transition-all duration-300 relative group"
              style={{
                aspectRatio: '16/9',
                background: 'rgba(0,0,0,0.3)',
                border: formData.image_principale ? '2px solid rgba(168, 85, 247, 0.3)' : '2px dashed rgba(255,255,255,0.15)',
              }}
            >
              {formData.image_principale ? (
                <>
                  <img src={formData.image_principale} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_principale: '' })}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
                      style={{ background: 'rgba(239, 68, 68, 0.8)' }}
                    >
                      <X size={16} /> Supprimer
                    </button>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                  {imageUploading ? (
                    <Loader2 className="animate-spin text-purple-400" size={32} />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
                        <Upload size={24} className="text-purple-400" />
                      </div>
                      <span className="text-gray-400 text-sm font-medium">Cliquez pour uploader l'image</span>
                      <span className="text-gray-600 text-xs">PNG, JPG • Max 5MB</span>
                    </>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Galerie (Max 5 images)</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden group"
                  style={{ aspectRatio: '1', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(239, 68, 68, 0.9)' }}
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label
                  className="cursor-pointer rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:bg-white/5"
                  style={{
                    aspectRatio: '1',
                    border: '2px dashed rgba(255,255,255,0.12)',
                  }}
                >
                  <Plus size={20} className="text-gray-500" />
                  <span className="text-gray-600 text-[10px]">Ajouter</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* ======= SECTION 4: Options ======= */}
        <div className="rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.2)' }}>
              <Layers size={14} className="text-amber-400" />
            </div>
            <h4 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Options & Visibilité</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Featured Toggle */}
            <label
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group"
              style={{
                background: formData.is_featured ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0,0,0,0.2)',
                border: formData.is_featured ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-14 h-8 rounded-full p-1 transition-all duration-300 flex-shrink-0"
                style={{
                  background: formData.is_featured
                    ? 'linear-gradient(135deg, #d4af37, #b8860b)'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300"
                  style={{ transform: formData.is_featured ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className={formData.is_featured ? 'text-amber-400' : 'text-gray-500'} />
                  <span className={`text-sm font-medium ${formData.is_featured ? 'text-white' : 'text-gray-400'}`}>
                    Produit Vedette
                  </span>
                </div>
                <span className="text-xs text-gray-500">Affiché sur la page d'accueil</span>
              </div>
              <input type="checkbox" className="hidden" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
            </label>

            {/* Active Toggle */}
            <label
              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group"
              style={{
                background: formData.is_active ? 'rgba(16, 185, 129, 0.08)' : 'rgba(0,0,0,0.2)',
                border: formData.is_active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="w-14 h-8 rounded-full p-1 transition-all duration-300 flex-shrink-0"
                style={{
                  background: formData.is_active
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300"
                  style={{ transform: formData.is_active ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Power size={14} className={formData.is_active ? 'text-emerald-400' : 'text-gray-500'} />
                  <span className={`text-sm font-medium ${formData.is_active ? 'text-white' : 'text-gray-400'}`}>
                    Produit Actif
                  </span>
                </div>
                <span className="text-xs text-gray-500">Visible dans le catalogue</span>
              </div>
              <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
            </label>
          </div>
        </div>

        {/* ======= BOTTOM SUBMIT BUTTON (duplicate for mobile users) ======= */}
        <div className="pt-4 pb-2">
          <button
            id="submit-product-btn-bottom"
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-3"
            style={{
              background: loading ? '#444' : 'linear-gradient(135deg, #d4af37 0%, #f5d76e 30%, #d4af37 60%, #b8860b 100%)',
              color: '#000',
              boxShadow: loading ? 'none' : '0 0 30px rgba(212, 175, 55, 0.4), 0 6px 20px rgba(0,0,0,0.3)',
              letterSpacing: '1px',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 45px rgba(212, 175, 55, 0.6), 0 8px 25px rgba(0,0,0,0.4)'; } }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4), 0 6px 20px rgba(0,0,0,0.3)'; }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Plus size={22} strokeWidth={3} />
                {product ? 'SAUVEGARDER LES MODIFICATIONS' : '✨ AJOUTER LE PRODUIT ✨'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal */}
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