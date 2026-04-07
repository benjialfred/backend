import { ShoppingBag, ShieldCheck, FileCheck2 } from 'lucide-react';
import type { CoutureProfile } from './types';
import type { Product } from '@/types';

interface Props {
    profile: CoutureProfile;
    product: Product;
    onComplete: () => void;
    onBack: () => void;
    isAddingToCart: boolean;
}

export default function AtelierSummaryBlueprint({ profile, product, onComplete, onBack, isAddingToCart }: Props) {
    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-8 text-center pt-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-2 block flex items-center justify-center gap-2">
                    <FileCheck2 className="w-4 h-4" /> Fiche Atelier Prête
                </span>
                <h2 className="text-3xl lg:text-4xl font-black font-serif text-gray-900 dark:text-white mb-4">
                    Validation de votre Coupe
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                    Votre profil a été modélisé. Avant la coupe du tissu, l'un de nos maîtres tailleurs vérifiera 
                    personnellement ces données pour s'assurer du tombé parfait de votre vêtement.
                </p>
            </div>

            {/* Fiche Blueprint */}
            <div className="flex-1 w-full max-w-2xl mx-auto">
                <div className="relative p-8 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden group">
                    {/* Background Blueprint styling */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                         style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                    />
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start border-b border-gray-200 dark:border-white/10 pb-8 mb-8">
                        {/* Product Mini Preview */}
                        <div className="w-24 h-32 bg-gray-100 dark:bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image_principale || (product.images && product.images[0]) ? (
                                <img 
                                    src={product.image_principale || (product.images && product.images[0] ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any).image) : '')} 
                                    alt={product.nom} 
                                    className="w-full h-full object-cover grayscale brightness-110 contrast-125 dark:brightness-90 opacity-80" 
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 dark:bg-zinc-800" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-serif font-black text-2xl mb-1 text-gray-900 dark:text-white">{product.nom}</h3>
                            <p className="text-sm uppercase tracking-widest text-primary-500 font-bold mb-4">Édition Personnalisée</p>
                            
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider mb-1">Ajustement</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{profile.fit}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider mb-1">Base Patronale</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{profile.gender} - {profile.globalSize}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider mb-1">Morphologie Initiale</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{profile.morphology}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-6 text-sm mb-6">
                        <div>
                            <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider mb-1">Col</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span> {profile.collarType}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 dark:text-gray-500 block text-xs uppercase tracking-wider mb-1">Ajustement Longueur</span>
                            <span className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></span> {profile.lengthAdjustment}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl flex items-start gap-3 mt-4 border border-green-200 dark:border-green-500/20">
                        <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold text-green-900 dark:text-green-300">Garantie Ajustement Parfait</h4>
                            <p className="text-xs text-green-700 dark:text-green-400/80 mt-1">Si la pièce finale nécessite une retouche mineure, nos ateliers partenaires la prennent en charge gratuitement sous 14 jours.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-between items-center bg-white dark:bg-black pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                    onClick={onBack}
                    className="px-6 py-4 text-gray-500 font-bold uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors text-sm"
                >
                    Modifier le profil
                </button>
                <button
                    onClick={onComplete}
                    disabled={isAddingToCart}
                    className="px-8 py-4 bg-primary-500 text-black font-black uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.3)] min-w-[240px] flex items-center justify-center gap-2 rounded-xl disabled:opacity-70 disabled:cursor-wait hover:scale-105 active:scale-95 duration-200"
                >
                    {isAddingToCart ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            Validation...
                        </div>
                    ) : (
                        <>
                            <ShoppingBag className="w-5 h-5" /> Adjoindre au panier
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
