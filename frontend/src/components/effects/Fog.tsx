'use client';

import { motion } from 'framer-motion';

interface FogProps {
  opacity?: number;
}

export default function Fog({ opacity = 0.3 }: FogProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none z-0 h-64 overflow-hidden" aria-hidden="true">
      {/* Multiple fog layers for depth */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          background: `linear-gradient(to top, rgba(139, 92, 246, ${opacity}), transparent)`,
        }}
        animate={{
          opacity: [opacity * 0.8, opacity, opacity * 0.8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          background: `linear-gradient(to top, rgba(88, 28, 135, ${opacity * 0.6}), transparent)`,
        }}
        animate={{
          opacity: [opacity * 0.6, opacity * 0.8, opacity * 0.6],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          background: `linear-gradient(to top, rgba(67, 20, 100, ${opacity * 0.4}), transparent)`,
        }}
        animate={{
          opacity: [opacity * 0.4, opacity * 0.6, opacity * 0.4],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
