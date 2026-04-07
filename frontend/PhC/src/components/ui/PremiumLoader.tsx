import { motion } from 'framer-motion';

const PremiumLoader = () => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            <div className="relative z-10 flex flex-col items-center">
                {/* Circle Spinner */}
                <motion.div
                    className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />

                {/* Brand Name */}
                <motion.h1
                    className="text-3xl font-bold tracking-[0.2em] text-black dark:text-white mb-2 font-serif italic"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    Prophétie<span className="text-primary-500">Couture</span>
                </motion.h1>

                {/* Loading text */}
                <motion.p
                    className="mt-4 text-sm text-black/60 dark:text-primary-200 uppercase tracking-widest font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    Chargement...
                </motion.p>
            </div>
        </div>
    );
};

export default PremiumLoader;
