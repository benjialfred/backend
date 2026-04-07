import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '@/services/api';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function PaymentValidation({ orderData }: any) {
  const [method, setMethod] = useState<'orange_money'|'mtn_money'|'card'|'cash'>('orange_money');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Create backend payload matching Django API
      const payload = {
        items: [{
          product: orderData.modelId, // UUID
          quantity: 1,
          custom_measurements: orderData.measurements,
          custom_notes: `Fabric: ${orderData.fabric}, Color: ${orderData.color}. ${orderData.styleNotes}`
        }],
        shipping_address: {
          address: orderData.shipping.address,
          city: orderData.shipping.city,
          instruction: ''
        },
        billing_address: {
          address: orderData.shipping.address,
          city: orderData.shipping.city
        },
        shipping_method: orderData.shipping.deliveryMethod.startsWith('home') ? 'home' : orderData.shipping.deliveryMethod,
        shipping_cost: orderData.shipping.shippingCost,
        payment_method: method === 'cash' ? 'cash' : 'nelsius',
        notes: `Client: ${orderData.contact.name} | Phone: ${orderData.contact.phone} | Email: ${orderData.contact.email}`
      };

      const orderResponse = await orderAPI.create(payload);

      if (method === 'cash') {
        navigate(`/payment/success?order=${orderResponse.order_number}`);
      } else {
        const paymentResponse = await orderAPI.initiatePayment(orderResponse.order_number, {
          payment_method: 'nelsius',
          phone: orderData.contact.phone
        });

        if (paymentResponse.success && paymentResponse.payment_url) {
          window.location.href = paymentResponse.payment_url;
        } else {
          throw new Error("Erreur lors de l'initialisation du paiement sécurisé.");
        }
      }
    } catch (error: any) {
      console.error(error);
      alert(`Une erreur est survenue: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl md:text-5xl font-black mb-4">Paiement Sécurisé</h2>
        <p className="text-gray-500 font-light max-w-lg mx-auto">Validez votre commande sur-mesure de manière instantanée et sécurisée.</p>
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] tracking-widest uppercase font-bold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          Cryptage SSL 256-bit
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'orange_money', label: 'Orange Money', desc: 'Paiement mobile' },
          { id: 'mtn_money', label: 'MTN Mobile Money', desc: 'Paiement mobile' },
          { id: 'card', label: 'Carte Bancaire', desc: 'Visa, Mastercard' },
          { id: 'cash', label: orderData.shipping.deliveryMethod === 'pickup' ? 'Règlement en Atelier' : 'À la Livraison', desc: orderData.shipping.deliveryMethod === 'pickup' ? 'Réglez sur place lors du retrait' : 'Règlement en mains propres' }
        ].map((m) => (
          <div 
            key={m.id}
            onClick={() => setMethod(m.id as any)}
            className={`p-6 border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-300 ${method === m.id ? 'border-primary-500 bg-gray-50 dark:bg-white/5 ring-1 ring-primary-500 shadow-xl' : 'border-gray-200 dark:border-white/10 hover:border-gray-400'}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 mb-2 ${method === m.id ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`} />
            <h4 className="font-bold uppercase tracking-wider text-sm text-center">{m.label}</h4>
            <span className="text-xs text-gray-500 font-light text-center">{m.desc}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-12 border-t border-gray-200 dark:border-white/10">
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="btn-premium px-12 py-5 w-full md:w-auto flex items-center justify-center gap-3 shadow-2xl"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours...</>
          ) : (
            'Payer la Commande'
          )}
        </button>
      </div>

      <p className="text-center text-[10px] uppercase tracking-widest text-gray-400 mt-8">
        En confirmant, vous acceptez les conditions générales de vente sur-mesure de Prophétie Couture.
      </p>
    </div>
  );
}
