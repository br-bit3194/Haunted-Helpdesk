# Design Document: 3D Model Integration

## Overview

This design implements interactive 3D model visualization on the Haunted Helpdesk landing page using React Three Fiber and Three.js. The solution will load GLB format 3D models from the `3d_model` directory and render them with interactive controls, proper lighting, and responsive behavior across devices. The implementation prioritizes seamless integration with the existing Next.js architecture, Halloween theme aesthetics, and accessibility standards.

## Architecture

### Component Hierarchy

```
page.tsx (Landing Page)
├── Model3DViewer (New Component)
│   ├── Canvas (from @react-three/fiber)
│   │   ├── Scene3D (Internal Component)
│   │   │   ├── Model (GLB Loader)
│   │   │   ├── Lighting Setup
│   │   │   └── Camera Controls
│   │   └── Suspense Boundary
│   └── LoadingFallback
```

### Technology Stack

- **React Three Fiber (@react-three/fiber)**: React renderer for Three.js, providing declarative 3D scene composition
- **Three.js**: Core 3D rendering engine with AnimationMixer for skeletal animations
- **@react-three/drei**: Helper components for common 3D patterns (OrbitControls, useGLTF, useAnimations, etc.)
- **@react-three/postprocessing**: Post-processing effects (bloom, color grading, vignette)
- **Next.js 16**: Existing framework with client-side rendering support
- **Framer Motion**: For entrance animations (already in use)
- **Web Audio API**: For spatial audio and sound effect management
- **Howler.js** (optional): Simplified audio library for cross-browser compatibility

### File Structure

```
frontend/
├── public/
│   ├── models/              # 3D model files
│   │   ├── base_basic_pbr.glb
│   │   └── base_basic_shaded.glb
│   └── sounds/              # New directory for audio assets
│       ├── ambient_hover.mp3
│       ├── scream_click.mp3
│       ├── growl.mp3
│       └── whisper.mp3
├── src/
│   ├── components/
│   │   ├── Model3DViewer.tsx      # Main 3D viewer component
│   │   └── ScaryEffects.tsx       # New: Particle and visual effects
│   ├── hooks/
│   │   ├── useScaryAudio.ts       # New: Audio management hook
│   │   ├── useModelAnimations.ts  # New: Animation control hook
│   │   └── useMouseTracking.ts    # New: Mouse tracking hook
│   └── lib/
│       └── audioManager.ts        # New: Audio pooling and management
```

## Components and Interfaces

### Model3DViewer Component

**Purpose**: Main component that renders the 3D model with controls, animations, audio, and scary effects.

**Props Interface**:
```typescript
interface Model3DViewerProps {
  modelPath: string;           // Path to GLB file
  className?: string;          // Optional Tailwind classes
  autoRotate?: boolean;        // Enable auto-rotation
  enableZoom?: boolean;        // Enable zoom controls
  position?: [number, number, number]; // Model position [x, y, z]
  scale?: number;              // Model scale factor
  enableAudio?: boolean;       // Enable scary sounds
  enableAnimations?: boolean;  // Enable scary animations
  enableEffects?: boolean;     // Enable particle effects
  enableMouseTracking?: boolean; // Enable mouse cursor following
  respectMotionPreference?: boolean; // Honor prefers-reduced-motion
}
```

**Key Features**:
- Client-side only rendering (uses "use client" directive)
- Suspense boundary for loading states
- Error boundary for graceful failure handling
- Responsive canvas sizing
- Touch and mouse interaction support
- Animation state management (idle, hover, attack)
- Audio playback on user interactions
- Particle effects synchronized with animations
- Accessibility controls for reduced motion

### Scene3D Internal Component

**Purpose**: Manages the 3D scene setup including model, lighting, camera, and animations.

**Responsibilities**:
- Load GLB model using useGLTF hook
- Configure lighting (ambient + directional for Halloween mood)
- Set up OrbitControls for user interaction
- Apply Halloween-themed lighting colors
- Initialize AnimationMixer for skeletal animations
- Manage animation state transitions (idle → hover → attack → idle)
- Apply glowing eye effects using emissive materials
- Coordinate with ScaryEffects component for particles

### ScaryEffects Component

**Purpose**: Manages particle systems and post-processing visual effects.

**Props Interface**:
```typescript
interface ScaryEffectsProps {
  modelRef: React.RefObject<THREE.Group>;
  isHovering: boolean;
  isAttacking: boolean;
  enabled: boolean;
}
```

**Responsibilities**:
- Render particle systems (smoke, sparks, blood splatter)
- Trigger particles based on animation state
- Apply post-processing effects (bloom, color grading)
- Synchronize effects with audio and animations
- Optimize particle count for mobile devices

### useScaryAudio Hook

**Purpose**: Custom hook for managing audio playback with pooling and error handling.

**Interface**:
```typescript
interface UseScaryAudioReturn {
  playHoverSound: () => void;
  playClickSound: () => void;
  stopAllSounds: () => void;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

function useScaryAudio(enabled: boolean): UseScaryAudioReturn;
```

**Responsibilities**:
- Preload audio files on component mount
- Manage audio pooling to prevent overlapping sounds
- Handle audio playback errors gracefully
- Respect autoplay policies and user preferences
- Provide volume and mute controls

### useModelAnimations Hook

**Purpose**: Custom hook for managing 3D model animation states and transitions.

**Interface**:
```typescript
interface UseModelAnimationsReturn {
  currentAnimation: 'idle' | 'hover' | 'attack';
  playIdle: () => void;
  playHover: () => void;
  playAttack: () => void;
  animationProgress: number;
}

function useModelAnimations(
  animations: THREE.AnimationClip[],
  mixer: THREE.AnimationMixer
): UseModelAnimationsReturn;
```

**Responsibilities**:
- Initialize animation actions from GLB clips
- Manage animation state machine
- Handle smooth transitions between animations
- Return to idle state after action animations complete
- Provide animation progress for synchronization

### useMouseTracking Hook

**Purpose**: Custom hook for tracking mouse position and calculating model rotation to follow cursor.

**Interface**:
```typescript
interface UseMouseTrackingReturn {
  targetRotation: { x: number; y: number };
  isTracking: boolean;
}

function useMouseTracking(
  enabled: boolean,
  sensitivity?: number,
  maxRotation?: { x: number; y: number }
): UseMouseTrackingReturn;
```

**Responsibilities**:
- Track mouse position across the viewport
- Convert mouse coordinates to rotation angles
- Apply sensitivity and rotation limits
- Smooth rotation changes using lerp (linear interpolation)
- Disable tracking when prefers-reduced-motion is enabled
- Handle touch events for mobile devices

## Data Models

### Model Configuration

```typescript
type ModelType = 'pbr' | 'shaded';

interface ModelConfig {
  type: ModelType;
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  pbr: {
    type: 'pbr',
    path: '/models/base_basic_pbr.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  shaded: {
    type: 'shaded',
    path: '/models/base_basic_shaded.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0]
  }
};
```

### Lighting Configuration

```typescript
interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  spotlight?: {
    color: string;
    intensity: number;
    position: [number, number, number];
    angle: number;
  };
  eyeGlow?: {
    color: string;
    intensity: number;
    emissive: string;
  };
}

const HALLOWEEN_LIGHTING: LightingConfig = {
  ambient: {
    color: '#ff7518',  // Pumpkin orange ambient
    intensity: 0.4
  },
  directional: {
    color: '#9d4edd',  // Phantom purple
    intensity: 0.8,
    position: [5, 5, 5]
  },
  eyeGlow: {
    color: '#ff0000',    // Red glow
    intensity: 2.0,
    emissive: '#ff0000'
  }
};
```

### Audio Configuration

```typescript
interface AudioConfig {
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

const SCARY_AUDIO: AudioConfig = {
  hover: {
    path: '/sounds/ambient_hover.mp3',
    volume: 0.5,
    loop: false
  },
  click: {
    path: '/sounds/scream_click.mp3',
    volume: 0.7,
    loop: false
  },
  ambient: {
    path: '/sounds/whisper.mp3',
    volume: 0.3,
    loop: true
  }
};
```

### Animation Configuration

```typescript
interface AnimationConfig {
  name: string;
  loop: boolean;
  clampWhenFinished: boolean;
  duration?: number;
  transitionDuration: number;
}

interface AnimationStateConfig {
  idle: AnimationConfig;
  hover: AnimationConfig;
  attack: AnimationConfig;
}

const ANIMATION_STATES: AnimationStateConfig = {
  idle: {
    name: 'Idle',
    loop: true,
    clampWhenFinished: false,
    transitionDuration: 0.3
  },
  hover: {
    name: 'Threaten',
    loop: true,
    clampWhenFinished: false,
    transitionDuration: 0.2
  },
  attack: {
    name: 'Attack',
    loop: false,
    clampWhenFinished: true,
    duration: 1.5,
    transitionDuration: 0.1
  }
};
```

### Particle Effects Configuration

```typescript
interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  opacity: number;
  velocity: [number, number, number];
  lifetime: number;
}

interface EffectsConfig {
  smoke: ParticleConfig;
  sparks: ParticleConfig;
  bloodSplatter: ParticleConfig;
}

const SCARY_EFFECTS: EffectsConfig = {
  smoke: {
    count: 50,
    size: 0.5,
    color: '#666666',
    opacity: 0.6,
    velocity: [0, 0.5, 0],
    lifetime: 2.0
  },
  sparks: {
    count: 30,
    size: 0.1,
    color: '#ff6600',
    opacity: 1.0,
    velocity: [0.5, 0.5, 0.5],
    lifetime: 0.5
  },
  bloodSplatter: {
    count: 20,
    size: 0.2,
    color: '#8b0000',
    opacity: 0.8,
    velocity: [0.3, -0.5, 0.3],
    lifetime: 1.0
  }
};
```

### Mouse Tracking Configuration

```typescript
interface MouseTrackingConfig {
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

const MOUSE_TRACKING: MouseTrackingConfig = {
  sensitivity: 0.5,           // Moderate sensitivity
  smoothing: 0.1,             // Smooth, gradual movement
  maxRotation: {
    x: Math.PI / 6,           // ±30 degrees vertical
    y: Math.PI / 4            // ±45 degrees horizontal
  },
  targetBone: 'Head',         // Track with head bone if available
  invertX: false,
  invertY: true               // Invert Y for natural "looking up" behavior
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Model rendering on page load

*For any* valid landing page load, the 3D viewer component should render a canvas element containing 3D scene content.

**Validates: Requirements 1.1**

### Property 2: Lighting configuration applied

*For any* rendered 3D scene, the scene should contain ambient and directional light objects with the configured Halloween-themed color values and intensity levels.

**Validates: Requirements 1.2, 3.2**

### Property 3: Interactive rotation enabled

*For any* user interaction event (mouse drag or touch gesture) on the 3D viewer, the camera position or model rotation should change in response to the input.

**Validates: Requirements 1.3**

### Property 4: Responsive canvas sizing

*For any* viewport size change, the 3D canvas dimensions should adjust to fit the container while maintaining aspect ratio.

**Validates: Requirements 3.4**

### Property 5: Accessibility attributes present

*For any* rendered 3D viewer component, the DOM should contain appropriate ARIA attributes (aria-label, aria-hidden, or role) for accessibility.

**Validates: Requirements 4.1**

### Property 6: Focus trap prevention

*For any* keyboard navigation sequence through the page, focus should not become trapped within the 3D viewer component and should continue to subsequent focusable elements.

**Validates: Requirements 4.3**

### Property 7: Existing accessibility preserved

*For any* landing page render with the 3D viewer, all existing accessibility features (skip links, ARIA labels, semantic HTML) should remain functional and present.

**Validates: Requirements 4.5**

### Property 8: Model selection by configuration

*For any* valid model type ('pbr' or 'shaded') passed as a prop, the component should load the corresponding GLB file from the correct path.

**Validates: Requirements 5.1, 5.2**

### Property 9: Error handling for invalid paths

*For any* invalid model file path, the component should catch the error, prevent crashes, and display a fallback state instead of the 3D model.

**Validates: Requirements 5.3**

### Property 10: Model switching via props

*For any* change to the model type prop, the component should unload the previous model and load the new model corresponding to the updated prop value.

**Validates: Requirements 5.5**

### Property 11: Hover triggers audio

*For any* hover event on the 3D model, the system should trigger audio playback of the configured hover sound effect.

**Validates: Requirements 6.1**

### Property 12: Click triggers audio

*For any* click event on the 3D model, the system should trigger audio playback of the configured click sound effect.

**Validates: Requirements 6.2**

### Property 13: Volume controls affect audio

*For any* volume control adjustment or mute toggle, the audio playback volume should change accordingly or be silenced.

**Validates: Requirements 6.3**

### Property 14: Audio preloading

*For any* audio file configured in the system, the audio element should be loaded and ready before the first user interaction.

**Validates: Requirements 6.4**

### Property 15: Audio overlap prevention

*For any* sequence of rapid audio trigger events, only one instance of each sound type should play at a time, preventing overlapping chaos.

**Validates: Requirements 6.5**

### Property 16: Motion preference respected

*For any* system state where prefers-reduced-motion is enabled, automatic animations and audio autoplay should be disabled.

**Validates: Requirements 6.6**

### Property 17: Hover triggers animation

*For any* hover event on the 3D model, the system should transition from idle animation to hover animation state.

**Validates: Requirements 7.2**

### Property 18: Click triggers animation

*For any* click event on the 3D model, the system should transition to attack animation state.

**Validates: Requirements 7.3**

### Property 19: Animation state returns to idle

*For any* non-looping animation that completes, the system should automatically transition back to the idle animation state.

**Validates: Requirements 7.4**

### Property 20: Interaction triggers particles

*For any* user interaction (hover or click) on the 3D model, the system should activate the corresponding particle effect system.

**Validates: Requirements 8.2**

### Property 21: Effects synchronized with animations

*For any* animation state change, visual effects and audio should be triggered at the same time, maintaining synchronization.

**Validates: Requirements 8.4**

### Property 22: Reduced motion disables animations

*For any* system state where prefers-reduced-motion is enabled, automatic animations should be disabled while manual interactions remain functional.

**Validates: Requirements 9.2**

### Property 23: Reduced motion allows interactions

*For any* system state where prefers-reduced-motion is enabled, user-triggered interactions should still work but with simplified or no animations.

**Validates: Requirements 9.3**

### Property 24: Effects toggle changes state

*For any* manual toggle of the effects control, the enabled state should change and persist in the component state.

**Validates: Requirements 9.4**

### Property 25: Preferences persist across reloads

*For any* user preference setting (mute, reduced effects), saving to localStorage and reloading the page should restore the same preference values.

**Validates: Requirements 9.5**

### Property 26: Audio error handling

*For any* invalid audio file path or loading error, the component should handle the error gracefully without crashing and interactions should continue to work.

**Validates: Requirements 10.3**

### Property 27: Mouse tracking rotates model

*For any* mouse movement across the viewport, the 3D model should rotate to face toward the cursor position.

**Validates: Requirements 11.1**

### Property 28: Smooth mouse tracking interpolation

*For any* rapid mouse movement, the model rotation should smoothly interpolate to the target rotation rather than jumping instantly.

**Validates: Requirements 11.2**

### Property 29: Mouse tracking rotation limits

*For any* mouse position, the model rotation should not exceed the configured maximum rotation angles in any axis.

**Validates: Requirements 11.3**

### Property 30: Reduced motion disables mouse tracking

*For any* system state where prefers-reduced-motion is enabled, mouse tracking should be disabled.

**Validates: Requirements 11.5**

## Error Handling

### Model Loading Errors

**Strategy**: Implement error boundaries and try-catch blocks around GLB loading operations.

**Error Types**:
1. **File Not Found (404)**: Model file doesn't exist at specified path
2. **Invalid GLB Format**: File exists but is corrupted or not a valid GLB
3. **Network Errors**: File fails to load due to network issues
4. **WebGL Not Supported**: Browser doesn't support WebGL rendering

**Handling Approach**:
```typescript
// Error boundary component
class Model3DErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI message="Unable to load 3D model" />;
    }
    return this.props.children;
  }
}

// Fallback UI component
const FallbackUI = ({ message }) => (
  <div className="flex items-center justify-center h-full">
    <p className="text-cobweb-gray">{message}</p>
  </div>
);
```

### Audio Loading Errors

**Strategy**: Gracefully degrade when audio fails to load, allowing visual interactions to continue.

**Error Types**:
1. **Audio File Not Found**: Sound file doesn't exist at specified path
2. **Unsupported Format**: Browser doesn't support the audio codec
3. **Autoplay Blocked**: Browser policy prevents audio autoplay
4. **Network Errors**: Audio file fails to download

**Handling Approach**:
```typescript
// Audio manager with error handling
class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private failedLoads: Set<string> = new Set();
  
  async preloadAudio(path: string): Promise<void> {
    try {
      const audio = new Audio(path);
      await audio.load();
      this.audioCache.set(path, audio);
    } catch (error) {
      console.warn(`Failed to load audio: ${path}`, error);
      this.failedLoads.add(path);
      // Continue without audio - don't crash
    }
  }
  
  play(path: string): void {
    if (this.failedLoads.has(path)) return; // Silent fail
    
    const audio = this.audioCache.get(path);
    if (audio) {
      audio.play().catch(err => {
        console.warn(`Audio playback failed: ${path}`, err);
      });
    }
  }
}
```

### Animation Errors

**Strategy**: Fall back to static model if animations fail to load or play.

**Error Types**:
1. **Missing Animation Clips**: GLB file doesn't contain expected animations
2. **Invalid Animation Data**: Animation clips are corrupted
3. **Animation Mixer Errors**: Three.js AnimationMixer fails

**Handling Approach**:
```typescript
// Safe animation initialization
function initializeAnimations(gltf: GLTF): AnimationAction[] | null {
  try {
    if (!gltf.animations || gltf.animations.length === 0) {
      console.warn('No animations found in model');
      return null;
    }
    
    const mixer = new THREE.AnimationMixer(gltf.scene);
    const actions = gltf.animations.map(clip => mixer.clipAction(clip));
    return actions;
  } catch (error) {
    console.error('Failed to initialize animations', error);
    return null; // Model will display without animations
  }
}
```

### Resource Cleanup

**Strategy**: Use React useEffect cleanup functions to dispose of Three.js resources.

```typescript
useEffect(() => {
  // Load model
  return () => {
    // Cleanup: dispose geometries, materials, textures
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
  };
}, [modelPath]);
```

### Performance Degradation

**Strategy**: Detect low frame rates and automatically reduce quality.

**Approach**:
- Monitor FPS using requestAnimationFrame
- If FPS drops below 30 for sustained period, disable auto-rotation
- On mobile devices, use lower-quality shaded model by default
- Provide manual quality toggle for users

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Test Cases**:
1. **Component Rendering**: Verify Model3DViewer renders without crashing
2. **Props Handling**: Test that props are correctly passed and applied
3. **Loading States**: Verify loading indicator appears during model load
4. **Error States**: Test fallback UI appears on loading errors
5. **Accessibility**: Verify ARIA attributes are present
6. **Model Path Resolution**: Test correct paths are generated for different model types
7. **Audio Hook**: Test useScaryAudio hook initializes and manages audio state
8. **Animation Hook**: Test useModelAnimations hook manages animation state transitions
9. **Hover Interactions**: Test hover events trigger audio and animation changes
10. **Click Interactions**: Test click events trigger audio and animation changes
11. **Mute Functionality**: Test mute toggle affects audio playback
12. **Reduced Motion**: Test prefers-reduced-motion disables animations
13. **Preference Persistence**: Test localStorage saves and restores user preferences
14. **Audio Error Handling**: Test component continues to work when audio fails to load
15. **Animation Fallback**: Test model displays correctly when animations are missing

**Example Tests**:
```typescript
describe('Model3DViewer', () => {
  it('should render loading state initially', () => {
    render(<Model3DViewer modelPath="/models/test.glb" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
  
  it('should have aria-hidden attribute when decorative', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" />
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
  
  it('should play audio on hover when enabled', () => {
    const { container } = render(
      <Model3DViewer modelPath="/models/test.glb" enableAudio={true} />
    );
    const canvas = container.querySelector('canvas');
    fireEvent.mouseEnter(canvas);
    // Verify audio playback was triggered
  });
  
  it('should respect prefers-reduced-motion', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    
    render(<Model3DViewer modelPath="/models/test.glb" respectMotionPreference={true} />);
    // Verify animations are disabled
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Each property test should run a minimum of 100 iterations.

**Test Properties**:

1. **Model Loading Property**: For any valid model path, the component should successfully load and render
2. **Lighting Consistency Property**: For any lighting configuration, all specified lights should be present in the scene
3. **Responsive Sizing Property**: For any viewport dimensions, the canvas should fit within its container
4. **Accessibility Property**: For any component render, required ARIA attributes should be present
5. **Error Recovery Property**: For any invalid model path, the component should render fallback UI without crashing

**Example Property Tests**:
```typescript
import fc from 'fast-check';

describe('Model3DViewer Properties', () => {
  it('should handle any viewport size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 3840 }), // width
        fc.integer({ min: 240, max: 2160 }), // height
        (width, height) => {
          // **Feature: 3d-model-integration, Property 4: Responsive canvas sizing**
          const { container } = render(
            <div style={{ width, height }}>
              <Model3DViewer modelPath="/models/test.glb" />
            </div>
          );
          const canvas = container.querySelector('canvas');
          expect(canvas.width).toBeLessThanOrEqual(width);
          expect(canvas.height).toBeLessThanOrEqual(height);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should prevent audio overlap for rapid interactions', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }), // number of rapid clicks
        (clickCount) => {
          // **Feature: 3d-model-integration, Property 15: Audio overlap prevention**
          const audioManager = new AudioManager();
          const playingSounds = new Set();
          
          // Simulate rapid clicks
          for (let i = 0; i < clickCount; i++) {
            audioManager.play('/sounds/scream_click.mp3');
          }
          
          // Verify only one instance is playing
          expect(audioManager.getActiveCount()).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should persist preferences across reloads', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // isMuted
        fc.boolean(), // effectsEnabled
        (isMuted, effectsEnabled) => {
          // **Feature: 3d-model-integration, Property 25: Preferences persist across reloads**
          const prefs = { isMuted, effectsEnabled };
          localStorage.setItem('scary3d-prefs', JSON.stringify(prefs));
          
          const loaded = JSON.parse(localStorage.getItem('scary3d-prefs'));
          expect(loaded).toEqual(prefs);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Scope**: Test Model3DViewer integration with landing page

**Test Cases**:
1. **Page Layout**: Verify 3D model doesn't break existing layout
2. **Z-Index Layering**: Ensure model appears behind/in front of correct elements
3. **Animation Coordination**: Test that Framer Motion animations work alongside 3D rendering
4. **Performance**: Verify page load time remains acceptable with 3D model

### Visual Regression Testing

**Tool**: Playwright or Chromatic

**Test Cases**:
1. Capture screenshots of landing page with 3D model on desktop
2. Capture screenshots on mobile viewport
3. Compare against baseline to detect unintended visual changes

## Implementation Plan

### Phase 1: Setup and Dependencies

1. Install required packages:
   - `@react-three/fiber`
   - `@react-three/drei`
   - `@react-three/postprocessing`
   - `three` (peer dependency)
   - `howler` (optional, for audio management)

2. Copy GLB files to `frontend/public/models/` directory

3. Create `frontend/public/sounds/` directory and add audio files

4. Configure Next.js to handle GLB and audio files (if needed)

### Phase 2: Core Component Development

1. Create `Model3DViewer.tsx` component with basic structure
2. Implement GLB loading using useGLTF hook
3. Set up Canvas and Scene3D components
4. Add OrbitControls for interaction
5. Configure lighting setup with glowing eyes

### Phase 3: Audio System

1. Create `audioManager.ts` utility for audio pooling
2. Implement `useScaryAudio` hook for audio playback
3. Add audio preloading on component mount
4. Implement volume controls and mute functionality
5. Add audio error handling and graceful degradation

### Phase 4: Animation System

1. Implement `useModelAnimations` hook for animation state management
2. Set up AnimationMixer for skeletal animations
3. Create animation state machine (idle → hover → attack → idle)
4. Add smooth transitions between animation states
5. Handle missing animations gracefully

### Phase 5: Scary Visual Effects

1. Create `ScaryEffects.tsx` component for particle systems
2. Implement smoke, sparks, and blood splatter particles
3. Add post-processing effects (bloom, color grading)
4. Synchronize effects with animations and audio
5. Optimize particle count for mobile devices

### Phase 6: Mouse Tracking System

1. Implement `useMouseTracking` hook for cursor following
2. Track mouse position and convert to rotation angles
3. Apply smooth interpolation (lerp) for natural movement
4. Integrate tracking into Scene3D component
5. Test rotation limits and sensitivity settings

### Phase 7: Interaction Handlers

1. Add hover event handlers to trigger audio and animations
2. Add click event handlers for attack animations and screams
3. Implement interaction state management
4. Add visual feedback for interactions (cursor changes)
5. Test touch interactions on mobile devices

### Phase 8: Accessibility and Preferences

1. Detect prefers-reduced-motion media query
2. Implement reduced motion mode (disable auto-animations)
3. Create manual toggle for effects and audio
4. Persist user preferences to localStorage
5. Add ARIA attributes and keyboard navigation support

### Phase 9: Integration and Styling

1. Import Model3DViewer into landing page
2. Position component in hero section or as background element
3. Apply Tailwind styling for responsive behavior
4. Integrate with Framer Motion for entrance animations
5. Adjust z-index and positioning to fit design

### Phase 10: Error Handling and Polish

1. Implement error boundary for 3D, audio, and animation errors
2. Create fallback UI component
3. Add loading indicator
4. Implement resource cleanup (dispose geometries, materials, audio)
5. Add performance monitoring and FPS tracking

### Phase 11: Testing and Optimization

1. Write unit tests for all components and hooks
2. Write property-based tests for interactions and state management
3. Perform accessibility audit with screen readers
4. Test on multiple devices and browsers
5. Optimize model and audio loading (lazy loading, compression)
6. Performance profiling and optimization
7. Test with various network conditions

## Interaction Flow and State Management

### User Interaction States

The 3D model has three primary states that coordinate animations, audio, and visual effects:

1. **Idle State** (Default)
   - Animation: Looping idle animation (breathing, subtle movement)
   - Audio: Optional ambient whisper loop at low volume
   - Effects: Glowing eyes, minimal particle effects
   - Lighting: Standard Halloween lighting
   - Mouse Tracking: Active - model head/eyes follow cursor smoothly

2. **Hover State** (Mouse over model)
   - Animation: Transition to threatening pose or attention-getting movement
   - Audio: Play scary ambient sound (growl, hiss)
   - Effects: Increase eye glow intensity, add smoke particles
   - Lighting: Intensify directional light
   - Mouse Tracking: Active - continues tracking with increased intensity

3. **Attack State** (Click on model)
   - Animation: Play attack or jump-scare animation (non-looping)
   - Audio: Play scream or loud scary sound
   - Effects: Trigger blood splatter or sparks particles, screen shake
   - Lighting: Flash effect with red tint
   - Mouse Tracking: Paused - animation takes full control
   - Transition: Return to idle state when animation completes

### State Transition Diagram

```
     ┌─────────┐
     │  Idle   │◄─────────────────┐
     └────┬────┘                  │
          │                       │
    Mouse Enter                   │
          │                       │
          ▼                       │
     ┌─────────┐            Animation
     │  Hover  │            Complete
     └────┬────┘                  │
          │                       │
       Click                      │
          │                       │
          ▼                       │
     ┌─────────┐                  │
     │ Attack  │──────────────────┘
     └─────────┘
```

### Synchronization Strategy

To ensure audio, animations, and effects feel cohesive:

1. **Event-Driven Architecture**: All state changes emit events that trigger coordinated updates
2. **Timing Coordination**: Use animation progress to trigger effects at specific keyframes
3. **Shared State**: Use React context or state management to share interaction state across components
4. **Cleanup**: Cancel pending effects when state changes (e.g., user clicks during hover)

**Example Coordination Code**:
```typescript
function handleClick() {
  // Cancel any hover effects
  cancelHoverEffects();
  
  // Coordinate all systems
  const attackDuration = playAttackAnimation(); // Returns animation duration
  playScreamSound();
  triggerBloodSplatter();
  
  // Return to idle after attack completes
  setTimeout(() => {
    playIdleAnimation();
  }, attackDuration * 1000);
}
```

## Deployment Considerations

### Asset Optimization

- **Model Compression**: Use glTF-Transform or similar tools to compress GLB files
- **Lazy Loading**: Load 3D model only when visible in viewport
- **Progressive Enhancement**: Show static image placeholder on low-end devices

### Browser Compatibility

- **WebGL Support**: Detect WebGL availability and show fallback for unsupported browsers
- **Mobile Performance**: Use shaded model on mobile by default
- **Safari Considerations**: Test thoroughly on iOS Safari (known WebGL quirks)

### Monitoring

- **Error Tracking**: Log 3D loading errors to monitoring service
- **Performance Metrics**: Track 3D render time and FPS
- **User Analytics**: Monitor interaction rates with 3D model

## Recommended Model for Production

**Recommendation**: Use `base_basic_shaded.glb` for production deployment.

**Rationale**:
- Better performance on mobile devices and lower-end hardware
- Faster loading time due to simpler materials
- Sufficient visual quality for decorative purposes
- Lower bandwidth consumption

**PBR Model Use Case**: Reserve `base_basic_pbr.glb` for high-end desktop experiences or as an optional "high quality" mode that users can enable.

## Future Enhancements

1. **Model Variants**: Support multiple 3D models that change based on time of day or random selection (ghost, vampire, zombie, etc.)
2. **Advanced Animations**: Add more complex animation sequences (combo attacks, special moves)
3. **Voice Lines**: Add actual voice acting with multiple scary phrases and taunts
4. **Spatial Audio**: Use Web Audio API's 3D positioning for immersive directional sound
5. **AR Support**: Enable AR viewing on compatible mobile devices for real-world scares
6. **Model Customization**: Allow users to change model colors, accessories, or scare intensity
7. **Multiplayer Scares**: Allow users to trigger scares for other visitors viewing the page
8. **Adaptive Difficulty**: Increase scare intensity based on user interaction patterns
9. **Story Mode**: Create a sequence of interactions that tell a scary story
10. **Achievement System**: Track user interactions and unlock special animations or effects
