import { useState } from 'react';
import { Ruler } from 'lucide-react';

const MEASUREMENTS = [
  { id: 'cou', label: 'Tour de Cou', desc: 'Mesurez autour de la base du cou' },
  { id: 'poitrine', label: 'Tour de Poitrine', desc: 'Sous les aisselles, endroit le plus fort' },
  { id: 'taille', label: 'Tour de Taille', desc: 'Creux de la taille, au niveau du nombril' },
  { id: 'bassin', label: 'Tour de Bassin', desc: 'Endroit le plus fort des hanches' },
  { id: 'epaule', label: 'Carrure Épaules', desc: "D'une pointe d'épaule à l'autre" },
  { id: 'manche', label: 'Longueur Manches', desc: "De l'épaule jusqu'au poignet" },
];

export default function MeasurementGuide({ orderData, setOrderData, nextStep }: any) {
  const [guideOpen, setGuideOpen] = useState(false);

  const handleChange = (id: string, value: string) => {
    setOrderData({
      ...orderData,
      measurements: { ...orderData.measurements, [id]: value }
    });
  };

  const isComplete = MEASUREMENTS.every(m => orderData.measurements[m.id]);

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-5xl font-black mb-4">Prise de Mesures</h2>
        <p className="text-gray-500 font-light max-w-lg mx-auto">
          Pour une tombé parfait, veuillez fournir vos mensurations en centimètres (cm).
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <button 
          onClick={() => setGuideOpen(!guideOpen)} 
          className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold border-b-2 border-primary-500 pb-1 hover:text-primary-500 transition-colors"
        >
          <Ruler className="w-4 h-4" />
          {guideOpen ? 'Masquer le Guide' : 'Afficher le Guide Vidéo'}
        </button>
      </div>

      {guideOpen && (
        <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 text-center max-w-2xl mx-auto mb-12">
          <div className="aspect-video bg-black/10 flex items-center justify-center mb-4 text-xs tracking-widest uppercase text-gray-500">
            [ Espace pour vidéo tutoriel ]
          </div>
          <p className="font-light text-sm text-gray-400">Suivez nos instructions pour prendre vos mesures à la maison avec précision.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MEASUREMENTS.map(m => (
          <div key={m.id} className="space-y-2 border-b border-gray-200 dark:border-white/10 pb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 block">{m.label}</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                min="0"
                value={orderData.measurements[m.id] || ''}
                onChange={(e) => handleChange(m.id, e.target.value)}
                className="w-full bg-transparent border-none p-0 text-3xl font-serif focus:ring-0 outline-none placeholder:text-gray-200 dark:placeholder:text-gray-800"
                placeholder="00"
              />
              <span className="text-gray-400 font-serif italic text-xl">cm</span>
            </div>
            <p className="text-[10px] text-gray-400 font-light uppercase tracking-wider">{m.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={nextStep} 
          disabled={!isComplete}
          className="btn-premium px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finaliser la Livraison
        </button>
      </div>
    </div>
  );
}
