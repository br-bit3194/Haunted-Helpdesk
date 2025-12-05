'use client';

import { motion } from 'framer-motion';

interface VampireTicketingProps {
  isActive?: boolean;
}

export default function VampireTicketing({ isActive = false }: VampireTicketingProps) {
  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center"
      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label={`Vampire Ticketing agent${isActive ? ' - active' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.8))' : 'none' }}
        aria-hidden="true"
      >
        {/* Cape */}
        <path
          d="M 50 30 Q 30 35 25 60 L 25 80 Q 25 85 30 85 L 50 75 L 70 85 Q 75 85 75 80 L 75 60 Q 70 35 50 30 Z"
          fill="#1f2937"
          stroke="#dc2626"
          strokeWidth="2"
        />
        
        {/* Head */}
        <circle cx="50" cy="35" r="12" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1" />
        
        {/* Hair */}
        <path
          d="M 38 30 Q 38 22 50 22 Q 62 22 62 30"
          fill="#1f2937"
          stroke="#1f2937"
          strokeWidth="1"
        />
        
        {/* Eyes */}
        <circle cx="45" cy="35" r="2" fill="#dc2626" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="55" cy="35" r="2" fill="#dc2626" className={isActive ? 'animate-pulse' : ''} />
        
        {/* Fangs */}
        <path d="M 47 40 L 47 45 L 49 42 Z" fill="#f5f5f4" />
        <path d="M 53 40 L 53 45 L 51 42 Z" fill="#f5f5f4" />
        
        {/* Golden ticket */}
        <rect
          x="55"
          y="55"
          width="20"
          height="12"
          rx="1"
          fill="#fbbf24"
          stroke="#92400e"
          strokeWidth="1"
        />
        <text x="58" y="63" fontSize="6" fill="#92400e" fontWeight="bold">TIX</text>
      </svg>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-blood-red opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
