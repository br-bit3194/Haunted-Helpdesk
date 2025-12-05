'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CircuitLinesProps {
  density?: 'low' | 'medium' | 'high';
}

export default function CircuitLines({ density = 'medium' }: CircuitLinesProps) {
  const [lines, setLines] = useState<Array<{
    id: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    delay: number;
  }>>([]);

  const lineCount = density === 'low' ? 8 : density === 'medium' ? 12 : 16;

  useEffect(() => {
    const generateLines = () => {
      const newLines = [];
      for (let i = 0; i < lineCount; i++) {
        // Create horizontal and vertical lines
        const isHorizontal = Math.random() > 0.5;
        
        if (isHorizontal) {
          const y = Math.random() * 100;
          newLines.push({
            id: i,
            x1: 0,
            y1: y,
            x2: 100,
            y2: y,
            delay: Math.random() * 3,
          });
        } else {
          const x = Math.random() * 100;
          newLines.push({
            id: i,
            x1: x,
            y1: 0,
            x2: x,
            y2: 100,
            delay: Math.random() * 3,
          });
        }
      }
      setLines(newLines);
    };

    generateLines();
  }, [lineCount]);

  if (lines.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <svg className="w-full h-full opacity-10">
        <defs>
          <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff41" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ff41" stopOpacity="1" />
            <stop offset="100%" stopColor="#00ff41" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {lines.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="url(#circuit-gradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: 4,
              delay: line.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
        
        {/* Circuit nodes */}
        {lines.map((line) => (
          <motion.circle
            key={`node-${line.id}`}
            cx={`${line.x1}%`}
            cy={`${line.y1}%`}
            r="3"
            fill="#00ff41"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0],
            }}
            transition={{
              duration: 4,
              delay: line.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
