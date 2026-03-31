'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ParticleType = 'confetti' | 'sparkle' | 'fire';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  shape: 'circle' | 'square' | 'triangle';
}

interface ParticleSystemProps {
  type: ParticleType;
  trigger: boolean;
  originX?: number;   // 0~100 (% of container)
  originY?: number;   // 0~100 (% of container)
  count?: number;
  duration?: number;   // ms
  className?: string;
}

const COLORS: Record<ParticleType, string[]> = {
  confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
  sparkle: ['#FFD700', '#FFF8DC', '#FFFACD', '#FAFAD2', '#FFE4B5', '#FFFFFF'],
  fire: ['#FF4500', '#FF6347', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00'],
};

function createParticle(id: number, type: ParticleType, originX: number, originY: number): Particle {
  const colors = COLORS[type];
  const angle = Math.random() * Math.PI * 2;
  const speed = type === 'fire'
    ? 1 + Math.random() * 3
    : 2 + Math.random() * 5;

  return {
    id,
    x: originX + (Math.random() - 0.5) * 10,
    y: originY + (Math.random() - 0.5) * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: type === 'sparkle' ? 3 + Math.random() * 5 : 5 + Math.random() * 8,
    rotation: Math.random() * 360,
    velocityX: Math.cos(angle) * speed,
    velocityY: type === 'fire'
      ? -(2 + Math.random() * 4)  // fire always goes up
      : Math.sin(angle) * speed,
    shape: type === 'confetti'
      ? (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)]
      : type === 'sparkle' ? 'circle' : 'circle',
  };
}

function ParticleShape({ particle, type }: { particle: Particle; type: ParticleType }) {
  if (type === 'sparkle') {
    return (
      <div
        className="absolute rounded-full"
        style={{
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        }}
      />
    );
  }

  if (particle.shape === 'triangle') {
    return (
      <div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          borderLeft: `${particle.size / 2}px solid transparent`,
          borderRight: `${particle.size / 2}px solid transparent`,
          borderBottom: `${particle.size}px solid ${particle.color}`,
        }}
      />
    );
  }

  return (
    <div
      className="absolute"
      style={{
        width: particle.size,
        height: particle.shape === 'square' ? particle.size : particle.size * 0.6,
        backgroundColor: particle.color,
        borderRadius: particle.shape === 'circle' ? '50%' : '1px',
      }}
    />
  );
}

export default function ParticleSystem({
  type,
  trigger,
  originX = 50,
  originY = 50,
  count = 30,
  duration = 1200,
  className = '',
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const emit = useCallback(() => {
    const newParticles = Array.from({ length: count }, (_, i) =>
      createParticle(Date.now() + i, type, originX, originY)
    );
    setParticles(newParticles);

    setTimeout(() => {
      setParticles([]);
    }, duration);
  }, [type, originX, originY, count, duration]);

  useEffect(() => {
    if (trigger) {
      emit();
    }
  }, [trigger, emit]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-50 overflow-hidden ${className}`}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              rotate: p.rotation,
              scale: 1,
              opacity: 1,
            }}
            animate={{
              left: `${p.x + p.velocityX * 15}%`,
              top: `${p.y + p.velocityY * 15}%`,
              rotate: p.rotation + (Math.random() > 0.5 ? 360 : -360),
              scale: type === 'fire' ? 0 : 0.2,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: duration / 1000,
              ease: type === 'fire' ? 'easeOut' : 'easeInOut',
            }}
            className="absolute"
          >
            <ParticleShape particle={p} type={type} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
