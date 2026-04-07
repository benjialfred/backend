import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { authAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
 // Make sure this import exists or use a text logo

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.login(formData);

            // Check if user is actually an ADMIN
            if (response.user.role !== 'ADMIN' && response.user.role !== 'SUPER_ADMIN') {
                throw new Error("Accès refusé : Ce compte n'a pas les privilèges administrateur.");
            }

            localStorage.setItem('access_token', response.token);
            if (response.refresh) localStorage.setItem('refresh_token', response.refresh);
            localStorage.setItem('user', JSON.stringify(response.user));

            toast.success(`Bienvenue Administrateur ${response.user.prenom || ''}`);
            navigate('/dashboard');

        } catch (err: any) {
            console.error('Admin Login Error:', err);
            let message = 'Identifiants invalides';
            if (err.message && err.message.includes('Accès refusé')) {
                message = err.message;
            } else if (err.response?.status === 403) {
                message = "Accès interdit.";
            }
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0f172a]">
            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 to-[#1a1c4b]">
                {/* Background Sparkles/Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
                    <div className="absolute bottom-20 right-20 w-3 h-3 bg-primary-500 rounded-full animate-pulse opacity-50"></div>
                    <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-bounce delay-700"></div>
                </div>

                {/* Decorative Pattern - Sequin feel */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-center">
                    <div className="mb-8 p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
                        <Shield className="w-20 h-20 text-primary-500" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
                        Espace <span className="text-primary-500">Administrateur</span>
                    </h1>
                    <p className="text-blue-200 text-xl max-w-md leading-relaxed">
                        Gérez votre atelier, vos commandes et vos clients depuis une interface sécurisée et dédiée.
                    </p>
                </div>

                {/* Bottom Gradient for separation */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Mobile Background styling */}
                <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-blue-900 via-[#0f172a] to-black z-0"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center lg:justify-start gap-3">
                            <Lock className="w-8 h-8 text-primary-500" />
                            Connexion Sécurisée
                        </h2>
                        <p className="text-gray-400">Entrez vos identifiants pour accéder au panel.</p>
                    </div>

                    <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-primary-900/30 p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center gap-3 animate-pulse">
                                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-red-400 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-600 dark:text-primary-300 group-focus-within:text-primary-400 transition-colors">
                                        <Shield className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none placeholder-gray-600"
                                        placeholder="admin@phc.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Code d'accès</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-600 dark:text-primary-300 group-focus-within:text-primary-400 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-[#0f172a] border border-gray-700 rounded-xl text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none placeholder-gray-600"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-primary-900/40 hover:shadow-primary-900/60 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Connexion...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Accéder au Dashboard</span>
                                        <Sparkles className="w-5 h-5 text-yellow-300" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-dark-600 dark:text-primary-300 text-xs uppercase tracking-widest">
                            Système Sécurisé ProphCouture v2.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
