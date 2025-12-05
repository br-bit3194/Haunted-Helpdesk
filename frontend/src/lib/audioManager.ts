/**
 * AudioManager - Manages audio playback with pooling and error handling
 * Prevents overlapping sounds and handles audio loading errors gracefully
 */

export interface AudioConfig {
  path: string;
  volume: number;
  loop: boolean;
}

export class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private failedLoads: Set<string> = new Set();
  private activeSounds: Map<string, HTMLAudioElement> = new Map();
  private globalVolume: number = 1.0;
  private isMuted: boolean = false;

  /**
   * Preload an audio file
   * @param path - Path to the audio file
   * @returns Promise that resolves when audio is loaded
   */
  async preloadAudio(path: string): Promise<void> {
    if (this.audioCache.has(path) || this.failedLoads.has(path)) {
      return;
    }

    try {
      const audio = new Audio(path);
      
      // Wait for audio to be loaded
      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', (e) => reject(e), { once: true });
        audio.load();
      });

      this.audioCache.set(path, audio);
      console.log(`Audio preloaded: ${path}`);
    } catch (error) {
      console.warn(`Failed to load audio: ${path}`, error);
      this.failedLoads.add(path);
      // Continue without audio - don't crash
    }
  }

  /**
   * Preload multiple audio files
   * @param configs - Array of audio configurations
   */
  async preloadMultiple(configs: AudioConfig[]): Promise<void> {
    const promises = configs
      .filter(config => config && config.path) // Filter out undefined configs
      .map(config => this.preloadAudio(config.path));
    await Promise.allSettled(promises);
  }

  /**
   * Play an audio file with overlap prevention
   * @param path - Path to the audio file
   * @param volume - Volume level (0-1), defaults to config volume
   * @param loop - Whether to loop the audio
   */
  play(path: string, volume: number = 1.0, loop: boolean = false): void {
    // Silent fail if audio failed to load
    if (this.failedLoads.has(path)) {
      return;
    }

    // Stop any currently playing instance of this sound (overlap prevention)
    if (this.activeSounds.has(path)) {
      const activeSound = this.activeSounds.get(path);
      if (activeSound) {
        activeSound.pause();
        activeSound.currentTime = 0;
      }
    }

    // Get audio from cache or create new instance
    let audio = this.audioCache.get(path);
    
    if (!audio) {
      // If not preloaded, create on-demand
      audio = new Audio(path);
      audio.addEventListener('error', () => {
        console.warn(`Audio playback failed: ${path}`);
        this.failedLoads.add(path);
      });
    } else {
      // Clone the audio element to allow multiple instances
      audio = audio.cloneNode() as HTMLAudioElement;
    }

    // Configure audio
    audio.volume = this.isMuted ? 0 : volume * this.globalVolume;
    audio.loop = loop;

    // Play audio
    audio.play().catch(err => {
      console.warn(`Audio playback failed: ${path}`, err);
    });

    // Track active sound
    this.activeSounds.set(path, audio);

    // Remove from active sounds when finished (if not looping)
    if (!loop) {
      audio.addEventListener('ended', () => {
        this.activeSounds.delete(path);
      }, { once: true });
    }
  }

  /**
   * Stop a specific audio file
   * @param path - Path to the audio file
   */
  stop(path: string): void {
    const audio = this.activeSounds.get(path);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.activeSounds.delete(path);
    }
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    this.activeSounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeSounds.clear();
  }

  /**
   * Set global volume for all sounds
   * @param volume - Volume level (0-1)
   */
  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume of all active sounds
    this.activeSounds.forEach((audio) => {
      if (!this.isMuted) {
        audio.volume = this.globalVolume;
      }
    });
  }

  /**
   * Get current global volume
   */
  getVolume(): number {
    return this.globalVolume;
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    this.isMuted = true;
    this.activeSounds.forEach((audio) => {
      audio.volume = 0;
    });
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    this.isMuted = false;
    this.activeSounds.forEach((audio) => {
      audio.volume = this.globalVolume;
    });
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if audio is muted
   */
  isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Get count of active sounds
   */
  getActiveCount(): number {
    return this.activeSounds.size;
  }

  /**
   * Cleanup all audio resources
   */
  cleanup(): void {
    this.stopAll();
    this.audioCache.clear();
    this.failedLoads.clear();
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
