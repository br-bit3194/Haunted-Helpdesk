/**
 * useModelAnimations - Custom hook for managing 3D model animation states
 * Handles animation state machine and smooth transitions
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';

export type AnimationState = 'idle' | 'hover' | 'attack';

export interface AnimationConfig {
  name: string;
  loop: boolean;
  clampWhenFinished: boolean;
  duration?: number;
  transitionDuration: number;
}

export interface AnimationStateConfig {
  idle: AnimationConfig;
  hover: AnimationConfig;
  attack: AnimationConfig;
}

// Default animation configuration
export const ANIMATION_STATES: AnimationStateConfig = {
  idle: {
    name: 'Idle',
    loop: true,
    clampWhenFinished: false,
    transitionDuration: 0.3,
  },
  hover: {
    name: 'Threaten',
    loop: true,
    clampWhenFinished: false,
    transitionDuration: 0.2,
  },
  attack: {
    name: 'Attack',
    loop: false,
    clampWhenFinished: true,
    duration: 1.5,
    transitionDuration: 0.1,
  },
};

export interface UseModelAnimationsReturn {
  currentAnimation: AnimationState;
  playIdle: () => void;
  playHover: () => void;
  playAttack: () => void;
  animationProgress: number;
  isAnimating: boolean;
}

export function useModelAnimations(
  animations: THREE.AnimationClip[] | undefined,
  mixer: THREE.AnimationMixer | null,
  config: AnimationStateConfig = ANIMATION_STATES
): UseModelAnimationsReturn {
  const [currentAnimation, setCurrentAnimation] = useState<AnimationState>('idle');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize animation actions
  useEffect(() => {
    if (!animations || !mixer || animations.length === 0) {
      console.warn('No animations available');
      return;
    }

    try {
      // Create actions for each animation clip
      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actionsRef.current.set(clip.name, action);
      });

      // Start with idle animation
      playAnimationByName(config.idle.name, config.idle);
    } catch (error) {
      console.error('Failed to initialize animations:', error);
    }

    return () => {
      // Cleanup
      actionsRef.current.forEach((action) => {
        action.stop();
      });
      actionsRef.current.clear();
      
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
      }
    };
  }, [animations, mixer]);

  // Helper function to play animation by name
  const playAnimationByName = useCallback((
    animationName: string,
    animConfig: AnimationConfig
  ) => {
    const action = actionsRef.current.get(animationName);
    
    if (!action) {
      console.warn(`Animation "${animationName}" not found`);
      return;
    }

    // Fade out current animation
    if (currentActionRef.current && currentActionRef.current !== action) {
      currentActionRef.current.fadeOut(animConfig.transitionDuration);
    }

    // Configure and play new animation
    action.reset();
    action.setLoop(
      animConfig.loop ? THREE.LoopRepeat : THREE.LoopOnce,
      animConfig.loop ? Infinity : 1
    );
    action.clampWhenFinished = animConfig.clampWhenFinished;
    action.fadeIn(animConfig.transitionDuration);
    action.play();

    currentActionRef.current = action;
    setIsAnimating(true);
  }, []);

  // Play idle animation
  const playIdle = useCallback(() => {
    if (currentAnimation === 'idle') return;
    
    playAnimationByName(config.idle.name, config.idle);
    setCurrentAnimation('idle');
    setAnimationProgress(0);
  }, [currentAnimation, config.idle, playAnimationByName]);

  // Play hover animation
  const playHover = useCallback(() => {
    if (currentAnimation === 'attack') return; // Don't interrupt attack
    if (currentAnimation === 'hover') return;
    
    playAnimationByName(config.hover.name, config.hover);
    setCurrentAnimation('hover');
    setAnimationProgress(0);
  }, [currentAnimation, config.hover, playAnimationByName]);

  // Play attack animation
  const playAttack = useCallback(() => {
    playAnimationByName(config.attack.name, config.attack);
    setCurrentAnimation('attack');
    setAnimationProgress(0);

    // Clear any existing timeout
    if (attackTimeoutRef.current) {
      clearTimeout(attackTimeoutRef.current);
    }

    // Return to idle after attack completes
    const duration = config.attack.duration || 1.5;
    attackTimeoutRef.current = setTimeout(() => {
      playIdle();
    }, duration * 1000);
  }, [config.attack, playIdle, playAnimationByName]);

  // Update animation progress
  useEffect(() => {
    if (!currentActionRef.current) return;

    const updateProgress = () => {
      if (currentActionRef.current) {
        const action = currentActionRef.current;
        const clip = action.getClip();
        const progress = clip.duration > 0 ? action.time / clip.duration : 0;
        setAnimationProgress(progress);
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [currentAnimation]);

  return {
    currentAnimation,
    playIdle,
    playHover,
    playAttack,
    animationProgress,
    isAnimating,
  };
}
