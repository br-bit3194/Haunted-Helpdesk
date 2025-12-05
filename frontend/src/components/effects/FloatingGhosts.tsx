'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FloatingGhostsProps {
  count?: number;
}

export default function FloatingGhosts({ count = 5 }: FloatingGhostsProps) {
  const [windowHeight, setWindowHeight] = useState(1000); // Default fallback
  const [ghosts, setGhosts] = useState<Array<{
    id: number;
    left: string;
    delay: number;
    duration: number;
  }>>([]);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    // Generate ghost positions on client side only
    setGhosts(Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    })));
  }, [count]);

  // Don't render until client-side hydration is complete
  if (ghosts.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {ghosts.map((ghost) => (
        <motion.div
          key={ghost.id}
          className="absolute text-6xl opacity-20"
          style={{ left: ghost.left, bottom: '-10%' }}
          animate={{
            y: [0, -windowHeight * 1.2],
            x: [0, Math.sin(ghost.id) * 50],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: ghost.duration,
            delay: ghost.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          👻
        </motion.div>
      ))}
    </div>
  );
}
