import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Ruler, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// simulation de l'appel API
const updateUserMeasurements = async (_userId: string, _measurements: Record<string, string>) => {
  return new Promise((resolve) => setTimeout(resolve, 1500));
};

const defaultMeasurementFields = [
  { id: 'cou', label: 'Tour de Cou', placeholder: 'ex: 40 cm' },
  { id: 'poitrine', label: 'Tour de Poitrine', placeholder: 'ex: 105 cm' },
  { id: 'taille', label: 'Tour de Taille', placeholder: 'ex: 85 cm' },
  { id: 'bassin', label: 'Tour de Bassin', placeholder: 'ex: 110 cm' },
  { id: 'carrure', label: 'Carrure Extrême', placeholder: 'ex: 45 cm' },
  { id: 'epaule', label: 'Longueur d\'Épaule', placeholder: 'ex: 15 cm' },
  { id: 'manche', label: 'Longueur de Manche', placeholder: 'ex: 60 cm' },
  { id: 'poignet', label: 'Tour de Poignet', placeholder: 'ex: 18 cm' },
  { id: 'longueur_totale', label: 'Longueur Totale (Haut)', placeholder: 'ex: 75 cm' },
  { id: 'cuisse', label: 'Tour de Cuisse', placeholder: 'ex: 60 cm' },
  { id: 'mollet', label: 'Tour de Mollet', placeholder: 'ex: 40 cm' },
  { id: 'longueur_pantalon', label: 'Longueur Pantalon', placeholder: 'ex: 105 cm' },
];

const ClientMeasurements = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user?.measurements) {
        // on verifit si les mesures de l'utilissateur sont de type string et on met sous format JSON
        const parsed = typeof user.measurements === 'string' 
            ? JSON.parse(user.measurements) 
            : user.measurements;
        setMeasurements(parsed || {});
    }
  }, [user]);

  const handleChange = (id: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      // on n'utilise pas l'API réel
      // await userAPI.updateProfile(user.id, { measurements });
      await updateUserMeasurements(user.id, measurements);
      updateUser({ ...user, measurements }); // Refresh user state
      toast.success('mesures certifiées et enregistrées.');
    } catch (error) {
      toast.error('Échec lors de l\'enregistrement des mesures.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative z-10 w-full max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white flex items-center gap-3">
               <Ruler className="w-6 h-6 text-primary-500" />
               Mes Mesures
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
               Renseignez vos mesures exactes pour garantir un ajustement sur-mesure parfait.
            </p>
         </div>
      </div>

      <div className="bg-white/90 dark:bg-[#111] backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-white/10 relative overflow-hidden">
        {/* Subtle Decorative Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="mb-8 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-2xl border border-primary-100 dark:border-primary-500/20 flex gap-4 text-primary-800 dark:text-primary-300">
           <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
           <p className="text-sm font-medium">
             Pour un résultat optimal, nous vous recommandons de prendre vos mesures avec l'assistance d'une autre personne. Si vous préférez, vous pouvez vous rendre à l'atelier pour une prise de mesure professionnelle.
           </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultMeasurementFields.map((field, idx) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={field.id} 
                    className="space-y-2"
                 >
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={measurements[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                    />
                 </motion.div>
              ))}
           </div>

           <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-end">
              <button
                 type="submit"
                 disabled={loading}
                 className="flex items-center gap-2 px-8 py-3 bg-primary-500 text-black border border-primary-400 rounded-xl hover:bg-primary-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 font-bold text-xs uppercase tracking-widest shadow-[0_4px_15px_rgba(132,204,22,0.3)]"
              >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                 Enregistrer mes mesures 
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default ClientMeasurements;
