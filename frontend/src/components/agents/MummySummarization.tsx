'use client';

import { motion } from 'framer-motion';

interface MummySummarizationProps {
  isActive?: boolean;
}

export default function MummySummarization({ isActive = false }: MummySummarizationProps) {
  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center"
      animate={isActive ? { rotate: [0, 2, -2, 0] } : {}}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label={`Mummy Summarization agent${isActive ? ' - active' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(234, 179, 8, 0.8))' : 'none' }}
        aria-hidden="true"
      >
        {/* Mummy body with bandages */}
        <rect x="35" y="45" width="30" height="40" rx="5" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
        
        {/* Bandage wrapping lines */}
        <line x1="35" y1="50" x2="65" y2="50" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="55" x2="65" y2="55" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="60" x2="65" y2="60" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="65" x2="65" y2="65" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="70" x2="65" y2="70" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="75" x2="65" y2="75" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="80" x2="65" y2="80" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        
        {/* Head */}
        <ellipse cx="50" cy="35" rx="12" ry="14" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
        
        {/* Bandage on head */}
        <line x1="38" y1="32" x2="62" y2="32" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="38" y1="36" x2="62" y2="36" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        <line x1="38" y1="40" x2="62" y2="40" stroke="#92400e" strokeWidth="1" opacity="0.5" />
        
        {/* Glowing eyes */}
        <circle cx="44" cy="34" r="2" fill="#eab308" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="56" cy="34" r="2" fill="#eab308" className={isActive ? 'animate-pulse' : ''} />
        
        {/* TL;DR scroll */}
        <rect x="60" y="55" width="28" height="18" rx="2" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
        <text x="63" y="63" fontSize="5" fill="#92400e" fontWeight="bold">TL;DR</text>
        <line x1="63" y1="66" x2="85" y2="66" stroke="#92400e" strokeWidth="0.5" />
        <line x1="63" y1="69" x2="85" y2="69" stroke="#92400e" strokeWidth="0.5" />
        
        {/* Scroll curls */}
        <circle cx="60" cy="64" r="2" fill="none" stroke="#92400e" strokeWidth="1" />
        <circle cx="88" cy="64" r="2" fill="none" stroke="#92400e" strokeWidth="1" />
      </svg>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-pumpkin-orange opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
