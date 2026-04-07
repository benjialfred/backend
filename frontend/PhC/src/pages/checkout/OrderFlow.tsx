import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/layout/Footer';

// Steps imports
import SelectionProduct from './steps/SelectionProduct';
import ConfigurationOptions from './steps/ConfigurationOptions';
import MeasurementGuide from './steps/MeasurementGuide';
import OrderReview from './steps/OrderReview';
import PaymentValidation from './steps/PaymentValidation';

export type OrderData = {
  modelId: string | null;
  fabric: string;
  color: string;
  styleNotes: string;
  measurements: Record<string, string>;
  contact: { email: string; phone: string; name: string };
  shipping: { address: string; city: string; deliveryMethod: string; shippingCost: number };
};

const STEPS = [
  { id: 1, name: 'Modèle' },
  { id: 2, name: 'Configuration' },
  { id: 3, name: 'Mesures' },
  { id: 4, name: 'Aperçu & Livraison' },
  { id: 5, name: 'Paiement' }
];

export default function OrderFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    modelId: null,
    fabric: '',
    color: '',
    styleNotes: '',
    measurements: {},
    contact: { email: '', phone: '', name: '' },
    shipping: { address: '', city: 'Douala', deliveryMethod: 'home_standard', shippingCost: 1000 },
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black text-black dark:text-white font-sans transition-colors duration-500 pt-24 pb-20">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => currentStep === 1 ? navigate('/products') : prevStep()} 
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-2xl font-serif font-black tracking-widest uppercase">Sur-Mesure</h1>
        </div>

        {/* Custom Progress Bar */}
        <div className="mb-16 hidden md:block">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-white/10 w-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-px bg-black dark:bg-white z-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" 
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            ></div>
            
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-3 bg-[#FAFAFA] dark:bg-black px-4">
                <div className={`w-3 h-3 rounded-full transition-all duration-500 ${currentStep >= step.id ? 'bg-black dark:bg-white scale-125' : 'bg-gray-300 dark:bg-white/20'}`}></div>
                <span className={`text-xs font-bold uppercase tracking-widest ${currentStep >= step.id ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/5 p-6 md:p-12 shadow-2xl"
            >
              {currentStep === 1 && <SelectionProduct orderData={orderData} setOrderData={setOrderData} nextStep={nextStep} />}
              {currentStep === 2 && <ConfigurationOptions orderData={orderData} setOrderData={setOrderData} nextStep={nextStep} />}
              {currentStep === 3 && <MeasurementGuide orderData={orderData} setOrderData={setOrderData} nextStep={nextStep} />}
              {currentStep === 4 && <OrderReview orderData={orderData} setOrderData={setOrderData} nextStep={nextStep} />}
              {currentStep === 5 && <PaymentValidation orderData={orderData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
