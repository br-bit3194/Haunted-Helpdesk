'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ScreenGlitch() {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    };

    // Random glitch every 3-8 seconds
    const scheduleNextGlitch = () => {
      const delay = 3000 + Math.random() * 5000;
      setTimeout(() => {
        triggerGlitch();
        scheduleNextGlitch();
      }, delay);
    };

    scheduleNextGlitch();
  }, []);

  if (!isGlitching) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {/* RGB Split Effect */}
      <motion.div
        className="absolute inset-0 mix-blend-screen"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,0,0.1) 0%, transparent 50%, rgba(0,255,0,0.1) 100%)',
        }}
        animate={{
          x: [0, -5, 5, -3, 3, 0],
          opacity: [0, 0.8, 0.6, 0.9, 0.4, 0],
        }}
        transition={{
          duration: 0.2,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
      />
      
      {/* Horizontal scan lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.1) 2px, rgba(255,0,0,0.1) 4px)',
        }}
        animate={{
          y: [0, 10, -10, 5, 0],
          opacity: [0, 1, 0.8, 0.6, 0],
        }}
        transition={{
          duration: 0.2,
        }}
      />

      {/* Flash overlay */}
      <motion.div
        className="absolute inset-0 bg-white"
        animate={{
          opacity: [0, 0.3, 0, 0.2, 0],
        }}
        transition={{
          duration: 0.2,
          times: [0, 0.1, 0.3, 0.5, 1],
        }}
      />
    </div>
  );
}
