'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import AgentAvatar from './AgentAvatar';
import ParticleField from './ParticleField';
import type { AgentState } from '@/lib/types';

interface SceneProps {
  agentState: AgentState;
}

export default function Scene({ agentState }: SceneProps) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <fog attach="fog" args={['#02040a', 2, 10]} />
        <ambientLight intensity={0.2} />
        <ParticleField />
        <AgentAvatar agentState={agentState} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
