import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const FlyingBird: React.FC = () => {
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    const triggerBird = () => {
      setFlying(true);
      setTimeout(() => setFlying(false), 10000);
    };

    const interval = setInterval(triggerBird, 45000); // Every 45s
    const initialTimeout = setTimeout(triggerBird, 5000); // First fly after 5s

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {flying && (
          <motion.div
            initial={{ x: '-10vw', y: '20vh', scale: 0.8 }}
            animate={{
              x: '110vw',
              y: ['20vh', '10vh', '30vh', '15vh'],
              rotate: [0, -5, 5, -2, 0],
            }}
            transition={{ duration: 8, ease: 'easeInOut' }}
            className="absolute text-2xl filter drop-shadow-md select-none"
          >
            🕊️
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
