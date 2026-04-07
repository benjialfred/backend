import { useState, useEffect } from 'react';
import { productAPI } from '@/services/api';

export default function SelectionProduct({ orderData, setOrderData, nextStep }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll({ category: 'sur-mesure' });
        if (response && response.results) {
          setProducts(response.results);
        } else if (Array.isArray(response)) {
          setProducts(response);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSelect = (id: string) => {
    setOrderData({ ...orderData, modelId: id });
  };

  if (loading) return <div className="py-20 text-center uppercase tracking-widest text-sm text-gray-400">Chargement des modèles...</div>;

  return (
    <div className="space-y-10">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-5xl font-black mb-4">Sélection du Modèle</h2>
        <p className="text-gray-500 font-light max-w-lg mx-auto">Choisissez la pièce maîtresse qui servira de base à votre création sur-mesure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((p) => (
          <div 
            key={p.id} 
            onClick={() => handleSelect(p.id)}
            className={`group relative cursor-pointer border transition-all duration-500 hover:shadow-2xl ${orderData.modelId === p.id ? 'border-primary-500 shadow-xl scale-[1.02]' : 'border-gray-200 dark:border-white/10'}`}
          >
            <div className="aspect-3/4 overflow-hidden bg-gray-50 dark:bg-white/5 relative">
              <img src={p.image_principale} alt={p.nom} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {orderData.modelId === p.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                  <span className="text-white font-bold uppercase tracking-widest text-sm border border-white px-6 py-2">Sélectionné</span>
                </div>
              )}
            </div>
            <div className="p-6 text-center">
              <h3 className="font-serif font-bold text-lg mb-2">{p.nom}</h3>
              <p className="text-sm font-bold text-gray-500">À partir de {p.prix?.toLocaleString()} FCFA</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={nextStep} 
          disabled={!orderData.modelId}
          className="btn-premium px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Configurer les Détails
        </button>
      </div>
    </div>
  );
}
