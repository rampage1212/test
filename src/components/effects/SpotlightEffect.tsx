import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightEffectProps {
  position: { x: number; y: number } | null;
  isActive: boolean;
  radius?: number;
  opacity?: number;
}

export function SpotlightEffect({ 
  position, 
  isActive, 
  radius = 150, 
  opacity = 0.85 
}: SpotlightEffectProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !position) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] pointer-events-none transition-all duration-1000",
        isActive ? "opacity-100" : "opacity-0"
      )}
      style={{
        background: `radial-gradient(
          circle ${radius}px at ${position.x}px ${position.y}px,
          transparent 0%,
          rgba(0, 0, 0, ${opacity}) ${radius}px
        )`
      }}
    />
  );
}