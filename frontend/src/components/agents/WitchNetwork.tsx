'use client';

import { motion } from 'framer-motion';

interface WitchNetworkProps {
  isActive?: boolean;
}

export default function WitchNetwork({ isActive = false }: WitchNetworkProps) {
  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center"
      animate={isActive ? { rotate: [0, -3, 3, 0] } : {}}
      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label={`Witch Network agent${isActive ? ' - active' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.8))' : 'none' }}
        aria-hidden="true"
      >
        {/* Witch hat */}
        <path
          d="M 50 20 L 35 45 L 65 45 Z"
          fill="#1f2937"
          stroke="#8b5cf6"
          strokeWidth="2"
        />
        <ellipse cx="50" cy="45" rx="18" ry="4" fill="#1f2937" stroke="#8b5cf6" strokeWidth="2" />
        
        {/* Hat band */}
        <rect x="35" y="42" width="30" height="3" fill="#8b5cf6" />
        
        {/* Face */}
        <circle cx="50" cy="55" r="10" fill="#86efac" stroke="#22c55e" strokeWidth="1" />
        
        {/* Eyes */}
        <circle cx="46" cy="54" r="1.5" fill="#1f2937" />
        <circle cx="54" cy="54" r="1.5" fill="#1f2937" />
        
        {/* Nose */}
        <path d="M 50 56 Q 48 58 49 60" fill="none" stroke="#22c55e" strokeWidth="1" />
        
        {/* Crystal ball with network nodes */}
        <circle cx="50" cy="75" r="12" fill="rgba(139, 92, 246, 0.3)" stroke="#8b5cf6" strokeWidth="2" />
        
        {/* Network nodes inside crystal ball */}
        <circle cx="45" cy="72" r="2" fill="#a78bfa" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="55" cy="72" r="2" fill="#a78bfa" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="50" cy="78" r="2" fill="#a78bfa" className={isActive ? 'animate-pulse' : ''} />
        
        {/* Network connections */}
        <line x1="45" y1="72" x2="55" y2="72" stroke="#a78bfa" strokeWidth="1" opacity="0.6" />
        <line x1="45" y1="72" x2="50" y2="78" stroke="#a78bfa" strokeWidth="1" opacity="0.6" />
        <line x1="55" y1="72" x2="50" y2="78" stroke="#a78bfa" strokeWidth="1" opacity="0.6" />
      </svg>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-phantom-purple opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
