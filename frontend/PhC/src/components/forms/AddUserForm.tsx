// src/components/forms/AddUserForm.tsx
import React, { useState } from 'react';
import { Camera, User, Mail, Phone, Lock, UserPlus, Save } from 'lucide-react';
import type { User as UserType } from '@/types';
import { userAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

interface AddUserFormProps {
  user?: UserType | null;
  onSuccess: () => void;
}
// ==========================================
// COMPOSANT ADD USER FORM (Formulaire d'Ajout/Modification Utilisateur)
// ==========================================
// Ce composant est réutilisable à la fois pour la CRÉATION et la MODIFICATION (Update)
// d'un utilisateur. La prop 'user' optionnelle détermine le mode de fonctionnement.
const AddUserForm: React.FC<AddUserFormProps> = ({ user, onSuccess }) => {
  // Gestion de l'état local (Local State) avec des valeurs par défaut intelligentes.
  // Si 'user' est fourni, on pré-remplit les champs (Mode Édition).
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    role: user?.role || 'CLIENT',
    photo_profil: user?.photo_profil || '/assets/images/profiles/default.png',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ==========================================
  // LOGIQUE DE VALIDATION
  // ==========================================
  // J'ai implémenté une validation manuelle robuste pour fournir un feedback
  // immédiat à l'utilisateur avant d'envoyer la requête au backend API.
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!user && !formData.password) newErrors.password = 'Le mot de passe est requis';
    if (!user && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // SOUMISSION DU FORMULAIRE
  // ==========================================
  // Fonction asynchrone qui gère intelligemment si on doit appeler l'API
  // de création (POST) ou de mise à jour (PUT/PATCH).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Évite le rechargement brutal de la page (comportement par défaut)

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        role: formData.role,
        photo_profil: formData.photo_profil,
        ...(formData.password && {
          password: formData.password,
          confirm_password: formData.confirmPassword
        }),
      };

      if (user) {
        await userAPI.updateUser(user.id, userData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await userAPI.createUser(userData as any);
        toast.success('Utilisateur créé avec succès');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Submit error:', error);
      let errorMsg = 'Une erreur est survenue';
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (typeof error.response?.data === 'string') {
        errorMsg = error.response.data;
      } else if (typeof error.response?.data === 'object') {
        // Try to find first validation error
        const firstKey = Object.keys(error.response.data)[0];
        if (firstKey) {
          const val = error.response.data[firstKey];
          errorMsg = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
        }
      }

      setErrors({ submit: errorMsg });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GESTION UPLOAD IMAGE (PREVIEW)
  // ==========================================
  // Permet d'afficher un aperçu visuel en base64 de la photo sélectionnée 
  // avant même son enregistrement final.
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData({ ...formData, photo_profil: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const roleColors: Record<string, string> = {
    CLIENT: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    APPRENTI: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    WORKER: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ADMIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="min-h-screen bg-[#141b2d] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {user ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
          </h1>
          <p className="text-gray-400">
            {user
              ? 'Mettez à jour les informations de l\'utilisateur'
              : 'Ajoutez un nouvel utilisateur à la plateforme'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert */}
          {errors.submit && (
            <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-400">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#1f2940] rounded-2xl shadow-lg border border-[#2d2f5e] overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  <div className="w-36 h-36 rounded-full overflow-hidden bg-[#141b2d] border-8 border-[#2d2f5e] shadow-xl">
                    {formData.photo_profil ? (
                      <img
                        src={formData.photo_profil}
                        alt="Photo de profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-20 h-20 text-dark-600 dark:text-primary-300" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-3 right-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <Camera className="w-6 h-6" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  Cliquez sur l'icône pour changer la photo
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#141b2d] border ${errors.nom ? 'border-red-500' : 'border-[#2d2f5e]'
                      } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500`}
                    placeholder="Entrez le nom"
                  />
                  {errors.nom && (
                    <p className="text-sm text-red-400 flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {errors.nom}
                    </p>
                  )}
                </div>

                {/* Prénom */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full px-4 py-3 bg-[#141b2d] border border-[#2d2f5e] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                    placeholder="Entrez le prénom"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-3 bg-[#141b2d] border ${errors.email ? 'border-red-500' : 'border-[#2d2f5e]'
                      } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500`}
                    placeholder="exemple@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400 flex items-center">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-blue-500" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#141b2d] border border-[#2d2f5e] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>

                {/* Rôle */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-300">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Rôle *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-4 py-3 bg-[#141b2d] border border-[#2d2f5e] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="APPRENTI">Apprenti</option>
                      <option value="WORKER">Travailleur</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${roleColors[formData.role]}`}>
                      {formData.role === 'CLIENT' && '👤 Client'}
                      {formData.role === 'APPRENTI' && '🎓 Apprenti'}
                      {formData.role === 'WORKER' && '👷 Travailleur'}
                      {formData.role === 'ADMIN' && '👑 Administrateur'}
                    </span>
                  </div>
                </div>

                {/* Mot de passe (seulement pour création) */}
                {!user && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-300">
                        <Lock className="w-4 h-4 mr-2 text-blue-500" />
                        Mot de passe *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-4 py-3 bg-[#141b2d] border ${errors.password ? 'border-red-500' : 'border-[#2d2f5e]'
                          } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500`}
                        placeholder="Minimum 8 caractères"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-400 flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-dark-600 dark:text-primary-300 mt-1">
                        Utilisez au moins 8 caractères avec lettres et chiffres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-300">
                        <Lock className="w-4 h-4 mr-2 text-blue-500" />
                        Confirmer le mot de passe *
                      </label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-3 bg-[#141b2d] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#2d2f5e]'
                          } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-500`}
                        placeholder="Répétez le mot de passe"
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-400 flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 md:px-8 py-5 bg-[#1f2940] border-t border-[#2d2f5e]">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div>
                  <p className="text-sm text-gray-400">
                    * Champs obligatoires
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={onSuccess}
                    className="px-6 py-3 border border-[#2d2f5e] rounded-xl text-gray-300 font-medium hover:bg-[#2d2f5e] transition-all duration-300 flex items-center"
                  >
                    <span>Annuler</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center shadow-blue-600/30"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        {user ? (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Mettre à jour
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5 mr-2" />
                            Créer l'utilisateur
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-[#1f2940] rounded-2xl shadow-lg border border-[#2d2f5e]">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Conseils</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>Le mot de passe doit contenir au moins 8 caractères</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>Choisissez un rôle adapté aux permissions nécessaires</span>
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>Les administrateurs ont accès à toutes les fonctionnalités</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;