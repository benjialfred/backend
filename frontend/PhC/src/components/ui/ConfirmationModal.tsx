import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

type ConfirmationType = 'danger' | 'success' | 'info';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: ConfirmationType;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmLabel = 'Confirmer',
    cancelLabel = 'Annuler'
}) => {
    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="w-12 h-12 text-red-500" />;
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'info':
            default:
                return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    const getButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20';
            case 'info':
            default:
                return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
            <div className="flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="mb-6 p-4 bg-dark-800 rounded-full border border-gray-700"
                >
                    {getIcon()}
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 mb-8 leading-relaxed">{message}</p>

                <div className="flex items-center gap-4 w-full">
                    {type === 'danger' && (
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-dark-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all duration-200 border border-gray-700"
                        >
                            {cancelLabel}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onConfirm();
                            if (type !== 'danger') onClose(); // Auto-close for success/info if desired, but typically controlled by parent. 
                        }}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-offset-2 ${getButtonStyles()} ${type !== 'danger' ? 'w-full' : ''}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmationModal;
