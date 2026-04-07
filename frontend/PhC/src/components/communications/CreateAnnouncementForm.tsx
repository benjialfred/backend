import React, { useState } from 'react';
import { announcementAPI } from '@/services/api';
import { Send, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateAnnouncementFormProps {
    onSuccess?: () => void;
}

const CreateAnnouncementForm: React.FC<CreateAnnouncementFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        target_role: 'ALL',
        is_public: false,
        expires_at: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.content.trim()) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        try {
            setLoading(true);
            await announcementAPI.create({
                ...formData,
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
            });
            toast.success('Annonce publiée avec succès !');
            setFormData({
                title: '',
                content: '',
                target_role: 'ALL',
                is_public: false,
                expires_at: ''
            });
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Erreur lors de la publication:', error);
            toast.error('Impossible de publier l\'annonce');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <div className="bg-[#1f2940] p-6 rounded-xl shadow-lg border border-[#2d2f5e]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-500" />
                Nouvelle Annonce
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Titre
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg bg-[#141b2d] border border-[#2d2f5e] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                        placeholder="Titre de l'annonce"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Contenu
                    </label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg bg-[#141b2d] border border-[#2d2f5e] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none placeholder-gray-500"
                        placeholder="Écrivez votre message ici..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Destinataire (Cible)
                        </label>
                        <select
                            name="target_role"
                            value={formData.target_role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-[#141b2d] border border-[#2d2f5e] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="ALL">Tout le monde</option>
                            <option value="WORKER">Employés uniquement</option>
                            <option value="APPRENTI">Apprentis uniquement</option>
                            <option value="CLIENT">Clients uniquement</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                            Expire le (optionnel)
                        </label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                name="expires_at"
                                value={formData.expires_at}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg bg-[#141b2d] border border-[#2d2f5e] text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-600 dark:text-primary-300 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 bg-[#141b2d] border-[#2d2f5e] rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-400">Rendre public (visible sans connexion)</span>
                    </label>
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-all ${loading
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg shadow-blue-600/30'
                            }`}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Publication...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Publier</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAnnouncementForm;
