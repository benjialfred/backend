
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqData } from '@/data/FAQData';

const FAQSection = () => {
    // Take only the first 3 questions for the home page
    const homeFAQs = faqData.slice(0, 3);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-32 relative overflow-hidden bg-gray-50 dark:bg-black/50 border-y border-gray-200 dark:border-white/5">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <p className="text-primary-500 font-bold text-sm uppercase tracking-[0.3em] mb-4">FAQ</p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 font-serif tracking-tight"
                    >
                        Questions Fréquentes
                    </motion.h2>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {homeFAQs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-colors duration-300"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-6 text-left"
                                aria-expanded={openIndex === index}
                            >
                                <span className="text-lg font-bold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-primary-500 text-black' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                                    {openIndex === index ? <Minus size={18} /> : <Plus size={18} />}
                                </span>
                            </button>

                            <motion.div
                                initial={false}
                                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 pt-0 border-t border-gray-100 dark:border-white/5 mt-2">
                                    <p className="mt-4 mb-4 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{faq.answer}</p>
                                    <ul className="space-y-3">
                                        {faq.details.slice(0, 4).map((detail, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="min-w-[4px] h-[4px] rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                                                <span className="leading-relaxed">{detail}</span>
                                            </li>
                                        ))}
                                        {faq.details.length > 4 && (
                                            <li className="text-xs text-primary-600 dark:text-primary-400 italic mt-4 font-bold">Plus de détails sur la page dédiée...</li>
                                        )}
                                    </ul>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/faq"
                        className="btn-premium px-8 py-3.5"
                    >
                        Explorer notre centre d'aide
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
