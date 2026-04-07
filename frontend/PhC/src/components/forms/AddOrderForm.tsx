import React, { useState } from 'react';
import { Camera, X, ArrowRight } from 'lucide-react';
import { orderAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface AddOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddOrderForm: React.FC<AddOrderFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [measurementsText, setMeasurementsText] = useState('');
  const [measurementsPhoto, setMeasurementsPhoto] = useState('');
  
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMeasurementsPhoto(reader.result as string);
        toast.success("Photo chargée avec succès");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
       setStep(2);
       return;
    }
    setLoading(true);

    try {
      const orderPayload = {
        payment_method: 'cash',
        shipping_method: 'in_store',
        shipping_cost: 0,
        shipping_address: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress
        },
        billing_address: {},
        notes: "Commande effectuée en boutique.",
        items: [
          {
            product_name: productName || "Article Sur-Mesure",
            product_price: parseFloat(productPrice) || 0,
            quantity: parseInt(quantity, 10) || 1,
            custom_notes: measurementsText,
            custom_measurements: measurementsPhoto ? { photo: measurementsPhoto } : {}
          }
        ]
      };

      await orderAPI.create(orderPayload);
      toast.success("Commande enregistrée à la maison.");
      onSuccess();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Erreur lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex bg-white dark:bg-[#0A0A0A] rounded-[2rem] overflow-hidden shadow-2xl relative animate-fade-in-up border border-gray-200 dark:border-white/10 max-h-[90vh]">
      
      {/* LEFT: Split Screen Image (Diagonal/Creative crop effect) */}
      <div className="hidden md:block w-2/5 relative overflow-hidden bg-black isolation-isolate border-r border-gray-200 dark:border-white/10">
         {/* Diagonal clipping wrapper */}
         <div className="absolute inset-0 bg-[#D4AF37]/10 z-10 mix-blend-overlay"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
         <img 
            src="/images/couture-atelier.jpg" 
            alt="Maison Couture Atelier" 
            className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-1000"
            onError={(e) => {
               // Fallback style if image missing
               (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594938298596-03fd62996471?q=80&w=2000&auto=format&fit=crop';
            }}
         />
         <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
            <h3 className="font-serif text-3xl font-black mb-2 leading-tight">L'Excellence du Sur-Mesure</h3>
            <p className="text-gray-300 font-medium text-xs uppercase tracking-widest leading-relaxed">Chaque vêtement est une architecture de tissu.</p>
         </div>
      </div>

      {/* RIGHT: Elegant Form */}
      <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar relative flex flex-col justify-center">
         
         {/* Close Button Top Right */}
         <button type="button" onClick={onCancel} className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
         </button>

         <div className="mb-10 max-w-md">
            <span className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest mb-2 block">Couture Clientèle</span>
            <h2 className="text-3xl font-black font-serif text-gray-900 dark:text-white">Créer une commande</h2>
            <p className="text-gray-500 text-sm mt-2">Enregistrez les informations du client et les spécifications de la pièce.</p>
            
            {/* Minimalist Progress Indicators */}
            <div className="flex gap-2 mt-6">
                <div className={`h-1 flex-1 rounded-full ${step === 1 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-white/10'}`}></div>
                <div className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-white/10'}`}></div>
            </div>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            
            {step === 1 && (
               <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Nom du client</label>
                     <input
                        required
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-2 text-base text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Jean DuPont"
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Téléphone</label>
                     <input
                        required
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-2 text-base text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="+237 600..."
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Adresse de livraison</label>
                     <input
                        required
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-2 text-base text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors"
                        placeholder="Quartier, Ville"
                     />
                  </div>
                  
                  <div className="pt-6">
                     <button type="submit" className="w-full flex items-center justify-between px-6 py-4 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg">
                        <span>Suivant : Détails Vêtement</span>
                        <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Désignation du Vêtement</label>
                     <input
                        required
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-2 text-base text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors font-serif"
                        placeholder="Robe de Soirée Sur-Mesure"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Prix (FCFA)</label>
                         <input
                            required
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-2 text-base text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors"
                            placeholder="0"
                         />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Quantité</label>
                         <input
                            required
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-2 text-base text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors"
                         />
                      </div>
                  </div>

                  <div className="space-y-2 pt-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Mensurations & Notes d'Atelier</label>
                     <textarea
                        rows={3}
                        value={measurementsText}
                        onChange={(e) => setMeasurementsText(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm text-gray-900 dark:text-white focus:border-[#D4AF37] dark:focus:border-[#D4AF37] focus:outline-none transition-colors font-mono"
                        placeholder="Poitrine: 90cm, Taille: 70cm, Tissu soierie rouge..."
                     />
                  </div>

                  {/* Photo Upload Styling */}
                  <div className="pt-2">
                     <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                     <label htmlFor="photo-upload" className="flex items-center gap-4 p-4 border border-dashed border-gray-300 dark:border-white/20 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-colors">
                           <Camera className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Ajouter croquis ou photo</p>
                           <p className="text-xs text-gray-500">Document optionnel pour l'atelier</p>
                        </div>
                        {measurementsPhoto && (
                           <div className="w-12 h-12 rounded border border-gray-200 dark:border-white/20 overflow-hidden">
                              <img src={measurementsPhoto} alt="Preview" className="w-full h-full object-cover" />
                           </div>
                        )}
                     </label>
                  </div>

                  <div className="pt-6 flex gap-3">
                     <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                        Retour
                     </button>
                     <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center px-6 py-4 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-[#b08f2a] transition-colors shadow-[0_10px_20px_rgba(212,175,55,0.3)] disabled:opacity-50">
                        {loading ? 'Validation...' : 'Valider la pièce'}
                     </button>
                  </div>
               </div>
            )}
         </form>

      </div>
    </div>
  );
};

export default AddOrderForm;
