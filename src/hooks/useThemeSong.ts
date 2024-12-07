import { useCallback } from 'react';

export function useThemeSong() {
  const silenceThemeSong = useCallback(() => {
    // Find all audio elements and stop them
    const audioElements = document.getElementsByTagName('audio');
    Array.from(audioElements).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  return { silenceThemeSong };
}