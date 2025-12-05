'use client';

import { motion } from 'framer-motion';

interface GhostOrchestratorProps {
  isActive?: boolean;
}

export default function GhostOrchestrator({ isActive = false }: GhostOrchestratorProps) {
  return (
    <motion.div
      className="relative w-24 h-24 flex items-center justify-center"
      animate={isActive ? { y: [0, -10, 0] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      role="img"
      aria-label={`Ghost Orchestrator agent${isActive ? ' - active' : ''}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ filter: isActive ? 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))' : 'none' }}
        aria-hidden="true"
      >
        {/* Ghost body */}
        <path
          d="M 50 20 Q 30 20 30 40 L 30 70 Q 30 75 35 75 Q 35 70 40 70 Q 40 75 45 75 Q 45 70 50 70 Q 50 75 55 75 Q 55 70 60 70 Q 60 75 65 75 Q 70 75 70 70 L 70 40 Q 70 20 50 20 Z"
          fill="rgba(255, 255, 255, 0.9)"
          stroke="rgba(16, 185, 129, 0.5)"
          strokeWidth="2"
        />
        
        {/* Glowing eyes */}
        <circle cx="42" cy="45" r="4" fill="#10b981" className={isActive ? 'animate-pulse' : ''} />
        <circle cx="58" cy="45" r="4" fill="#10b981" className={isActive ? 'animate-pulse' : ''} />
        
        {/* Conductor's baton */}
        <line
          x1="65"
          y1="55"
          x2="80"
          y2="40"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="80" cy="40" r="3" fill="#fbbf24" />
      </svg>
      
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-spectral-green opacity-20"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
