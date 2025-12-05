'use client';

import { motion } from 'framer-motion';

export default function CandleFlicker() {
  return (
    <div className="relative inline-block" aria-hidden="true">
      {/* Candle body */}
      <div className="w-8 h-16 bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-sm relative">
        {/* Wax drip */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-2 h-4 bg-amber-100 rounded-b-full opacity-70" />
      </div>

      {/* Flame */}
      <motion.div
        className="absolute -top-6 left-1/2 -translate-x-1/2"
        animate={{
          scale: [1, 1.1, 0.95, 1.05, 1],
          y: [0, -2, 1, -1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Flame glow */}
        <motion.div
          className="absolute inset-0 blur-xl"
          animate={{
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-12 h-12 bg-orange-500 rounded-full" />
        </motion.div>

        {/* Flame emoji */}
        <span className="relative text-3xl">🕯️</span>
      </motion.div>

      {/* Additional glow effect */}
      <motion.div
        className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-orange-400 rounded-full blur-2xl opacity-20 pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
