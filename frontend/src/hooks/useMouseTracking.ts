/**
 * useMouseTracking - Custom hook for tracking mouse position and calculating model rotation
 * Makes the 3D model follow the user's cursor
 */

import { useEffect, useState, useCallback, useRef } from 'react';

export interface MouseTrackingConfig {
  sensitivity: number;        // How responsive the tracking is (0-1)
  smoothing: number;          // Lerp factor for smooth transitions (0-1)
  maxRotation: {
    x: number;                // Max vertical rotation in radians
    y: number;                // Max horizontal rotation in radians
  };
  targetBone?: string;        // Specific bone to rotate (e.g., 'Head', 'Neck')
  invertX?: boolean;          // Invert horizontal tracking
  invertY?: boolean;          // Invert vertical tracking
}

// Default mouse tracking configuration
export const MOUSE_TRACKING: MouseTrackingConfig = {
  sensitivity: 0.5,           // Moderate sensitivity
  smoothing: 0.1,             // Smooth, gradual movement
  maxRotation: {
    x: Math.PI / 6,           // ±30 degrees vertical
    y: Math.PI / 4,           // ±45 degrees horizontal
  },
  targetBone: 'Head',         // Track with head bone if available
  invertX: false,
  invertY: true,              // Invert Y for natural "looking up" behavior
};

export interface UseMouseTrackingReturn {
  targetRotation: { x: number; y: number };
  isTracking: boolean;
}

/**
 * Linear interpolation helper
 */
function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function useMouseTracking(
  enabled: boolean = true,
  config: MouseTrackingConfig = MOUSE_TRACKING
): UseMouseTrackingReturn {
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [isTracking, setIsTracking] = useState(false);
  
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Check for prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle mouse movement
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled || prefersReducedMotion) return;

    // Convert mouse position to normalized device coordinates (-1 to 1)
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Apply sensitivity and rotation limits
    const targetX = clamp(
      y * config.sensitivity * config.maxRotation.x * (config.invertY ? -1 : 1),
      -config.maxRotation.x,
      config.maxRotation.x
    );

    const targetY = clamp(
      x * config.sensitivity * config.maxRotation.y * (config.invertX ? -1 : 1),
      -config.maxRotation.y,
      config.maxRotation.y
    );

    // Smooth interpolation
    const smoothUpdate = () => {
      currentRotationRef.current.x = lerp(
        currentRotationRef.current.x,
        targetX,
        config.smoothing
      );
      currentRotationRef.current.y = lerp(
        currentRotationRef.current.y,
        targetY,
        config.smoothing
      );

      setTargetRotation({
        x: currentRotationRef.current.x,
        y: currentRotationRef.current.y,
      });

      // Continue animation if not close enough to target
      const distanceX = Math.abs(targetX - currentRotationRef.current.x);
      const distanceY = Math.abs(targetY - currentRotationRef.current.y);
      
      if (distanceX > 0.001 || distanceY > 0.001) {
        animationFrameRef.current = requestAnimationFrame(smoothUpdate);
      }
    };

    // Cancel previous animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Start smooth update
    animationFrameRef.current = requestAnimationFrame(smoothUpdate);
    setIsTracking(true);
  }, [enabled, prefersReducedMotion, config]);

  // Set up mouse tracking
  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      setIsTracking(false);
      setTargetRotation({ x: 0, y: 0 });
      currentRotationRef.current = { x: 0, y: 0 };
      return;
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, prefersReducedMotion, handleMouseMove]);

  return {
    targetRotation,
    isTracking: isTracking && enabled && !prefersReducedMotion,
  };
}
