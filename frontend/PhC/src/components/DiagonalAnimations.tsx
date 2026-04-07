import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DiagonalAnimation = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Lignes diagonales animées */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"
            style={{
              top: `${i * 7}%`,
              left: `-10%`,
              width: '120%',
              transform: `rotate(${45 + (mousePosition.x - 0.5) * 10}deg)`,
              opacity: 0.3 + (i % 3) * 0.1,
            }}
            animate={{
              x: [0, 100, 0],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Particules diagonales */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-blue-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 100, 0],
              rotate: 45,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Gradient diagonal */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              45deg,
              rgba(59, 130, 246, 0.05) 0%,
              transparent 20%,
              transparent 80%,
              rgba(236, 72, 153, 0.05) 100%
            )
          `,
        }}
      />
    </>
  );
};

export default DiagonalAnimation;