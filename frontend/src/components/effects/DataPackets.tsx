'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DataPacketsProps {
  count?: number;
}

export default function DataPackets({ count = 10 }: DataPacketsProps) {
  const [packets, setPackets] = useState<Array<{
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    delay: number;
    duration: number;
    size: number;
  }>>([]);

  useEffect(() => {
    setPackets(Array.from({ length: count }, (_, i) => {
      const startSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let startX, startY, endX, endY;

      switch (startSide) {
        case 0: // top
          startX = Math.random() * 100;
          startY = -5;
          endX = Math.random() * 100;
          endY = 105;
          break;
        case 1: // right
          startX = 105;
          startY = Math.random() * 100;
          endX = -5;
          endY = Math.random() * 100;
          break;
        case 2: // bottom
          startX = Math.random() * 100;
          startY = 105;
          endX = Math.random() * 100;
          endY = -5;
          break;
        default: // left
          startX = -5;
          startY = Math.random() * 100;
          endX = 105;
          endY = Math.random() * 100;
      }

      return {
        id: i,
        startX,
        startY,
        endX,
        endY,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 4,
        size: 8 + Math.random() * 8,
      };
    }));
  }, [count]);

  if (packets.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {packets.map((packet) => (
        <motion.div
          key={packet.id}
          className="absolute"
          style={{
            left: `${packet.startX}%`,
            top: `${packet.startY}%`,
          }}
          animate={{
            left: `${packet.endX}%`,
            top: `${packet.endY}%`,
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: packet.duration,
            delay: packet.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <svg
            width={packet.size}
            height={packet.size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="2"
              stroke="#9d4edd"
              strokeWidth="2"
              fill="rgba(157, 78, 221, 0.1)"
            />
            <motion.path
              d="M8 12h8M12 8v8"
              stroke="#9d4edd"
              strokeWidth="2"
              strokeLinecap="round"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </svg>
          {/* Trailing effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full rounded"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(157, 78, 221, 0.3), transparent)',
              filter: 'blur(4px)',
            }}
            animate={{
              scaleX: [0, 2, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
