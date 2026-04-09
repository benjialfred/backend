// src/components/Footer.tsx

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/phc_logo.jpg';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-100 dark:border-white/5 pt-16 pb-24 md:pb-8 text-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo et description */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-6 group block">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img src={logo} alt="PhC Logo" className="h-12 w-auto relative z-10" />
              </div>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 pr-4">
              Prophétie Couture - L'excellence sartoriale camerounaise. Nous créons des pièces uniques qui marient tradition et élégance contemporaine.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:border-primary-500 dark:hover:text-primary-400 dark:hover:border-primary-400 transition-all hover:scale-110">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:border-primary-500 dark:hover:text-primary-400 dark:hover:border-primary-400 transition-all hover:scale-110">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-500 hover:border-primary-500 dark:hover:text-primary-400 dark:hover:border-primary-400 transition-all hover:scale-110">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold uppercase tracking-widest mb-6">Navigation</h3>
            <ul className="space-y-4">
              {['Accueil', 'Boutique', 'Événements', 'Blog', 'À propos', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Accueil' ? '/' : `/${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-')}`} className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500/0 group-hover:bg-primary-500 transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold uppercase tracking-widest mb-6">Catégories</h3>
            <ul className="space-y-4">
              {['Sur Mesure', 'Chemises', 'pantalons', 'vestes', 'gandoura', 'boubou'].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500/0 group-hover:bg-primary-500 transition-colors" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold uppercase tracking-widest mb-6">Contact</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-gray-500 dark:text-gray-400 group cursor-pointer hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group-hover:border-primary-500/30 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="font-bold text-gray-900 dark:text-white mb-0.5">Localisation</span>
                  <span>Douala Ndogpassi II, Cameroun</span>
                </div>
              </li>
              <li className="flex items-start gap-4 text-gray-500 dark:text-gray-400 group cursor-pointer hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group-hover:border-primary-500/30 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="font-bold text-gray-900 dark:text-white mb-0.5">Téléphone</span>
                  <span>+237 670 69 01 94</span>
                </div>
              </li>
              <li className="flex items-start gap-4 text-gray-500 dark:text-gray-400 group cursor-pointer hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 group-hover:border-primary-500/30 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col pt-1">
                  <span className="font-bold text-gray-900 dark:text-white mb-0.5">Email</span>
                  <span>benjaminadzessa@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-100 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Prophétie Couture. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link to="/legal" className="hover:text-primary-500 transition-colors">Mentions légales</Link>
            <Link to="/privacy" className="hover:text-primary-500 transition-colors">Confidentialité</Link>
          </div>
          <p className="flex items-center gap-1 font-medium">
            Conçu avec passion au Cameroun 🇨🇲
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;