import { Truck, MapPin, CheckCircle2 } from 'lucide-react';

export default function OrderReview({ orderData, setOrderData, nextStep }: any) {
  const updateContact = (key: string, value: string) => {
    setOrderData({ ...orderData, contact: { ...orderData.contact, [key]: value } });
  };

  const updateShipping = (key: string, value: string) => {
    setOrderData({ ...orderData, shipping: { ...orderData.shipping, [key]: value } });
  };

  const setDeliveryMode = (method: string) => {
    let cost = 0;
    if (method === 'home_standard') cost = 1000;
    if (method === 'home_far') cost = 2000;
    setOrderData({ ...orderData, shipping: { ...orderData.shipping, deliveryMethod: method, shippingCost: cost } });
  };

  const isComplete = orderData.contact.name && orderData.contact.email && orderData.contact.phone && orderData.shipping.address;

  return (
    <div className="space-y-12">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-5xl font-black mb-4">Aperçu & Livraison</h2>
        <p className="text-gray-500 font-light max-w-lg mx-auto">Vérifiez vos choix et indiquez vos coordonnées pour la livraison sécurisée.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Résumé de commande */}
        <div className="bg-gray-50 dark:bg-white/5 p-8 border border-gray-200 dark:border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4 mb-6">Votre Configuration</h3>
          
          <dl className="space-y-4 font-light text-sm">
            <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
              <dt className="text-gray-500">Modèle</dt>
              <dd className="font-bold text-black dark:text-white uppercase tracking-wider">{orderData.modelId ? String(orderData.modelId).replace('prod_', '') : 'Sélectionné'}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
              <dt className="text-gray-500">Matière</dt>
              <dd className="font-bold text-black dark:text-white uppercase tracking-wider">{orderData.fabric}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-200/50 dark:border-white/5 pb-2">
              <dt className="text-gray-500">Couleur</dt>
              <dd className="font-bold text-black dark:text-white uppercase tracking-wider">{orderData.color}</dd>
            </div>
          </dl>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
            <h4 className="text-xs uppercase tracking-widest font-bold text-gray-500 mb-4">Mensurations</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {Object.entries(orderData.measurements).map(([k, v]) => (
                <div key={k} className="flex justify-between p-2 border border-gray-200 dark:border-white/10">
                  <span className="capitalize">{k}</span>
                  <span className="font-bold font-serif">{v as string} cm</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4 mb-6">Informations Client</h3>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Nom complet" 
              value={orderData.contact.name}
              onChange={(e) => updateContact('name', e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-3 text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
            />
            <input 
              type="email" 
              placeholder="Adresse Email" 
              value={orderData.contact.email}
              onChange={(e) => updateContact('email', e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-3 text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
            />
            <input 
              type="tel" 
              placeholder="Téléphone (+237...)" 
              value={orderData.contact.phone}
              onChange={(e) => updateContact('phone', e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-3 text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
            />
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4 mb-6 mt-8">Adresse de Livraison</h3>
          
          <div className="space-y-4">
            <select 
              value={orderData.shipping.city}
              onChange={(e) => updateShipping('city', e.target.value)}
              className="w-full border-b border-gray-300 dark:border-white/20 px-0 py-3 text-sm focus:border-black dark:focus:border-white outline-none transition-colors appearance-none uppercase tracking-widest bg-white dark:bg-black"
            >
              <option value="Douala">Douala</option>
              <option value="Yaoundé">Yaoundé</option>
              <option value="Autre">Autre Ville</option>
            </select>
            <input 
              type="text" 
              placeholder="Adresse complète (Quartier, Repère)" 
              value={orderData.shipping.address}
              onChange={(e) => updateShipping('address', e.target.value)}
              className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-3 text-sm focus:border-black dark:focus:border-white outline-none transition-colors"
            />
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-200 dark:border-white/10 pb-4 mb-6 mt-10">Mode de récupération</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                  onClick={() => setDeliveryMode('home_standard')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${orderData.shipping.deliveryMethod === 'home_standard' ? 'border-black dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-transparent hover:border-gray-300 dark:hover:border-white/30'}`}
              >
                  <div className="flex justify-between items-start mb-3">
                      <Truck className={`w-6 h-6 ${orderData.shipping.deliveryMethod === 'home_standard' ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                      {orderData.shipping.deliveryMethod === 'home_standard' && <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />}
                  </div>
                  <h3 className="font-bold text-black dark:text-white">Livraison Standard</h3>
                  <p className="text-gray-500 text-xs mt-1">À domicile (&lt; 5km)</p>
                  <p className="text-black dark:text-white font-black mt-3">1,000 FCFA</p>
              </div>
              <div 
                  onClick={() => setDeliveryMode('home_far')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${orderData.shipping.deliveryMethod === 'home_far' ? 'border-black dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-transparent hover:border-gray-300 dark:hover:border-white/30'}`}
              >
                  <div className="flex justify-between items-start mb-3">
                      <Truck className={`w-6 h-6 ${orderData.shipping.deliveryMethod === 'home_far' ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                      {orderData.shipping.deliveryMethod === 'home_far' && <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />}
                  </div>
                  <h3 className="font-bold text-black dark:text-white">Livraison Longue Distance</h3>
                  <p className="text-gray-500 text-xs mt-1">À domicile (&gt; 5km)</p>
                  <p className="text-black dark:text-white font-black mt-3">2,000 FCFA</p>
              </div>
              <div 
                  onClick={() => setDeliveryMode('pickup')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${orderData.shipping.deliveryMethod === 'pickup' ? 'border-black dark:border-white bg-gray-50 dark:bg-white/5' : 'border-gray-200/50 dark:border-white/10 bg-transparent hover:border-gray-300 dark:hover:border-white/30'}`}
              >
                  <div className="flex justify-between items-start mb-3">
                      <MapPin className={`w-6 h-6 ${orderData.shipping.deliveryMethod === 'pickup' ? 'text-black dark:text-white' : 'text-gray-400'}`} />
                      {orderData.shipping.deliveryMethod === 'pickup' && <CheckCircle2 className="w-5 h-5 text-black dark:text-white" />}
                  </div>
                  <h3 className="font-bold text-black dark:text-white">Retrait en atelier</h3>
                  <p className="text-gray-500 text-xs mt-1">Passez nous voir !</p>
                  <p className="text-black dark:text-white font-black mt-3">Gratuit</p>
              </div>
          </div>
          
        </div>

      </div>

      <div className="flex justify-center pt-12 border-t border-gray-200 dark:border-white/10">
        <button 
          onClick={nextStep} 
          disabled={!isComplete}
          className="btn-premium px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Procéder au Paiement
        </button>
      </div>
    </div>
  );
}
