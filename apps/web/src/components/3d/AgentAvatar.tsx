'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { AgentState } from '@/lib/types';

interface AgentAvatarProps {
  agentState: AgentState;
}

export default function AgentAvatar({ agentState }: AgentAvatarProps) {
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const colors = useMemo(() => {
    return {
      idle: new THREE.Color('#3a0a6e'),
      connecting: new THREE.Color('#7b2fff'),
      listening: new THREE.Color('#00f5ff'),
      thinking: new THREE.Color('#ff006e'),
      speaking: new THREE.Color('#39ff14'),
      ended: new THREE.Color('#222222'),
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const targetColor = colors[agentState] || colors.idle;

    // Smooth color transition
    if (innerRef.current) {
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      mat.color.lerp(targetColor, delta * 2);
      mat.emissive.lerp(targetColor, delta * 2);
    }
    
    if (lightRef.current) {
      lightRef.current.color.lerp(targetColor, delta * 2);
    }

    // Base rotation
    if (outerRef.current) {
      outerRef.current.rotation.x = time * 0.2;
      outerRef.current.rotation.y = time * 0.3;
    }

    // State specific animations
    let ringSpeed = 0.5;
    let pulseScale = 1;

    switch (agentState) {
      case 'idle':
        ringSpeed = 0.2;
        break;
      case 'listening':
        ringSpeed = 0.5;
        pulseScale = 1 + Math.sin(time * 3) * 0.05;
        break;
      case 'thinking':
        ringSpeed = 2.0;
        pulseScale = 0.95;
        if (outerRef.current) outerRef.current.rotation.y = time * 1.5;
        break;
      case 'speaking':
        ringSpeed = 1.0;
        pulseScale = 1 + Math.sin(time * 8) * 0.15; // fast breath
        // color flicker
        if (innerRef.current && Math.random() > 0.9) {
           const mat = innerRef.current.material as THREE.MeshStandardMaterial;
           mat.emissiveIntensity = 1.5 + Math.random();
        }
        break;
    }

    // Apply scale and ring rotation
    if (innerRef.current) {
      innerRef.current.scale.setScalar(THREE.MathUtils.lerp(innerRef.current.scale.x, pulseScale, delta * 5));
      const mat = innerRef.current.material as THREE.MeshStandardMaterial;
      if (agentState !== 'speaking') mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.8, delta * 2);
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * ringSpeed;
      ring1Ref.current.rotation.y = time * ringSpeed * 1.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -time * ringSpeed * 1.1;
      ring2Ref.current.rotation.z = time * ringSpeed * 0.9;
    }
  });

  return (
    <group>
      {/* Inner Glowing Core */}
      <Icosahedron ref={innerRef} args={[1, 3]}>
        <meshStandardMaterial 
          color="#3a0a6e"
          emissive="#3a0a6e"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </Icosahedron>

      {/* Point Light from Core */}
      <pointLight ref={lightRef} distance={10} intensity={2} />

      {/* Outer Wireframe */}
      <group ref={outerRef}>
        <Icosahedron args={[1.2, 1]}>
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
        </Icosahedron>
      </group>

      {/* Orbiting Rings */}
      <Torus ref={ring1Ref} args={[1.5, 0.02, 16, 100]}>
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.3} />
      </Torus>
      <Torus ref={ring2Ref} args={[1.8, 0.01, 16, 100]}>
        <meshBasicMaterial color="#7b2fff" transparent opacity={0.2} />
      </Torus>
    </group>
  );
}
