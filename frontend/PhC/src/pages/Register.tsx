import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import logo from '@/assets/phc_logo.jpg';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        adresse_livraison: '',
        ville: '',
        pays: 'Cameroun',
        email: '',
        password: '',
        confirm_password: '',
        role: 'CLIENT' as const,
        acceptTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (formData.password !== formData.confirm_password) {
            setError('Les mots de passe ne correspondent pas');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }
        if (!formData.telephone.match(/^[0-9+\s-]{8,}$/)) {
            setError('Numéro de téléphone invalide');
            return false;
        }
        if (!formData.acceptTerms) {
            setError('Veuillez accepter les conditions d\'utilisation');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Include `Role` and everything required by `RegisterFormData`
            await authAPI.register(formData as any);
            toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            navigate('/login');
            
        } catch (err: any) {
            console.error('Registration error:', err);
            
            let message = 'Une erreur est survenue lors de l\'inscription';
            if (err.response?.status === 400) {
                if (err.response.data?.email) {
                    message = 'Cette adresse email est déjà utilisée';
                } else if (err.response.data?.telephone) {
                    message = 'Ce numéro de téléphone est déjà utilisé';
                } else if (typeof err.response.data === 'object') {
                    const firstError = Object.values(err.response.data)[0];
                    if (Array.isArray(firstError)) {
                        message = firstError[0];
                    } else if (typeof firstError === 'string') {
                        message = firstError;
                    }
                }
            } else if (err.message) {
                message = err.message;
            }
            
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 dark:bg-black relative flex transition-colors duration-500 overflow-hidden">
            {/* Left Side Background Image (Fixed/Absolute) */}
            <div className="hidden lg:block absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop" 
                    alt="Mode Haute Couture" 
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/30 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-[20%] w-96 h-96 bg-primary-400/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Right Side Background (Diagonal) */}
            <div 
                className="hidden lg:block absolute inset-y-0 right-0 w-[60%] bg-white dark:bg-[#0a0a0a] z-0 shadow-2xl"
                style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
            />
            
            {/* Left Content */}
            <div className="hidden lg:flex w-[40%] relative z-10 flex-col justify-between p-12 text-white">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
                    <img src={logo} alt="Proph Couture Logo" className="w-12 h-12 object-cover rounded-xl shadow-lg border border-white/10" />
                    <span className="text-2xl font-black tracking-tight">Prophétie Couture</span>
                </Link>
                
                <div className="space-y-6 max-w-lg">
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight text-white/90">
                        Rejoignez<br />l'Élégance
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        Créez votre compte pour accéder à une expérience de mode personnalisée, 
                        sauvegarder vos mesures et suivre vos commandes sur-mesure.
                    </p>
                    
                    <div className="space-y-5 pt-8">
                        {[
                            'Accès exclusif aux collections 2026',
                            'Suivi détaillé de vos commandes',
                            'Profil de mensurations intelligent'
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-white font-bold">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="text-sm text-white/50 font-medium">
                    © 2026 Prophétie Couture - Tous droits réservés
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[60%] relative z-10 flex items-center justify-center p-6 lg:p-12 ml-auto overflow-y-auto bg-white lg:bg-transparent dark:bg-[#0a0a0a] lg:dark:bg-transparent h-screen">
                <div className="max-w-xl w-full py-6">
                    {/* Mobile Header */}
                    <header className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="Proph Couture Logo" className="w-10 h-10 object-cover rounded-lg shadow-md border border-gray-200 dark:border-white/10" />
                            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Proph Couture</span>
                        </Link>
                        <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            Connexion
                        </Link>
                    </header>

                    <div className="mb-6 lg:text-left">
                        <h2 className="text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">Créer un compte</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            Remplissez les informations ci-dessous pour créer votre espace personnel
                        </p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Nom */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Nom <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="nom"
                                        required
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>

                            {/* Prénom */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Prénom <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="prenom"
                                        required
                                        value={formData.prenom}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Adresse email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>

                            {/* Téléphone */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Téléphone <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="telephone"
                                        required
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="+237 6XX XXX XXX"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                Adresse de livraison <span className="text-gray-400 font-normal">(Optionnel)</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="adresse_livraison"
                                    value={formData.adresse_livraison}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                    placeholder="Quartier, Repère..."
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Ville */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Ville
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="ville"
                                        value={formData.ville}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="Ex: Douala"
                                    />
                                </div>
                            </div>
                            
                            {/* Pays */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Pays
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="pays"
                                        value={formData.pays}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="Ex: Cameroun"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Mot de passe */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        minLength={8}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 pl-12 pr-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmer mot de passe */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Confirmer le mot de passe <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirm_password"
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 pl-12 pr-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="flex items-start gap-4 mt-8 ml-1">
                            <div className="flex items-center h-5 mt-0.5">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    id="acceptTerms"
                                    required
                                    checked={formData.acceptTerms}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-gray-900 dark:text-white bg-transparent focus:ring-gray-900 dark:focus:ring-white cursor-pointer"
                                />
                            </div>
                            <label htmlFor="acceptTerms" className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer select-none">
                                J'accepte les <Link to="/terms" className="text-gray-900 dark:text-white hover:underline transition-colors">conditions générales d'utilisation</Link> et la <Link to="/privacy" className="text-gray-900 dark:text-white hover:underline transition-colors">politique de confidentialité</Link>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !formData.acceptTerms}
                            className="w-full py-4 mt-6 bg-primary-500 text-white dark:text-black rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-400 hover:scale-[1.02] transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto relative z-10" />
                            ) : (
                                <span className="relative z-10">Créer mon compte</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 dark:bg-[#0a0a0a] font-medium text-gray-500 dark:text-gray-400">Ou s'inscrire avec</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleLoginButton />
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        Vous avez déjà un compte ?{' '}
                        <Link to="/login" className="text-gray-900 dark:text-white font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;