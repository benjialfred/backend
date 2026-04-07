import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Model } from '@/types';
import { modelAPI } from '@/services/api';

interface AddModelFormProps {
    model?: Model | null;
    onSuccess: () => void;
}

const AddModelForm: React.FC<AddModelFormProps> = ({ model, onSuccess }) => {
    const [formData, setFormData] = useState({
        nom: model?.nom || '',
        description: model?.description || '',
        category_id: model?.category_id || 1,
    });

    const [images, setImages] = useState<string[]>(model?.images || []);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (model) {
                await modelAPI.update(model.id, {
                    ...formData,
                    images: images.length > 0 ? images : [],
                });
            } else {
                await modelAPI.create({
                    ...formData,
                    images: images.length > 0 ? images : [],
                });
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving model:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Simuler l'upload d'image et conversion en base64 pour l'instant
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    setImages([...images, reader.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {/* Nom et Catégorie */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du modèle *
                    </label>
                    <input
                        type="text"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="Ex: Robe de soirée Ruby"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catégorie *
                    </label>
                    <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1">Chemises</option>
                        <option value="2">Robes</option>
                        <option value="3">Pantalons</option>
                        <option value="4">Accessoires</option>
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        placeholder="Description détaillée du modèle..."
                    />
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images du modèle (Patrons, Design)
                    </label>
                    <div className="flex flex-wrap gap-4">
                        {images.map((image, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={image}
                                    alt={`Modèle ${index + 1}`}
                                    className="w-32 h-32 object-cover rounded-lg border border-primary-500/50 dark:border-dark-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <label className="cursor-pointer">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-dark-600 dark:text-primary-300">Ajouter</span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="mt-2 text-xs text-dark-600 dark:text-primary-300">
                        Formats acceptés: JPG, PNG. Max 5MB par image.
                    </p>
                </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                    {loading ? (
                        <>Enregistrement...</>
                    ) : (
                        <>{model ? 'Mettre à jour' : 'Créer le modèle'}</>
                    )}
                </button>
            </div>
        </form>
    );
};

export default AddModelForm;
