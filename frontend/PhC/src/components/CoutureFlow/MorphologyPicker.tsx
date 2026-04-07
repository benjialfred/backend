import { User, MoveRight } from 'lucide-react';
import type { CoutureProfile } from './types';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    profile: CoutureProfile;
    updateProfile: (updates: Partial<CoutureProfile>) => void;
    onNext: () => void;
    onBack: () => void;
}

const MORPHOLOGIES = [
    { id: 'Elancé', icon: 'I', desc: 'Silhouette fine et longiligne' },
    { id: 'Athlétique', icon: 'V', desc: 'Squelette structuré, carrure large' },
    { id: 'Standard', icon: 'H', desc: 'Proportions équilibrées' },
    { id: 'Corpulence Forte', icon: 'O', desc: 'Silhouette ronde, volume réparti' },
];

const GLOBAL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function MorphologyPicker({ profile, updateProfile, onNext, onBack }: Props) {
    const isComplete = profile.gender && profile.globalSize && profile.morphology;

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6 text-center pt-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2 block">
                    Étape 2 sur 4
                </span>
                <h2 className="text-3xl lg:text-4xl font-black font-serif text-gray-900 dark:text-white mb-4">
                    Le Profil Morphologique
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    Oubliez le ruban à mesurer. Définissez visuellement votre morphologie pour que 
                    notre atelier puisse calibrer votre patron.
                </p>
            </div>

            <div className="flex-1 space-y-10 overflow-y-auto hide-scrollbar pb-10">
                {/* Gender */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
                        1. Catégorie
                    </h3>
                    <div className="flex gap-4">
                        {['Homme', 'Femme'].map((g) => (
                            <button
                                key={g}
                                onClick={() => updateProfile({ gender: g as 'Homme' | 'Femme' })}
                                className={`flex-1 py-4 px-6 rounded-xl border flex items-center justify-center gap-3 font-medium transition-all ${
                                    profile.gender === g
                                    ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-lg'
                                    : 'bg-white dark:bg-black text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                                }`}
                            >
                                <User className="w-5 h-5" /> {g}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {profile.gender && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 40 }}
                            className="overflow-hidden"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4 flex justify-between items-end">
                                <span>2. Taille Habituelle de Confection</span>
                                <span className="text-[10px] text-gray-400 normal-case tracking-normal font-normal">Pour la base du patron</span>
                            </h3>
                            <div className="grid grid-cols-5 gap-3">
                                {GLOBAL_SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => updateProfile({ globalSize: size })}
                                        className={`h-14 rounded-xl border flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                                            profile.globalSize === size 
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 ring-1 ring-primary-500' 
                                            : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-white/30'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {profile.globalSize && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 40 }}
                            className="overflow-hidden"
                        >
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4 flex justify-between items-end">
                                <span>3. Silhouette Naturelle</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {MORPHOLOGIES.map(morph => (
                                    <button
                                        key={morph.id}
                                        onClick={() => updateProfile({ morphology: morph.id })}
                                        className={`flex flex-col items-center text-center p-6 rounded-2xl border transition-all ${
                                            profile.morphology === morph.id
                                            ? 'border-gray-900 bg-gray-50 dark:border-white dark:bg-white/10 ring-1 ring-gray-900 dark:ring-white scale-[1.02]'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                                        }`}
                                    >
                                        {/* Abstract icon for morphology */}
                                        <div className="text-4xl mb-4 font-black text-gray-200 dark:text-gray-800">
                                            {profile.morphology === morph.id ? (
                                                <span className="text-primary-500">{morph.icon}</span>
                                            ) : morph.icon}
                                        </div>
                                        <h4 className={`font-bold mb-1 ${profile.morphology === morph.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {morph.id}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {morph.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Option for people who don't know */}
                            <div className="mt-6 text-center">
                                <button className="text-sm border-b border-gray-400 text-gray-500 hover:text-gray-900 hover:border-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                    Je suis incertain(e) : utiliser l'Assistant Photo / Visio (Optionnel)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <div className="mt-8 flex justify-between items-center bg-white dark:bg-black pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                    onClick={onBack}
                    className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors text-sm"
                >
                    Retour
                </button>
                <button
                    onClick={onNext}
                    disabled={!isComplete}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2 rounded-xl"
                >
                    Continuer <MoveRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
