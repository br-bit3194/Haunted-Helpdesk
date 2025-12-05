'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useScaryAudio } from '../hooks/useScaryAudio';
import { useModelAnimations } from '../hooks/useModelAnimations';
import { useMouseTracking } from '../hooks/useMouseTracking';
import { ScaryEffects } from './ScaryEffects';

// Model configuration types
export type ModelType = 'pbr' | 'shaded';

export interface ModelConfig {
  type: ModelType;
  path: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

// Model configuration constants
export const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
  pbr: {
    type: 'pbr',
    path: '/models/base_basic_pbr.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  shaded: {
    type: 'shaded',
    path: '/models/base_basic_shaded.glb',
    scale: 1.0,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
};

// Lighting configuration interface
export interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
}

// Halloween-themed lighting configuration
export const HALLOWEEN_LIGHTING: LightingConfig = {
  ambient: {
    color: '#ff7518', // Pumpkin orange ambient
    intensity: 1.2,
  },
  directional: {
    color: '#9d4edd', // Phantom purple
    intensity: 2.0,
    position: [5, 5, 5],
  },
};

// Props interface for Model3DViewer component
export interface Model3DViewerProps {
  modelPath: string;
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  position?: [number, number, number];
  scale?: number;
  enableAudio?: boolean;
  enableAnimations?: boolean;
  enableEffects?: boolean;
  enableMouseTracking?: boolean;
  respectMotionPreference?: boolean;
}

// Loading fallback component
const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pumpkin-orange"></div>
        <p className="mt-4 text-spectral-green font-creepster">Loading 3D Model...</p>
      </div>
    </div>
  );
};

// Fallback UI component for errors
export const FallbackUI: React.FC<{ message?: string }> = ({ 
  message = 'Unable to load 3D model' 
}) => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center p-4">
        <div className="text-4xl mb-4">👻</div>
        <p className="text-cobweb-gray">{message}</p>
      </div>
    </div>
  );
};

// Error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class Model3DErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Model Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <FallbackUI />;
    }

    return this.props.children;
  }
}

// Model component that loads and displays the GLB with animations and mouse tracking
const Model: React.FC<{
  modelPath: string;
  position?: [number, number, number];
  scale?: number;
  enableAnimations?: boolean;
  enableMouseTracking?: boolean;
  onHover?: (hovering: boolean) => void;
  onClick?: () => void;
  mouseRotation?: { x: number; y: number };
}> = ({ 
  modelPath, 
  position = [0, 0, 0], 
  scale = 1,
  enableAnimations = false,
  enableMouseTracking = false,
  onHover,
  onClick,
  mouseRotation = { x: 0, y: 0 }
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, groupRef);
  
  // Initialize animations
  const modelAnimations = useModelAnimations(
    enableAnimations ? animations : undefined,
    enableAnimations ? mixer : null
  );

  // Apply mouse tracking rotation
  useFrame(() => {
    if (groupRef.current && enableMouseTracking) {
      // Smoothly rotate the model to follow mouse
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseRotation.y,
        0.1
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseRotation.x,
        0.1
      );
    }
  });

  // Cleanup function to dispose of resources
  useEffect(() => {
    return () => {
      // Dispose geometries, materials, and textures
      scene.traverse((object: any) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material: any) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={() => onHover?.(false)}
      onClick={onClick}
    >
      <primitive object={scene} />
    </group>
  );
};

// Internal Scene3D component
const Scene3D: React.FC<{
  modelPath: string;
  position?: [number, number, number];
  scale?: number;
  autoRotate?: boolean;
  enableZoom?: boolean;
  enableAudio?: boolean;
  enableAnimations?: boolean;
  enableEffects?: boolean;
  enableMouseTracking?: boolean;
}> = ({ 
  modelPath, 
  position, 
  scale, 
  autoRotate = true, 
  enableZoom = true,
  enableAudio = false,
  enableAnimations = false,
  enableEffects = false,
  enableMouseTracking = false
}) => {
  const modelRef = useRef<THREE.Group>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  // Audio hook
  const audio = useScaryAudio(enableAudio);

  // Mouse tracking hook
  const { targetRotation, isTracking } = useMouseTracking(enableMouseTracking);

  // Handle hover
  const handleHover = (hovering: boolean) => {
    setIsHovering(hovering);
    if (hovering && enableAudio) {
      audio.playHoverSound();
    }
  };

  // Handle click
  const handleClick = () => {
    if (enableAudio) {
      audio.playClickSound();
    }
    
    if (enableAnimations) {
      setIsAttacking(true);
      // Reset attack state after animation
      setTimeout(() => {
        setIsAttacking(false);
      }, 1500);
    }
  };

  return (
    <>
      {/* Halloween-themed lighting */}
      <ambientLight 
        color={HALLOWEEN_LIGHTING.ambient.color} 
        intensity={HALLOWEEN_LIGHTING.ambient.intensity} 
      />
      <directionalLight
        color={HALLOWEEN_LIGHTING.directional.color}
        intensity={HALLOWEEN_LIGHTING.directional.intensity}
        position={HALLOWEEN_LIGHTING.directional.position}
      />
      {/* Additional fill lights for better visibility */}
      <directionalLight
        color="#ffffff"
        intensity={1.5}
        position={[-5, 3, -5]}
      />
      <pointLight
        color="#ff7518"
        intensity={1.0}
        position={[0, 5, 0]}
      />
      
      {/* Eye glow effect - red point lights */}
      {isHovering && (
        <>
          <pointLight
            color="#ff0000"
            intensity={2.0}
            position={[0.2, 0.5, 0.5]}
          />
          <pointLight
            color="#ff0000"
            intensity={2.0}
            position={[-0.2, 0.5, 0.5]}
          />
        </>
      )}
      
      {/* Interactive controls - disable auto-rotate when mouse tracking */}
      <OrbitControls
        enableZoom={enableZoom}
        enablePan={false}
        autoRotate={autoRotate && !isTracking}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
        minDistance={2}
        maxDistance={10}
      />
      
      {/* 3D Model */}
      <Model 
        modelPath={modelPath} 
        position={position} 
        scale={scale}
        enableAnimations={enableAnimations}
        enableMouseTracking={enableMouseTracking}
        onHover={handleHover}
        onClick={handleClick}
        mouseRotation={targetRotation}
      />

      {/* Scary particle effects */}
      {enableEffects && (
        <ScaryEffects
          modelRef={modelRef}
          isHovering={isHovering}
          isAttacking={isAttacking}
          enabled={enableEffects}
        />
      )}
    </>
  );
};

// Main Model3DViewer component
export const Model3DViewer: React.FC<Model3DViewerProps> = ({
  modelPath,
  className = '',
  autoRotate = true,
  enableZoom = true,
  position = [0, 0, 0],
  scale = 1,
  enableAudio = false,
  enableAnimations = false,
  enableEffects = false,
  enableMouseTracking = false,
  respectMotionPreference = true,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    // Detect mobile devices
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // Check for prefers-reduced-motion
    if (respectMotionPreference) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [respectMotionPreference]);

  // Disable animations and effects if user prefers reduced motion
  const effectiveEnableAnimations = enableAnimations && !prefersReducedMotion;
  const effectiveEnableEffects = enableEffects && !prefersReducedMotion;
  const effectiveEnableMouseTracking = enableMouseTracking && !prefersReducedMotion;
  const effectiveAutoRotate = autoRotate && !prefersReducedMotion;

  return (
    <Model3DErrorBoundary>
      <div className={`w-full h-full ${className}`} aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          style={{ width: '100%', height: '100%', cursor: 'pointer' }}
          dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower pixel ratio on mobile for performance
          performance={{ min: 0.5 }} // Allow frame rate to drop to maintain performance
        >
          <Suspense fallback={null}>
            <Scene3D
              modelPath={modelPath}
              position={position}
              scale={scale}
              autoRotate={effectiveAutoRotate}
              enableZoom={enableZoom}
              enableAudio={enableAudio}
              enableAnimations={effectiveEnableAnimations}
              enableEffects={effectiveEnableEffects}
              enableMouseTracking={effectiveEnableMouseTracking}
            />
          </Suspense>
        </Canvas>
      </div>
    </Model3DErrorBoundary>
  );
};

export default Model3DViewer;
