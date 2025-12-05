'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BinaryRainProps {
  count?: number;
}

export default function BinaryRain({ count = 15 }: BinaryRainProps) {
  const [windowHeight, setWindowHeight] = useState(1000);
  const [streams, setStreams] = useState<Array<{
    id: number;
    left: string;
    delay: number;
    duration: number;
    chars: string;
  }>>([]);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    // Generate binary streams
    setStreams(Array.from({ length: count }, (_, i) => {
      // Generate random binary string
      const length = 15 + Math.floor(Math.random() * 10);
      const chars = Array.from({ length }, () => 
        Math.random() > 0.5 ? '1' : '0'
      ).join('');
      
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 8,
        chars,
      };
    }));
  }, [count]);

  if (streams.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          className="absolute font-mono text-sm leading-tight"
          style={{ 
            left: stream.left, 
            top: '-10%',
            color: '#00ff41',
            textShadow: '0 0 8px rgba(0, 255, 65, 0.8)',
          }}
          animate={{
            y: [0, windowHeight * 1.2],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: stream.duration,
            delay: stream.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {stream.chars.split('').map((char, idx) => (
            <div key={idx} className="opacity-80">
              {char}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
