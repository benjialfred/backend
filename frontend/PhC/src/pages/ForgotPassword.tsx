import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import logo from '@/assets/phc_logo.jpg';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword({ email });
            toast.success('Code de vérification envoyé par email !');
            setStep(2);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            const message = err.response?.data?.detail || 'Une erreur est survenue. Veuillez réessayer.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.verifyOTP({ email, otp });
            toast.success('Code vérifié !');
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Code invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        setLoading(true);
        setError('');

        try {
            await authAPI.resetPassword({ email, otp, new_password: newPassword });
            toast.success('Mot de passe mis à jour avec succès !');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
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
                    <h1 className="text-6xl font-black tracking-tight mb-4 leading-tight text-white/90">
                        Récupération.<br />Sécurisée.
                    </h1>
                    <p className="text-xl text-white/80 leading-relaxed font-medium">
                        Redéfinissez votre accès à l'expérience sur-mesure de Prophétie Couture.
                    </p>
                    
                    <div className="flex items-center gap-4 pt-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white/90 text-lg">Confidentialité Garantie</p>
                            <p className="text-sm text-white/70">Vos données sont entre de bonnes mains</p>
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
                        <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                            Connexion
                        </Link>
                    </header>

                    <div className="mb-6">
                        <h2 className="text-4xl font-black tracking-tight mb-3 text-gray-900 dark:text-white">
                            Mot de passe oublié
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                            {step === 1 && "Entrez votre adresse email de récupération"}
                            {step === 2 && "Entrez le code de vérification reçu par email"}
                            {step === 3 && "Veuillez créer un nouveau mot de passe"}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendEmail} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Adresse email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-4 mt-6 bg-primary-500 text-white dark:text-black rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-400 hover:scale-[1.02] transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto relative z-10" />
                                ) : (
                                    <span className="relative z-10">Envoyer le code</span>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Code de vérification
                                </label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-5 py-4 pl-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-lg font-mono tracking-[0.5em] text-center text-gray-900 dark:text-white"
                                        placeholder="000000"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full py-4 mt-6 bg-primary-500 text-white dark:text-black rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-400 hover:scale-[1.02] transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto relative z-10" />
                                ) : (
                                    <span className="relative z-10">Vérifier le code</span>
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    ← Modifier l'email
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
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

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-5 py-4 pl-12 pr-12 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-sm font-medium text-gray-900 dark:text-white"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword || newPassword !== confirmPassword}
                                className="w-full py-4 mt-6 bg-primary-500 text-white dark:text-black rounded-2xl font-bold hover:bg-primary-600 dark:hover:bg-primary-400 hover:scale-[1.02] transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto relative z-10" />
                                ) : (
                                    <span className="relative z-10">Mettre à jour</span>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                        <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            Je me souviens de mon mot de passe.{' '}
                            <Link to="/login" className="text-gray-900 dark:text-white font-bold hover:underline">
                                Me connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
