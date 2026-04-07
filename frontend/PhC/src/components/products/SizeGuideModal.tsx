import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { Ruler, Printer, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'men' | 'women' | 'kids';

const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<TabType>('women');

    const content = {
        women: {
            title: "Collections Femmes",
            description: "Mesures standards pour nos créations prêt-à-porter. Pour le sur-mesure, nous prenons vos mesures exactes en atelier.",
            headers: ["Taille", "Poitrine (cm)", "Taille (cm)", "Hanches (cm)", "FR"],
            rows: [
                ["XS", "80-84", "60-64", "86-90", "34-36"],
                ["S", "84-88", "64-68", "90-94", "36-38"],
                ["M", "88-92", "68-72", "94-98", "38-40"],
                ["L", "92-96", "72-76", "98-102", "40-42"],
                ["XL", "96-102", "76-82", "102-108", "42-44"],
                ["XXL", "102-108", "82-88", "108-114", "44-46"]
            ]
        },
        men: {
            title: "Collections Hommes",
            description: "Mesures standards pour nos créations hommes (Chemises et Pantalons).",
            headers: ["Taille", "Cou (cm)", "Poitrine (cm)", "Taille (cm)", "FR"],
            rows: [
                ["XS", "36-37", "84-88", "72-76", "44"],
                ["S", "37-38", "88-92", "76-80", "46"],
                ["M", "39-40", "92-96", "80-84", "48-50"],
                ["L", "41-42", "96-100", "84-88", "52"],
                ["XL", "43-44", "100-104", "88-92", "54-56"],
                ["XXL", "45-46", "104-110", "92-98", "58-60"]
            ]
        },
        kids: {
            title: "Collections Enfants",
            description: "Basé sur l'âge et la stature de l'enfant.",
            headers: ["Âge", "Stature (cm)", "Poitrine (cm)", "Taille (cm)"],
            rows: [
                ["2 ans", "86-92", "54", "51"],
                ["4 ans", "98-104", "56", "53"],
                ["6 ans", "110-116", "60", "56"],
                ["8 ans", "122-128", "64", "59"],
                ["10 ans", "134-140", "70", "62"],
                ["12 ans", "146-152", "76", "66"]
            ]
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Guide des Tailles" size="lg">
            <div className="text-dark-900 dark:text-white font-sans">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-[#f2cc0d]/20 mb-8 overflow-x-auto hide-scrollbar pb-2">
                    {(['women', 'men', 'kids'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                ? 'text-dark-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                                : 'text-dark-600 dark:text-primary-300 hover:text-dark-900 dark:text-white dark:hover:text-white'
                                }`}
                        >
                            {tab === 'women' ? 'Femmes' : tab === 'men' ? 'Hommes' : 'Enfants'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="mb-8 text-center">
                            <h2 className="text-4xl font-black font-['Newsreader',serif] italic text-dark-900 dark:text-white mb-4">{content[activeTab].title}</h2>
                            <p className="text-dark-700 dark:text-primary-100 max-w-lg mx-auto text-base font-medium">{content[activeTab].description}</p>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto bg-white dark:bg-dark-900 rounded-xl border border-primary-500/50 dark:border-dark-700 dark:border-dark-800 mb-10 shadow-sm">
                            <table className="w-full text-left border-collapse text-base">
                                <thead>
                                    <tr className="bg-white dark:bg-dark-800 border-b border-primary-500/50 dark:border-dark-700 dark:border-dark-700">
                                        {content[activeTab].headers.map((header, i) => (
                                            <th key={i} className="p-4 font-bold text-dark-900 dark:text-white uppercase tracking-widest text-xs md:text-sm">{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {content[activeTab].rows.map((row, i) => (
                                        <tr key={i} className={`border-b border-slate-100 dark:border-dark-800 hover:bg-white dark:hover:bg-dark-800/50 transition-colors ${i % 2 === 0 ? '' : 'bg-white/50 dark:bg-dark-800/20'}`}>
                                            {row.map((cell, j) => (
                                                <td key={j} className={`p-4 ${j === 0 ? "font-bold font-['Newsreader',serif] italic text-xl text-dark-900 dark:text-white" : "text-dark-800 dark:text-primary-100 dark:text-slate-200 font-medium font-mono"}`}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* How to measure */}
                        <div className="bg-white dark:bg-dark-900 rounded-xl p-8 border border-primary-500/50 dark:border-dark-700 dark:border-dark-800 mb-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="p-4 bg-white dark:bg-dark-800 rounded-full shrink-0 border border-primary-500/50 dark:border-dark-700 dark:border-dark-700 shadow-sm">
                                    <Ruler className="w-8 h-8 text-dark-900 dark:text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold font-['Newsreader',serif] italic text-dark-900 dark:text-white mb-4">L'Art de la Mesure</h3>
                                    <ul className="space-y-4 text-dark-800 dark:text-primary-100 dark:text-slate-200 text-base font-medium leading-relaxed">
                                        <li><strong className="text-dark-900 dark:text-white uppercase tracking-wider text-xs md:text-sm mr-2">Poitrine:</strong> Mesurez au point le plus fort, le mètre bien horizontal.</li>
                                        <li><strong className="text-dark-900 dark:text-white uppercase tracking-wider text-xs md:text-sm mr-2">Taille:</strong> Mesurez au creux de la taille, là où elle est la plus fine.</li>
                                        <li><strong className="text-dark-900 dark:text-white uppercase tracking-wider text-xs md:text-sm mr-2">Hanches:</strong> Mesurez au point le plus fort de votre bassin.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 border border-primary-500/50 dark:border-dark-600 dark:border-dark-700 hover:border-slate-900 dark:hover:border-white rounded-lg text-dark-800 dark:text-primary-100 dark:text-slate-200 hover:text-dark-900 dark:text-white dark:hover:text-white text-sm font-bold uppercase tracking-widest transition-all"
                            >
                                <Printer className="w-5 h-5" />
                                Imprimer
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-6 py-3 bg-dark-900 dark:bg-white text-white dark:text-dark-900 dark:text-white hover:opacity-90 rounded-lg text-sm font-bold uppercase tracking-widest transition-all shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                PDF
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .fixed.inset-0.z-\\[100\\] * {
                        visibility: visible;
                        color: black !important;
                    }
                    .fixed.inset-0.z-\\[100\\] {
                        position: absolute;
                        left: 0;
                        top: 0;
                        background: white !important;
                    }
                    .text-dark-900 dark:text-white, .text-white, .text-dark-600 dark:text-primary-300, .text-slate-400, .text-dark-700 dark:text-primary-200 {
                        color: black !important;
                    }
                    .bg-white, .bg-dark-800\\/50, .bg-primary-50 {
                        background: transparent !important;
                        border: 1px solid #ccc !important;
                    }
                    button {
                        display: none !important;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        font-family: monospace;
                    }
                    th {
                        background-color: #f5f5f5 !important;
                        font-family: sans-serif;
                    }
                    h2 {
                        margin-bottom: 20px;
                        margin-top: 20px;
                        font-family: serif;
                    }
                }
            `}</style>
        </Modal >
    );
};

export default SizeGuideModal;
