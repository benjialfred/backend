import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, message = "Vous devez être connecté pour effectuer cette action." }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-[#111] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-gray-200/50 dark:border-white/10"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">🔒</span>
                        </div>

                        <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Connexion requise</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/login');
                                }}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 hover:border-gray-900 dark:hover:border-white bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-[#111] transition-all group"
                            >
                                <LogIn className="w-6 h-6 text-gray-900 dark:text-white mb-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-gray-900 dark:text-white">Se connecter</span>
                            </button>

                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/register');
                                }}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 transition-all shadow-xl hover:shadow-gray-900/20 dark:hover:shadow-white/20 transform hover:-translate-y-1 hover:scale-[1.02]"
                            >
                                <UserPlus className="w-6 h-6 mb-2" />
                                <span className="font-bold">S'inscrire</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
