import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultCoutureProfile, type CoutureProfile } from './types';
import type { Product } from '@/types';

import TailorFitSelector from './TailorFitSelector';
import MorphologyPicker from './MorphologyPicker';
import SignaturePersonalization from './SignaturePersonalization';
import AtelierSummaryBlueprint from './AtelierSummaryBlueprint';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    onAddToCart: (customProfile: CoutureProfile) => void;
}

export default function CoutureFlowModal({ isOpen, onClose, product, onAddToCart }: Props) {
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState<CoutureProfile>(defaultCoutureProfile);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            const savedProfile = localStorage.getItem('phc_couture_profile');
            if (savedProfile) {
                try {
                    setProfile(JSON.parse(savedProfile));
                } catch {
                    setProfile(defaultCoutureProfile);
                }
            } else {
                setProfile(defaultCoutureProfile);
            }
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    const handleUpdateProfile = (updates: Partial<CoutureProfile>) => {
        setProfile(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    const handleComplete = async () => {
        setIsAdding(true);
        
        // Sauvegarde intelligente du profil pour les prochaines commandes
        localStorage.setItem('phc_couture_profile', JSON.stringify(profile));
        
        // Simulate a slight delay to give a "premium processing" feel
        await new Promise(resolve => setTimeout(resolve, 800));
        onAddToCart(profile);
        setIsAdding(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="relative w-full max-w-5xl h-full max-h-[900px] bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header Progress Header */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 dark:bg-white/5">
                            <motion.div 
                                className="h-full bg-primary-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((step + 1) / 4) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden p-6 md:p-12 pb-0 flex flex-col">
                            {step === 0 && (
                                <TailorFitSelector 
                                    profile={profile} 
                                    updateProfile={handleUpdateProfile} 
                                    onNext={nextStep} 
                                />
                            )}
                            {step === 1 && (
                                <MorphologyPicker 
                                    profile={profile} 
                                    updateProfile={handleUpdateProfile} 
                                    onNext={nextStep} 
                                    onBack={prevStep} 
                                />
                            )}
                            {step === 2 && (
                                <SignaturePersonalization 
                                    profile={profile} 
                                    updateProfile={handleUpdateProfile} 
                                    onNext={nextStep} 
                                    onBack={prevStep} 
                                />
                            )}
                            {step === 3 && (
                                <AtelierSummaryBlueprint 
                                    profile={profile} 
                                    product={product}
                                    onComplete={handleComplete} 
                                    onBack={prevStep}
                                    isAddingToCart={isAdding}
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
