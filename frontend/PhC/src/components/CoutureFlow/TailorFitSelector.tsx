import { Ruler, Sparkles, MoveHorizontal, Maximize } from 'lucide-react';
import type { CoutureProfile } from './types';

interface Props {
    profile: CoutureProfile;
    updateProfile: (updates: Partial<CoutureProfile>) => void;
    onNext: () => void;
}

const FIT_OPTIONS = [
    {
        id: 'Standard',
        title: 'Coupe Standard Atelier',
        desc: "L'équilibre parfait. Un tombé naturel qui respecte les proportions sans contraindre le mouvement.",
        icon: Ruler,
    },
    {
        id: 'Slim',
        title: 'Ajustement Minimaliste / Slim',
        desc: "Près du corps et moderne. Sculpte la silhouette avec des lignes épurées et structurées.",
        icon: MoveHorizontal,
    },
    {
        id: 'Ample',
        title: 'Ajustement Ample / Relaxed',
        desc: "Fluidité et liberté totale. Pour un style décontracté et une aisance maximale.",
        icon: Maximize,
    },
    {
        id: 'Sur-mesure Premium',
        title: 'Sur-mesure Premium',
        desc: "Recommandé. Laissez-nous sculpter cette pièce pour vous. Analyse poussée de votre profil.",
        icon: Sparkles,
        recommended: true,
    }
];

export default function TailorFitSelector({ profile, updateProfile, onNext }: Props) {
    return (
        <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-8 text-center pt-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2 block">
                    Étape 1 sur 4
                </span>
                <h2 className="text-3xl lg:text-4xl font-black font-serif text-gray-900 dark:text-white mb-4">
                    L'Intention d'Ajustement
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    Comment préférez-vous que votre vêtement réagisse à vos mouvements ? 
                    Choisissez votre style de tombé idéal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {FIT_OPTIONS.map((option) => {
                    const isSelected = profile.fit === option.id;
                    const Icon = option.icon;

                    return (
                        <button
                            key={option.id}
                            onClick={() => updateProfile({ fit: option.id })}
                            className={`relative text-left p-6 md:p-8 rounded-2xl border transition-all duration-300 group ${
                                isSelected
                                    ? 'border-gray-900 bg-gray-50 dark:border-white dark:bg-white/10 ring-1 ring-gray-900 dark:ring-white scale-[1.02]'
                                    : 'border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-50/50 dark:hover:bg-white/5'
                            }`}
                        >
                            {option.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-black text-[10px] items-center gap-1 font-bold uppercase tracking-widest rounded-full whitespace-nowrap flex shadow-xl">
                                    <Sparkles className="w-3 h-3" /> Notre Recommandation
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full flex-shrink-0 transition-colors ${
                                    isSelected 
                                    ? 'bg-black text-white dark:bg-white dark:text-black' 
                                    : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-white/10'
                                }`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold mb-2 transition-colors ${
                                        isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'
                                    }`}>
                                        {option.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {option.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Indicator */}
                            <div className={`absolute top-6 right-6 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'
                            }`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={onNext}
                    className="px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2 rounded-xl"
                >
                    Continuer <MoveHorizontal className="w-5 h-5 ml-2" />
                </button>
            </div>
        </div>
    );
}
