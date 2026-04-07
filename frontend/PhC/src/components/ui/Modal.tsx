import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import phcLogo from '../../assets/phc_logo.jpg';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          {/* Flex container for centering */}
          <div className="flex min-h-full items-center justify-center p-4">

            {/* Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
              className={`relative w-full ${sizeClasses[size]} bg-dark-900 border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Branding / Logo - Top Center */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-dark-900 rounded-full border border-gray-800 flex items-center justify-center shadow-lg z-20">
                <img src={phcLogo} alt="PhC Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
              </div>

              {/* Decorative gradients */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-lime-400 via-green-500 to-lime-400 opacity-80" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-12 pb-4 border-b border-gray-800 relative z-10">
                <h3 className="text-xl font-bold text-white tracking-tight text-center w-full">{title}</h3>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              {/* Body */}
              <div className="px-8 py-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar relative z-10">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;