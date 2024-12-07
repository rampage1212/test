import { createContext, useContext, ReactNode } from 'react';
import { SpotlightEffect } from './SpotlightEffect';
import { useSpotlight } from '@/hooks/useSpotlight';

interface EffectsContextType {
  showSpotlight: (position: { x: number; y: number }) => void;
  hideSpotlight: () => void;
}

const EffectsContext = createContext<EffectsContextType | null>(null);

export function useEffects() {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within an EffectsProvider');
  }
  return context;
}

interface EffectsProviderProps {
  children: ReactNode;
}

export function EffectsProvider({ children }: EffectsProviderProps) {
  const { spotlightPosition, isActive, showSpotlight, hideSpotlight } = useSpotlight();

  return (
    <EffectsContext.Provider value={{ showSpotlight, hideSpotlight }}>
      {children}
      <SpotlightEffect
        position={spotlightPosition}
        isActive={isActive}
        radius={150}
        opacity={0.85}
      />
    </EffectsContext.Provider>
  );
}