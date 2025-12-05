'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TerminalCursorsProps {
  count?: number;
}

export default function TerminalCursors({ count = 5 }: TerminalCursorsProps) {
  const [cursors, setCursors] = useState<Array<{
    id: number;
    x: string;
    y: string;
    delay: number;
  }>>([]);

  useEffect(() => {
    setCursors(Array.from({ length: count }, (_, i) => ({
      id: i,
      x: `${10 + Math.random() * 80}%`,
      y: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 2,
    })));
  }, [count]);

  if (cursors.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.id}
          className="absolute font-mono text-lg"
          style={{
            left: cursor.x,
            top: cursor.y,
            color: '#00ff41',
            textShadow: '0 0 10px rgba(0, 255, 65, 0.8)',
          }}
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 1,
            delay: cursor.delay,
            repeat: Infinity,
            ease: 'steps(1)',
          }}
        >
          █
        </motion.div>
      ))}
    </div>
  );
}
