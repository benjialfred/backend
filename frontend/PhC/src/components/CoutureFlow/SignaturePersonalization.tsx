import { MoveRight } from 'lucide-react';
import type { CoutureProfile } from './types';

interface Props {
    profile: CoutureProfile;
    updateProfile: (updates: Partial<CoutureProfile>) => void;
    onNext: () => void;
    onBack: () => void;
}

const LENGTH_OPTIONS = ['Standard', 'Manches plus longues', 'Manches plus courtes (+ dégagées)', 'Bas rallongé'];
const COLLAR_OPTIONS = ['Classique', 'Mao (Rond)', 'En V profond', 'Officier'];

export default function SignaturePersonalization({ profile, updateProfile, onNext, onBack }: Props) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-6 text-center pt-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2 block">
                    Étape 3 sur 4
                </span>
                <h2 className="text-3xl lg:text-4xl font-black font-serif text-gray-900 dark:text-white mb-4">
                    La Signature Atelier
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    Apportez les derniers ajustements pour que cette pièce reflète 
                    votre sens du détail.
                </p>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto hide-scrollbar pb-10 px-1">
                
                {/* Length */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
                        Ajustement des Longueurs
                    </h3>
                    <div className="space-y-3">
                        {LENGTH_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => updateProfile({ lengthAdjustment: opt })}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                    profile.lengthAdjustment === opt
                                    ? 'border-black bg-gray-50 dark:border-white dark:bg-white/10 ring-1 ring-black dark:ring-white'
                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <span className={`font-medium ${profile.lengthAdjustment === opt ? 'text-black dark:text-white font-bold' : ''}`}>
                                    {opt}
                                </span>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                    profile.lengthAdjustment === opt ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                    {profile.lengthAdjustment === opt && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Collar */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">
                        Style du Col
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {COLLAR_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => updateProfile({ collarType: opt })}
                                className={`p-4 rounded-xl border text-center transition-all ${
                                    profile.collarType === opt
                                    ? 'border-black bg-gray-50 dark:border-white dark:bg-white/10 ring-1 ring-black dark:ring-white font-bold text-black dark:text-white'
                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 text-gray-600 dark:text-gray-400 font-medium'
                                }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

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
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2 rounded-xl"
                >
                    Étape Finale <MoveRight className="w-5 h-5 ml-2" />
                </button>
            </div>
        </div>
    );
}
