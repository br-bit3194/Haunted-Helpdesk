'use client';

import { motion } from 'framer-motion';

interface SkeletonMemoryProps {
  isActive?: boolean;
}

export default function SkeletonMemory({ isActive = false }: SkeletonMemoryProps) {
  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center"
      animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label={`Skeleton Memory agent${isActive ? ' - active' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))' : 'none' }}
        aria-hidden="true"
      >
        {/* Skull */}
        <ellipse cx="50" cy="45" rx="20" ry="25" fill="#f5f5f4" stroke="#78716c" strokeWidth="2" />
        
        {/* Eye sockets with memory orbs */}
        <ellipse cx="42" cy="42" rx="5" ry="7" fill="#1f2937" />
        <ellipse cx="58" cy="42" rx="5" ry="7" fill="#1f2937" />
        <circle cx="42" cy="42" r="2" fill="#8b5cf6" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="58" cy="42" r="2" fill="#8b5cf6" className={isActive ? 'animate-pulse' : ''} />
        
        {/* Nose cavity */}
        <path d="M 48 52 L 50 48 L 52 52 Z" fill="#1f2937" />
        
        {/* Teeth */}
        <rect x="42" y="58" width="3" height="5" fill="#f5f5f4" stroke="#78716c" strokeWidth="1" />
        <rect x="46" y="58" width="3" height="5" fill="#f5f5f4" stroke="#78716c" strokeWidth="1" />
        <rect x="50" y="58" width="3" height="5" fill="#f5f5f4" stroke="#78716c" strokeWidth="1" />
        <rect x="54" y="58" width="3" height="5" fill="#f5f5f4" stroke="#78716c" strokeWidth="1" />
        
        {/* Scroll */}
        <rect x="60" y="50" width="25" height="15" rx="2" fill="#fef3c7" stroke="#92400e" strokeWidth="1" />
        <line x1="63" y1="54" x2="82" y2="54" stroke="#92400e" strokeWidth="0.5" />
        <line x1="63" y1="57" x2="82" y2="57" stroke="#92400e" strokeWidth="0.5" />
        <line x1="63" y1="60" x2="82" y2="60" stroke="#92400e" strokeWidth="0.5" />
        
        {/* Floating memory orbs */}
        <motion.circle
          cx="30"
          cy="35"
          r="3"
          fill="#8b5cf6"
          opacity="0.6"
          animate={{ y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="70"
          cy="38"
          r="2.5"
          fill="#a78bfa"
          opacity="0.6"
          animate={{ y: [0, -5, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </svg>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-phantom-purple opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
