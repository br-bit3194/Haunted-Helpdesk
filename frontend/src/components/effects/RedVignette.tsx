'use client';

import { motion } from 'framer-motion';

export default function RedVignette() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-40"
      style={{
        background: 'radial-gradient(circle at center, transparent 0%, transparent 40%, rgba(139, 0, 0, 0.3) 70%, rgba(139, 0, 0, 0.6) 100%)',
      }}
      animate={{
        opacity: [0.6, 0.8, 0.6],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    />
  );
}
