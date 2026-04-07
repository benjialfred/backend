import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { authAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import logo from '@/assets/phc_logo.jpg';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const loginPayload: any = {
                email: formData.email,
                password: formData.password
            };

            if (showTwoFactor && otp) {
                loginPayload.otp = otp;
            }

            const response: any = await authAPI.login(loginPayload);

            if (response['2fa_required']) {
                setShowTwoFactor(true);
                setLoading(false);
                toast('Veuillez entrer votre code A2F', { icon: '🔐' });
                return;
            }

            if (response.user?.role && ['ADMIN', 'SUPER_ADMIN'].includes(response.user.role)) {
                toast.error("Accès Réservé. Veuillez utiliser le Portail Administrateur.");
                navigate('/admin/login');
                return;
            }

            localStorage.setItem('access_token', response.token);
            if (response.refresh) {
                localStorage.setItem('refresh_token', response.refresh);
            }
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                toast.success(`Bienvenue, ${response.user.prenom || response.user.nom} !`);
            } else {
                toast.success(`Bienvenue !`);
            }
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            let message = 'Email ou mot de passe incorrect';

            if (showTwoFactor && err.response?.status === 400 && err.response?.data?.error) {
                message = err.response.data.error;
            } else if (err.response?.status === 403) {
                message = err.response.data?.detail || 'Compte désactivé ou temporairement bloqué';
            } else if (err.response?.status === 401) {
                message = 'Email ou mot de passe incorrect';
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
                    src="@/assets/login-image.png" 
                    alt="Mode Haute Couture" 
                    className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/30 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-[20%] w-96 h-96 bg-primary-400/20 rounded-full blur-[100px]"></div>
            </div>

            {/* Right Side Background (Diagonal) */}
            <div 
                className="hidden lg:block absolute inset-y-0 right-0 w-[60%] bg-white dark:bg-[#0a0a0a] z-0"
                style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
            />

            {/* Left Content */}
            <div className="hidden lg:flex w-[40%] relative z-10 flex-col justify-between p-12 text-white">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit">
                    <img src={logo} alt="Proph Couture Logo" className="w-12 h-12 object-cover rounded-xl shadow-lg border border-white/10" />
                    <span className="text-2xl font-black tracking-tight">Prophétie Couture</span>
                </Link>
                
                <div className="space-y-6 max-w-lg">
                    <h1 className="text-6xl font-black tracking-tight mb-4 leading-tight text-white/90">
                        Bienvenue.<br />À nouveau.
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        Accédez à votre espace personnel pour personnaliser votre expérience sur-mesure.
                    </p>
                    
                    <div className="flex items-center gap-4 pt-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                            <span className="text-xl">✨</span>
                        </div>
                        <div>
                            <p className="font-bold text-white/90 text-lg">Nouvelle Collection</p>
                            <p className="text-sm text-white/70">La Couture est un Art</p>
                        </div>
                    </div>
                </div>
                
                <div className="text-sm text-white/50 font-medium">
                    © 2026 Prophétie Couture - L'élégance absolue
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-[60%] relative z-10 flex items-center justify-center p-6 lg:p-12 ml-auto bg-white lg:bg-transparent dark:bg-[#0a0a0a] lg:dark:bg-transparent">
                <div className="max-w-md w-full">
                    {/* Mobile Header */}
                    <header className="lg:hidden flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-white/10">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="Proph Couture Logo" className="w-10 h-10 object-cover rounded-lg shadow-md border border-gray-200 dark:border-white/10" />
                            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Prophétie Couture</span>
                        </Link>
                        <Link to="/register" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            S'inscrire
                        </Link>
                    </header>

                    <div className="mb-6">
                        <h2 className="text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
                            {showTwoFactor ? 'Sécurité' : 'Connexion'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            {showTwoFactor
                                ? 'Entrez le code à 6 chiffres de votre application'
                                : 'Connectez-vous à votre compte premium'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!showTwoFactor ? (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-1.5 ml-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            Mot de passe
                                        </label>
                                        <Link 
                                            to="/forgot-password" 
                                            className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            Oublié ?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-5 py-4 pl-12 pr-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 ml-1">
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-white/20 text-gray-900 dark:text-white bg-transparent focus:ring-gray-900 dark:focus:ring-white cursor-pointer"
                                    />
                                    <label htmlFor="rememberMe" className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                        Se souvenir de moi
                                    </label>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Code d'authentification
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-lg font-mono tracking-[0.5em] text-center text-gray-900 dark:text-white"
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTwoFactor(false)}
                                    className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white mt-4 transition-colors"
                                >
                                    ← Annuler
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-6 bg-primary-500 text-white dark:text-black rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-400 hover:scale-[1.02] transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 rounded-2xl" />
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto relative z-10" />
                            ) : (
                                <span className="relative z-10">{showTwoFactor ? 'Vérifier' : 'Se connecter'}</span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200 dark:border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-50 dark:bg-[#0a0a0a] font-medium text-gray-500 dark:text-gray-400">Ou continuer avec</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <GoogleLoginButton />
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nouveau client ?{' '}
                        <Link to="/register" className="text-gray-900 dark:text-white font-bold hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;