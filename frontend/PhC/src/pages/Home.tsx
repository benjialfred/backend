// @ts-nocheck
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Shield, Zap, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { TouchEvent } from 'react';
import Productcard from '@/pages/Productcard';
import africanRoyalNdop from '@/assets/african_royal_ndop.png';
import modernCameroonFashion from '@/assets/modern_cameroon_fashion.png';
import atelierExcellence from '@/assets/atelier_excellence.png';

import Navigation from '@/components/Navigation';
import EventsSection from '@/components/home/EventsSection';
import FAQSection from '@/components/home/FAQSection';
import Footer from '@/components/layout/Footer';

const sliderImages = [
  {
    id: 1,
    title: "Collection Ndop Royale",
    description: "Élégance traditionnelle des Grassfields",
    image: africanRoyalNdop,
  },
  {
    id: 2,
    title: "Héritage & Modernité",
    description: "Affiné par nos maîtres tailleurs",
    image: modernCameroonFashion,
  },
  {
    id: 3,
    title: "Atelier d'Excellence",
    description: "La précision camerounaise au service de votre style",
    image: atelierExcellence,
  }
];

const features = [
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Sur-Mesure",
    description: "Chaque pièce est ajustée à la perfection selon vos mensurations exactes"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Qualité Premium",
    description: "Sélection rigoureuse des tissus et finitions impeccables"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Savoir-faire Local",
    description: "Conception et fabrication 100% camerounaises"
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredModels, setFeaturedModels] = useState<any[]>([]);

  useEffect(() => {
    if (isAutoPlaying) {
      const timer = setTimeout(() => {
        nextSlide();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, isAutoPlaying]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { productAPI, modelAPI } = await import('@/services/api');
        
        const [productsResponse, modelsResponse] = await Promise.all([
           productAPI.getAll({ is_featured: 'true', page_size: 3 }),
           modelAPI.getAll()
        ]);

        let productItems: any[] = [];
        if (productsResponse && productsResponse.results) {
           productItems = productsResponse.results;
        } else if (Array.isArray(productsResponse)) {
           productItems = productsResponse;
        }

        let modelItems: any[] = [];
        if (modelsResponse && (modelsResponse as any).results) {
            modelItems = (modelsResponse as any).results;
        } else if (Array.isArray(modelsResponse)) {
            modelItems = modelsResponse;
        }

        setFeaturedProducts(productItems.slice(0, 3));
        setFeaturedModels(modelItems.slice(0, 3));
      } catch(err) {
        console.error("Failed to fetch home data", err);
      }
    };
    fetchHomeData();
  }, []);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-black text-black dark:text-white font-sans selection:bg-primary-500 selection:text-white">
      <Navigation />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="relative h-[100svh] min-h-[700px] overflow-hidden group bg-black"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 z-0">
          {sliderImages.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: index === currentSlide ? 1 : 0, scale: index === currentSlide ? 1 : 1.05 }}
              transition={{ duration: 1.8, ease: [0.25, 1, 0.5, 1] }}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'z-10' : 'z-0'}`}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/90" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            <span className="text-primary-400 font-medium text-xs md:text-sm uppercase tracking-[0.4em] mb-6 inline-block">Maison de Couture</span>
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white mb-6 font-serif tracking-tighter leading-[0.85] drop-shadow-2xl">
              PROPHÉTIE<br />COUTURE
            </h1>
            <p className="text-lg md:text-2xl text-white/90 font-serif italic mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              &ldquo;L'élégance du style camerounais, la rigueur du sur-mesure.&rdquo;
            </p>
            <Link
              to="/checkout"
              className="px-10 py-5 bg-transparent border border-white text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-700 hover:scale-[1.02]"
            >
              Commander une Création
            </Link>
          </motion.div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-12 left-0 w-full z-30 px-6 md:px-16 flex items-end justify-between">
           <div className="flex gap-4">
              <button onClick={prevSlide} className="p-3 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm group-hover:border-white/50">
                <ChevronLeft strokeWidth={1} className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="p-3 border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm group-hover:border-white/50">
                <ChevronRight strokeWidth={1} className="w-6 h-6" />
              </button>
           </div>

           <div className="hidden md:flex flex-col items-end text-white/90">
             <div className="flex gap-2 mb-4">
                {sliderImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-[1px] transition-all duration-700 ${index === currentSlide ? 'w-16 bg-primary-500' : 'w-6 bg-white/30 hover:bg-white/60'}`}
                    aria-label={`Aller au slide ${index + 1}`}
                  />
                ))}
             </div>
             <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">{sliderImages[currentSlide].title}</p>
           </div>
        </div>
      </motion.section>

      {/* Features - High End Editorial Style */}
      <motion.section className="bg-white dark:bg-[#0a0a0a] py-32 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="text-center mb-24">
            <span className="text-primary-500 font-bold text-xs uppercase tracking-[0.3em] mb-4 inline-block">Notre Savoir-Faire</span>
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6 text-gray-900 dark:text-white">L'Excellence à chaque étape</h2>
            <div className="w-24 h-[1px] bg-primary-500 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 border border-gray-200 flex items-center justify-center mb-8 text-black group-hover:border-primary-500 group-hover:text-primary-500 transition-colors duration-500">
                  {/* Using React.cloneElement to set strokeWidth safely if it's a lucide icon */}
                  <div className="transform transition-transform duration-500 group-hover:scale-110">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Products */}
      <motion.section className="max-w-7xl mx-auto px-4 md:px-10 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 border-b border-gray-200 pb-6">
          <div>
            <span className="text-primary-500 font-bold text-xs uppercase tracking-[0.3em] mb-2 inline-block">Collection Intemporelle</span>
            <h2 className="text-4xl md:text-5xl font-serif font-black text-gray-900">Pièces d'Exception</h2>
          </div>
          <Link
            to="/products"
            className="group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] hover:text-primary-500 transition-colors text-black pb-1"
          >
            Voir toute la collection
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Productcard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel border-dashed border-2 border-gray-300 dark:border-white/10">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Collection en cours</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Nos artisans travaillent actuellement sur de nouvelles pièces d'exception.
            </p>
          </div>
        )}
      </motion.section>

      {/* Featured Models */}
      <motion.section className="bg-white dark:bg-[#0a0a0a] py-32 border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="text-center mb-24">
            <span className="text-primary-500 font-bold text-xs uppercase tracking-[0.3em] mb-4 inline-block">Sur-Mesure</span>
            <h2 className="text-4xl md:text-5xl font-serif font-black mb-6 text-gray-900">Modèles d'Inspiration</h2>
            <div className="w-24 h-[1px] bg-primary-500 mx-auto"></div>
          </div>

        {featuredModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredModels.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex flex-col bg-white dark:bg-black/20 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 border border-gray-100 dark:border-white/5 cursor-pointer"
              >
                 <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-white/5">
                    <img 
                      src={model.image || model.images?.[0] || 'https://via.placeholder.com/400x500?text=Model'} 
                      alt={model.nom} 
                       className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 </div>
                 <div className="p-5 flex flex-col flex-grow bg-white dark:bg-transparent">
                     <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2 leading-snug">
                         {model.nom}
                     </h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                         {model.description}
                     </p>
                 </div>
              </motion.div>
            ))}
          </div>
        ) : (
           <div className="text-center py-24 border border-gray-200 mt-10">
               <h3 className="text-xl font-bold mb-2 text-gray-500">D'autres modèles arriveront bientôt</h3>
           </div>
        )}
        </div>
      </motion.section>

      {/* About Section - Premium Dark Mode */}
      <motion.section className="relative py-40 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/20 z-10" />
              <img
                src={modernCameroonFashion}
                alt="L'Art de la Création"
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <p className="text-primary-500 font-bold text-sm uppercase tracking-[0.3em] mb-6">L'Héritage</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl text-white font-serif mb-8 leading-[1.1] tracking-tight">
                Une signature entre tradition et modernité.
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg leading-relaxed">
                Née d'une passion pour l'élégance et guidée par le savoir-faire camerounais,
                Prophétie Couture incarne l'alliance parfaite entre les héritages culturels et
                les lignes épurées contemporaines.
              </p>
              <Link
                to="/about"
                className="px-8 py-4 bg-transparent border border-white text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-700"
              >
                Découvrir la Maison
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <EventsSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Home;