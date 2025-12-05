'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GlitchErrorsProps {
  count?: number;
}

const ERROR_MESSAGES = [
  '⚠️ CRITICAL: Memory Leak Detected',
  '❌ ERROR 500: Internal Server Error',
  '🔥 ALERT: CPU Usage 99%',
  '⛔ FATAL: Database Connection Lost',
  '🚨 WARNING: Disk Space Critical',
  '💀 PANIC: Kernel Crash Imminent',
  '⚡ TIMEOUT: Request Failed',
  '🔴 DENIED: Access Forbidden',
  '💥 EXCEPTION: Null Pointer',
  '🌐 DOWN: Network Unreachable',
  '📛 BREACH: Security Violation',
  '⏰ EXPIRED: Session Timeout',
];

export default function GlitchErrors({ count = 6 }: GlitchErrorsProps) {
  const [errors, setErrors] = useState<Array<{
    id: number;
    message: string;
    startX: string;
    startY: string;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    setErrors(Array.from({ length: count }, (_, i) => ({
      id: i,
      message: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)],
      startX: `${Math.random() * 90}%`,
      startY: `${Math.random() * 80}%`,
      delay: Math.random() * 4,
      duration: 8 + Math.random() * 6,
    })));
  }, [count]);

  if (errors.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {errors.map((error) => (
        <motion.div
          key={error.id}
          className="absolute font-mono text-xs px-3 py-2 rounded border"
          style={{ 
            left: error.startX, 
            top: error.startY,
            backgroundColor: 'rgba(139, 0, 0, 0.1)',
            borderColor: 'rgba(255, 0, 0, 0.3)',
            color: '#ff4444',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.2)',
          }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            y: [0, -30, -30, -60],
            scale: [0.8, 1, 1, 0.8],
          }}
          transition={{
            duration: error.duration,
            delay: error.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {error.message}
        </motion.div>
      ))}
    </div>
  );
}
