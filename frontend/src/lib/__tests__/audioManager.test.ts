/**
 * Tests for AudioManager
 */

import { AudioManager } from '../audioManager';

// Mock HTMLAudioElement
class MockAudio {
  src: string = '';
  volume: number = 1;
  loop: boolean = false;
  currentTime: number = 0;
  
  constructor(src?: string) {
    if (src) this.src = src;
  }
  
  load() {
    // Simulate successful load
    setTimeout(() => {
      const event = new Event('canplaythrough');
      this.dispatchEvent(event);
    }, 0);
  }
  
  play() {
    return Promise.resolve();
  }
  
  pause() {}
  
  cloneNode() {
    return new MockAudio(this.src);
  }
  
  addEventListener(event: string, handler: any) {
    if (event === 'canplaythrough') {
      setTimeout(() => handler(), 0);
    }
  }
  
  removeEventListener() {}
  
  dispatchEvent(event: Event) {
    return true;
  }
}

// Mock global Audio
global.Audio = MockAudio as any;

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.cleanup();
  });

  describe('preloadAudio', () => {
    it('should preload audio file successfully', async () => {
      await audioManager.preloadAudio('/test.mp3');
      expect(audioManager.getActiveCount()).toBe(0);
    });

    it('should handle failed audio loads gracefully', async () => {
      // This should not throw
      await audioManager.preloadAudio('/nonexistent.mp3');
      expect(audioManager.getActiveCount()).toBe(0);
    });
  });

  describe('play', () => {
    it('should play audio file', async () => {
      await audioManager.preloadAudio('/test.mp3');
      audioManager.play('/test.mp3');
      expect(audioManager.getActiveCount()).toBeGreaterThan(0);
    });

    it('should prevent overlapping sounds', async () => {
      await audioManager.preloadAudio('/test.mp3');
      audioManager.play('/test.mp3');
      audioManager.play('/test.mp3');
      // Should only have one active sound due to overlap prevention
      expect(audioManager.getActiveCount()).toBe(1);
    });
  });

  describe('volume control', () => {
    it('should set global volume', () => {
      audioManager.setVolume(0.5);
      expect(audioManager.getVolume()).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      audioManager.setVolume(1.5);
      expect(audioManager.getVolume()).toBe(1);
      
      audioManager.setVolume(-0.5);
      expect(audioManager.getVolume()).toBe(0);
    });
  });

  describe('mute functionality', () => {
    it('should mute audio', () => {
      audioManager.mute();
      expect(audioManager.isMutedState()).toBe(true);
    });

    it('should unmute audio', () => {
      audioManager.mute();
      audioManager.unmute();
      expect(audioManager.isMutedState()).toBe(false);
    });

    it('should toggle mute state', () => {
      expect(audioManager.isMutedState()).toBe(false);
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(true);
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(false);
    });
  });

  describe('stopAll', () => {
    it('should stop all active sounds', async () => {
      await audioManager.preloadAudio('/test1.mp3');
      await audioManager.preloadAudio('/test2.mp3');
      audioManager.play('/test1.mp3');
      audioManager.play('/test2.mp3');
      
      audioManager.stopAll();
      expect(audioManager.getActiveCount()).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup all resources', async () => {
      await audioManager.preloadAudio('/test.mp3');
      audioManager.play('/test.mp3');
      
      audioManager.cleanup();
      expect(audioManager.getActiveCount()).toBe(0);
    });
  });
});
