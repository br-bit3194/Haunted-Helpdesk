'use client';

import { motion } from 'framer-motion';

export default function FlickeringLights() {
  return (
    <>
      {/* Flickering overhead light effect */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-30"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255, 117, 24, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.3, 0.5, 0.2, 0.6, 0.3, 0.7, 0.4, 0.3],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
          repeatDelay: 2,
          times: [0, 0.1, 0.2, 0.3, 0.5, 0.6, 0.8, 1],
        }}
        aria-hidden="true"
      />

      {/* Emergency light pulse */}
      <motion.div
        className="fixed top-10 right-10 w-32 h-32 rounded-full pointer-events-none z-30"
        style={{
          background: 'radial-gradient(circle, rgba(255, 0, 0, 0.4) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />
    </>
  );
}
