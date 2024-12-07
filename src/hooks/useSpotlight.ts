import { useState, useCallback } from 'react';

interface SpotlightOptions {
  duration?: number;
  radius?: number;
  opacity?: number;
}

export function useSpotlight() {
  const [spotlightPosition, setSpotlightPosition] = useState<{ x: number; y: number } | null>(null);
  const [isActive, setIsActive] = useState(false);

  const showSpotlight = useCallback((position: { x: number; y: number }, options: SpotlightOptions = {}) => {
    const { duration = 4000 } = options;
    
    setSpotlightPosition(position);
    setIsActive(true);

    // Automatically hide spotlight after duration
    setTimeout(() => {
      setIsActive(false);
      setTimeout(() => setSpotlightPosition(null), 1000); // Wait for fade out animation
    }, duration);
  }, []);

  const hideSpotlight = useCallback(() => {
    setIsActive(false);
    setTimeout(() => setSpotlightPosition(null), 1000);
  }, []);

  return {
    spotlightPosition,
    isActive,
    showSpotlight,
    hideSpotlight
  };
}