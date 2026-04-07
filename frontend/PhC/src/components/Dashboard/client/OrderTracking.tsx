import React from 'react';
import { CheckCircle, Clock, Package, Ruler, Scissors, Truck } from 'lucide-react';

interface OrderTrackingProps {
  status: string;
  production_state?: string;
}

const steps = [
  { id: 'pending', label: 'En attente', icon: Clock },
  { id: 'measurements', label: 'Mesures prises', icon: Ruler },
  { id: 'in_production', label: 'En couture', icon: Scissors },
  { id: 'ready', label: 'Prêt', icon: Package },
  { id: 'shipped', label: 'Expédiée', icon: Truck },
  { id: 'delivered', label: 'Livrée', icon: CheckCircle },
];

export const OrderTracking: React.FC<OrderTrackingProps> = ({ status, production_state }) => {
  const currentStatus = status.toLowerCase();
  const currentState = (production_state || 'not_started').toLowerCase();

  let currentIndex = 0;

  if (currentStatus === 'cancelled') {
      currentIndex = -1;
  } else if (currentStatus === 'delivered') {
      currentIndex = 5;
  } else if (currentStatus === 'shipped') {
      currentIndex = 4;
  } else if (currentStatus === 'paid' || currentStatus === 'confirmed' || currentStatus === 'processing') {
      // Si la commande est en cours de traitement, on regarde l'état de production
      if (currentState === 'ready') currentIndex = 3;
      else if (['cutting', 'sewing', 'fitting', 'in_production'].includes(currentState)) currentIndex = 2;
      else if (currentState === 'measurements_taken') currentIndex = 1;
      else currentIndex = 1; // Default to 'Mesures à prendre' ou 'Confirmée'
  } else {
      currentIndex = 0; // pending
  }

  if (currentStatus === 'cancelled') {
    return (
      <div className="w-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-center">
        <h3 className="text-red-600 font-bold mb-2">Commande Annulée</h3>
        <p className="text-sm text-red-500">Cette commande a été annulée et n'est plus en cours de traitement.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-6">
       <div className="relative flex items-center justify-between">
          {/* bar de progression */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full z-0" />
          
           {/* bar de progression active */}
          <div 
             className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 rounded-full z-0 transition-all duration-1000 ease-in-out" 
             style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
             const Icon = step.icon;
             const isCompleted = index <= currentIndex;
             const isCurrent = index === currentIndex;

             return (
               <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                     isCompleted 
                       ? 'bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white shadow-xl' 
                       : 'bg-[#FAFAFA] dark:bg-[#0A0A0A] text-gray-300 dark:text-gray-600 border border-gray-200 dark:border-white/10'
                  } ${isCurrent ? 'scale-125 ring-4 ring-black/5 dark:ring-white/5' : ''}`}>
                     <Icon className="w-4 h-4" />
                  </div>
                  <div className="absolute top-12 whitespace-nowrap opacity-0 md:opacity-100 md:relative md:top-0 text-center">
                     <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${
                        isCurrent ? 'text-primary-600 dark:text-primary-400' 
                        : isCompleted ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-600'
                     }`}>
                       {step.label}
                     </span>
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};
