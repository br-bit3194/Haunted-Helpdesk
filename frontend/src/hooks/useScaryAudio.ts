/**
 * useScaryAudio - Custom hook for managing scary audio effects
 * Handles audio preloading, playback, and state management
 */

import { useEffect, useState, useCallback } from 'react';
import { AudioManager } from '../lib/audioManager';

export interface ScaryAudioConfig {
  hover: {
    path: string;
    volume: number;
    loop: boolean;
  };
  click: {
    path: string;
    volume: number;
    loop: boolean;
  };
  ambient?: {
    path: string;
    volume: number;
    loop: boolean;
  };
}

// Default scary audio configuration
export const SCARY_AUDIO: ScaryAudioConfig = {
  ambient: {
    path: '/sounds/raone.mp3',
    volume: 0.2,
    loop: true,
  },
};

export interface UseScaryAudioReturn {
  playHoverSound: () => void;
  playClickSound: () => void;
  playAmbientSound: () => void;
  stopAmbientSound: () => void;
  stopAllSounds: () => void;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isLoaded: boolean;
}

export function useScaryAudio(
  enabled: boolean = true,
  config: ScaryAudioConfig = SCARY_AUDIO,
  audioManager?: AudioManager
): UseScaryAudioReturn {
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use provided audio manager or create a new one
  const manager = audioManager || new AudioManager();

  // Preload audio files on mount
  useEffect(() => {
    if (!enabled) {
      setIsLoaded(true);
      return;
    }

    const preloadAudio = async () => {
      try {
        const audioConfigs = [
          config.hover,
          config.click,
          ...(config.ambient ? [config.ambient] : []),
        ];

        await manager.preloadMultiple(audioConfigs);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to preload audio:', error);
        // Still set loaded to true so UI doesn't block
        setIsLoaded(true);
      }
    };

    preloadAudio();

    // Cleanup on unmount
    return () => {
      manager.stopAll();
    };
  }, [enabled, config, manager]);

  // Play hover sound
  const playHoverSound = useCallback(() => {
    if (!enabled || !isLoaded) return;
    manager.play(config.hover.path, config.hover.volume, config.hover.loop);
  }, [enabled, isLoaded, config.hover, manager]);

  // Play click sound
  const playClickSound = useCallback(() => {
    if (!enabled || !isLoaded) return;
    manager.play(config.click.path, config.click.volume, config.click.loop);
  }, [enabled, isLoaded, config.click, manager]);

  // Play ambient sound
  const playAmbientSound = useCallback(() => {
    if (!enabled || !isLoaded || !config.ambient) return;
    manager.play(config.ambient.path, config.ambient.volume, config.ambient.loop);
  }, [enabled, isLoaded, config.ambient, manager]);

  // Stop ambient sound
  const stopAmbientSound = useCallback(() => {
    if (!config.ambient) return;
    manager.stop(config.ambient.path);
  }, [config.ambient, manager]);

  // Stop all sounds
  const stopAllSounds = useCallback(() => {
    manager.stopAll();
  }, [manager]);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    manager.setVolume(volume);
  }, [manager]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    manager.toggleMute();
    setIsMuted(manager.isMutedState());
  }, [manager]);

  return {
    playHoverSound,
    playClickSound,
    playAmbientSound,
    stopAmbientSound,
    stopAllSounds,
    setVolume,
    isMuted,
    toggleMute,
    isLoaded,
  };
}
