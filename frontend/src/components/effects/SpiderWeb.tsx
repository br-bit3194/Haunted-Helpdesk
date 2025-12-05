'use client';

import { motion } from 'framer-motion';

interface SpiderWebProps {
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function SpiderWeb({ corner = 'top-left' }: SpiderWebProps) {
  const cornerStyles = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-[-1]',
  };

  return (
    <div className={`fixed ${cornerStyles[corner]} pointer-events-none z-10`} aria-hidden="true">
      {/* Spider Web SVG */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        className="opacity-30"
      >
        {/* Radial web lines */}
        <line x1="0" y1="0" x2="200" y2="200" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="0" y1="0" x2="150" y2="200" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="0" y1="0" x2="100" y2="200" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="0" y1="0" x2="200" y2="150" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="0" y1="0" x2="200" y2="100" stroke="#e5e7eb" strokeWidth="1" />
        <line x1="0" y1="0" x2="200" y2="50" stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Concentric web arcs */}
        <path
          d="M 40 0 Q 40 40 0 40"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <path
          d="M 80 0 Q 80 80 0 80"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <path
          d="M 120 0 Q 120 120 0 120"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <path
          d="M 160 0 Q 160 160 0 160"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      </svg>

      {/* Animated Spider */}
      <motion.div
        className="absolute text-2xl"
        style={{ top: '60px', left: '60px' }}
        animate={{
          y: [0, 10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        🕷️
      </motion.div>
    </div>
  );
}
