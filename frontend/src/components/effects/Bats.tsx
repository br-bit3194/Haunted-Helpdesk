'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BatsProps {
  count?: number;
}

export default function Bats({ count = 8 }: BatsProps) {
  const [bats, setBats] = useState<Array<{
    id: number;
    startX: string;
    startY: string;
    endX: string;
    endY: string;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Generate bat positions on client side only
    setBats(Array.from({ length: count }, (_, i) => {
      const startX = Math.random() * 100;
      const startY = Math.random() * 30; // Upper portion of screen
      const endX = Math.random() * 100;
      const endY = Math.random() * 30;
      
      return {
        id: i,
        startX: `${startX}%`,
        startY: `${startY}%`,
        endX: `${endX}%`,
        endY: `${endY}%`,
        delay: Math.random() * 3,
        duration: 8 + Math.random() * 6,
      };
    }));
  }, [count]);

  // Don't render until client-side hydration is complete
  if (bats.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {bats.map((bat) => (
        <motion.div
          key={bat.id}
          className="absolute text-4xl"
          style={{ left: bat.startX, top: bat.startY }}
          animate={{
            left: [bat.startX, bat.endX, bat.startX],
            top: [bat.startY, bat.endY, bat.startY],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: bat.duration,
            delay: bat.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🦇
        </motion.div>
      ))}
    </div>
  );
}
