'use client';

import { motion } from 'framer-motion';

interface ReaperCloudProps {
  isActive?: boolean;
}

export default function ReaperCloud({ isActive = false }: ReaperCloudProps) {
  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center"
      animate={isActive ? { y: [0, -8, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label={`Reaper Cloud agent${isActive ? ' - active' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.8))' : 'none' }}
        aria-hidden="true"
      >
        {/* Hooded robe */}
        <path
          d="M 50 25 Q 35 25 30 40 L 25 70 Q 25 75 30 75 L 45 75 L 45 85 L 55 85 L 55 75 L 70 75 Q 75 75 75 70 L 70 40 Q 65 25 50 25 Z"
          fill="#1f2937"
          stroke="#6b7280"
          strokeWidth="2"
        />
        
        {/* Hood shadow (face area) */}
        <ellipse cx="50" cy="40" rx="12" ry="15" fill="#0f172a" />
        
        {/* Glowing eyes */}
        <circle cx="45" cy="38" r="2" fill="#fb923c" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="55" cy="38" r="2" fill="#fb923c" className={isActive ? 'animate-pulse' : ''} />
        
        {/* Cloud-shaped scythe */}
        {/* Scythe handle */}
        <line x1="65" y1="50" x2="80" y2="30" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" />
        
        {/* Cloud blade */}
        <path
          d="M 75 25 Q 78 22 82 22 Q 85 22 87 25 Q 90 25 90 28 Q 90 31 87 31 Q 85 34 82 34 Q 78 34 75 31 Q 72 31 72 28 Q 72 25 75 25 Z"
          fill="#e0f2fe"
          stroke="#0ea5e9"
          strokeWidth="1.5"
        />
        
        {/* AWS logo on robe */}
        <g transform="translate(42, 55)">
          <rect width="16" height="10" rx="1" fill="#fb923c" opacity="0.8" />
          <text x="2" y="7" fontSize="5" fill="#1f2937" fontWeight="bold">AWS</text>
        </g>
      </svg>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-pumpkin-orange opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
