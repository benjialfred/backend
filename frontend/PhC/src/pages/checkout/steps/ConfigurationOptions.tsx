
const FABRICS = [
  { id: 'soie', name: 'Soie Royale', desc: 'Légèreté et brillance absolue' },
  { id: 'lin', name: 'Lin Premium', desc: 'Respirant, élégance naturelle' },
  { id: 'velours', name: 'Velours Côtelé', desc: 'Texture profonde, luxe hivernal' },
  { id: 'ndop', name: 'Ndop Traditionnel', desc: 'Héritage authentique, coton tissé' }
];

const COLORS = [
  { id: 'noir', name: 'Noir Profond', hex: '#0a0a0a' },
  { id: 'ivoire', name: 'Ivoire', hex: '#fcfbf8' },
  { id: 'or', name: 'Or Subtil', hex: '#c29d5b' },
  { id: 'emeraude', name: 'Vert Émeraude', hex: '#059669' },
  { id: 'bleu_roi', name: 'Bleu Royal', hex: '#1e3a8a' }
];

export default function ConfigurationOptions({ orderData, setOrderData, nextStep }: any) {
  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-5xl font-black mb-4">Configuration</h2>
        <p className="text-gray-500 font-light max-w-lg mx-auto">Personnalisez les matières et teintes pour une pièce unique.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Tissus */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4">1. Choix du Tissu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FABRICS.map(f => (
              <div 
                key={f.id}
                onClick={() => setOrderData({ ...orderData, fabric: f.id })}
                className={`p-4 border cursor-pointer transition-all duration-300 ${orderData.fabric === f.id ? 'border-primary-500 bg-gray-50 dark:bg-white/5 shadow-inner' : 'border-gray-200 dark:border-white/10 hover:border-gray-400'}`}
              >
                <div className="font-serif font-bold text-lg">{f.name}</div>
                <div className="text-xs text-gray-500 mt-1 font-light">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Couleurs */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4">2. Choix de la Couleur</h3>
          <div className="grid grid-cols-5 gap-4">
            {COLORS.map(c => (
              <div key={c.id} className="flex flex-col items-center gap-2">
                <div 
                  onClick={() => setOrderData({ ...orderData, color: c.id })}
                  className={`w-12 h-12 rounded-full cursor-pointer transition-all ${orderData.color === c.id ? 'ring-4 ring-offset-4 ring-primary-500 scale-110' : 'hover:scale-105 border border-gray-200'}`}
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] uppercase font-bold text-center tracking-wider">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-widest">Détails stylistiques (Optionnel)</h3>
        <textarea 
          rows={4}
          value={orderData.styleNotes}
          onChange={(e) => setOrderData({ ...orderData, styleNotes: e.target.value })}
          placeholder="Ex: Forme du col, préférences de boutons, coupe cintrée..."
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 focus:ring-1 focus:ring-primary-500 outline-none text-sm font-light resize-none"
        />
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={nextStep} 
          disabled={!orderData.fabric || !orderData.color}
          className="btn-premium px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Saisir mes Mensurations
        </button>
      </div>
    </div>
  );
}
