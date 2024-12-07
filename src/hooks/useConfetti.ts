import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireSalesConfetti = useCallback((count: number) => {
    // Default colors matching our theme
    const colors = ['#10B981', '#6366F1', '#F59E0B'];
    
    const fireConfetti = (particleRatio: number, opts: confetti.Options) => {
      confetti({
        particleCount: Math.floor(200 * particleRatio),
        spread: 60,
        origin: { y: 0.6 },
        colors,
        ...opts,
      });
    };

    // For small deals (1-2)
    if (count <= 2) {
      fireConfetti(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      return;
    }

    // For medium deals (3-5)
    if (count <= 5) {
      // Fire from left
      fireConfetti(0.5, {
        spread: 60,
        origin: { x: 0.2 },
        angle: 60,
      });
      
      // Fire from right
      setTimeout(() => {
        fireConfetti(0.5, {
          spread: 60,
          origin: { x: 0.8 },
          angle: 120,
        });
      }, 100);
      return;
    }

    // For large deals (6+)
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const interval: NodeJS.Timer = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Fire multiple bursts
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.2, 0.8), y: Math.random() - 0.2 },
        colors,
      });
    }, 250);
  }, []);

  return { fireSalesConfetti };
}

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}