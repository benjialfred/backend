import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumLoader from './PremiumLoader';
// import { useLocation } from 'react-router-dom';

interface GlobalLoaderWrapperProps {
    children: React.ReactNode;
}

const GlobalLoaderWrapper: React.FC<GlobalLoaderWrapperProps> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    // const location = useLocation(); // Unused for now

    useEffect(() => {
        // Enforce minimum 800ms loading time so the clean animation is visible but snappy
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="global-loader"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-[9999]"
                    >
                        <PremiumLoader />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </>
    );
};

export default GlobalLoaderWrapper;
