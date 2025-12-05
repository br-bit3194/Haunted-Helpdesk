/**
 * ScaryEffects - Component for managing particle systems and visual effects
 * Handles smoke, sparks, and blood splatter particles
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  opacity: number;
  velocity: [number, number, number];
  lifetime: number;
}

export interface EffectsConfig {
  smoke: ParticleConfig;
  sparks: ParticleConfig;
  bloodSplatter: ParticleConfig;
}

// Default scary effects configuration
export const SCARY_EFFECTS: EffectsConfig = {
  smoke: {
    count: 50,
    size: 0.5,
    color: '#666666',
    opacity: 0.6,
    velocity: [0, 0.5, 0],
    lifetime: 2.0,
  },
  sparks: {
    count: 30,
    size: 0.1,
    color: '#ff6600',
    opacity: 1.0,
    velocity: [0.5, 0.5, 0.5],
    lifetime: 0.5,
  },
  bloodSplatter: {
    count: 20,
    size: 0.2,
    color: '#8b0000',
    opacity: 0.8,
    velocity: [0.3, -0.5, 0.3],
    lifetime: 1.0,
  },
};

export interface ScaryEffectsProps {
  modelRef?: React.RefObject<THREE.Group | null>;
  isHovering: boolean;
  isAttacking: boolean;
  enabled: boolean;
  config?: EffectsConfig;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

/**
 * Particle system component
 */
const ParticleSystem: React.FC<{
  config: ParticleConfig;
  active: boolean;
  position?: THREE.Vector3;
}> = ({ config, active, position = new THREE.Vector3(0, 0, 0) }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particlesData = useRef<Particle[]>([]);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  // Initialize particles
  useMemo(() => {
    particlesData.current = Array.from({ length: config.count }, () => ({
      position: new THREE.Vector3(
        position.x + (Math.random() - 0.5) * 0.5,
        position.y + (Math.random() - 0.5) * 0.5,
        position.z + (Math.random() - 0.5) * 0.5
      ),
      velocity: new THREE.Vector3(
        config.velocity[0] * (Math.random() - 0.5),
        config.velocity[1] * (Math.random() * 0.5 + 0.5),
        config.velocity[2] * (Math.random() - 0.5)
      ),
      life: 0,
      maxLife: config.lifetime,
    }));
  }, [config, position]);

  // Update particles each frame
  useFrame((state, delta) => {
    if (!active || !geometryRef.current) return;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const opacities = geometryRef.current.attributes.opacity?.array as Float32Array;

    particlesData.current.forEach((particle, i) => {
      if (active && particle.life < particle.maxLife) {
        // Update particle
        particle.life += delta;
        particle.position.add(particle.velocity.clone().multiplyScalar(delta));
        
        // Apply gravity to some particles
        particle.velocity.y -= 0.5 * delta;

        // Update position in geometry
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;

        // Update opacity based on life
        if (opacities) {
          const lifeRatio = 1 - (particle.life / particle.maxLife);
          opacities[i] = config.opacity * lifeRatio;
        }
      } else if (active) {
        // Reset particle
        particle.position.set(
          position.x + (Math.random() - 0.5) * 0.5,
          position.y + (Math.random() - 0.5) * 0.5,
          position.z + (Math.random() - 0.5) * 0.5
        );
        particle.velocity.set(
          config.velocity[0] * (Math.random() - 0.5),
          config.velocity[1] * (Math.random() * 0.5 + 0.5),
          config.velocity[2] * (Math.random() - 0.5)
        );
        particle.life = 0;
      } else {
        // Fade out when not active
        if (opacities) {
          opacities[i] = Math.max(0, opacities[i] - delta);
        }
      }
    });

    geometryRef.current.attributes.position.needsUpdate = true;
    if (geometryRef.current.attributes.opacity) {
      geometryRef.current.attributes.opacity.needsUpdate = true;
    }
  });

  // Create geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(config.count * 3);
    const opacities = new Float32Array(config.count);

    particlesData.current.forEach((particle, i) => {
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      opacities[i] = 0;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    return geo;
  }, [config.count]);

  return (
    <points ref={particlesRef}>
      <bufferGeometry ref={geometryRef} attach="geometry" {...geometry} />
      <pointsMaterial
        size={config.size}
        color={config.color}
        transparent
        opacity={config.opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  );
};

/**
 * Main ScaryEffects component
 */
export const ScaryEffects: React.FC<ScaryEffectsProps> = ({
  modelRef,
  isHovering,
  isAttacking,
  enabled,
  config = SCARY_EFFECTS,
}) => {
  const modelPosition = useMemo(() => {
    if (modelRef?.current) {
      return modelRef.current.position;
    }
    return new THREE.Vector3(0, 0, 0);
  }, [modelRef]);

  if (!enabled) return null;

  return (
    <group>
      {/* Smoke particles - active on hover */}
      <ParticleSystem
        config={config.smoke}
        active={isHovering}
        position={modelPosition}
      />

      {/* Sparks particles - active on attack */}
      <ParticleSystem
        config={config.sparks}
        active={isAttacking}
        position={modelPosition}
      />

      {/* Blood splatter particles - active on attack */}
      <ParticleSystem
        config={config.bloodSplatter}
        active={isAttacking}
        position={modelPosition}
      />
    </group>
  );
};

export default ScaryEffects;
