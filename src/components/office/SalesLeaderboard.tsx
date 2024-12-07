import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useUsers } from '@/lib/hooks/useUsers';
import { useSalesLeaderboard } from '@/lib/hooks/useLeaderboardData';
import { useConfetti } from '@/hooks/useConfetti';
import { useEffects } from '@/components/effects/EffectsProvider';
import { useEffect, useRef, useState, useCallback } from 'react';
import { getThemeSongUrl } from '@/lib/services/themeService';
import { toast } from '@/components/ui/use-toast';

export function SalesLeaderboard() {
  const { users } = useUsers();
  const { entries, loading, error } = useSalesLeaderboard();
  const { fireSalesConfetti } = useConfetti();
  const { showSpotlight, hideSpotlight } = useEffects();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const prevEntriesRef = useRef<Record<string, number>>({});

  // Helper function to get ordinal suffix
  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
    };

    // Add interaction listeners
    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const playAudio = useCallback(async () => {
    if (!hasUserInteracted) {
      console.log('Audio playback waiting for user interaction');
      return;
    }

    try {
      if (audioRef.current) {
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [hasUserInteracted]);

  // Monitor individual user's total deals and trigger celebration
  useEffect(() => {
    if (!entries.length) return;

    const currentEntries = entries.reduce((acc, entry) => {
      acc[entry.userId] = entry.count;
      return acc;
    }, {} as Record<string, number>);

    // Find which user got new deals
    entries.forEach(async (entry) => {
      const prevCount = prevEntriesRef.current[entry.userId] || 0;
      const currentCount = currentEntries[entry.userId];

      if (currentCount > prevCount) {
        const user = users.find(u => u.id === entry.userId);
        if (!user) return;

        // Show celebration toast that stays until dismissed
        toast({
          title: "🎉 Deal Closed! 🎉",
          description: (
            <div className="text-center">
              <p className="font-semibold text-lg mb-1">{user.name}</p>
              <p>Just closed their {currentCount}{getOrdinalSuffix(currentCount)} deal!</p>
            </div>
          ),
          className: "gradient-toast",
          duration: Infinity, // Toast stays until manually dismissed
        });

        // Find user's avatar element to center spotlight
        const userAvatar = document.querySelector(`[data-user-id="${entry.userId}"]`) as HTMLElement;
        if (userAvatar) {
          const rect = userAvatar.getBoundingClientRect();
          const spotlightPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };

          // Show spotlight
          showSpotlight(spotlightPosition);

          // Fire confetti
          fireSalesConfetti(currentCount);

          // Play theme song if exists
          try {
            const songUrl = await getThemeSongUrl(entry.userId);
            if (songUrl && audioRef.current) {
              // Stop any currently playing audio
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              
              // Set up new audio
              audioRef.current.src = songUrl;
              audioRef.current.volume = 0.5;
              
              // Play for 15 seconds then fade out
              await playAudio();
              setTimeout(() => {
                if (audioRef.current) {
                  // Fade out over 2 seconds
                  const fadeOut = setInterval(() => {
                    if (audioRef.current && audioRef.current.volume > 0.1) {
                      audioRef.current.volume -= 0.1;
                    } else {
                      clearInterval(fadeOut);
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                      }
                    }
                  }, 200);
                }
              }, 15000);
            }
          } catch (error) {
            console.error('Error playing theme song:', error);
          }

          // Hide spotlight after 4 seconds
          setTimeout(() => {
            hideSpotlight();
          }, 4000);
        }
      }
    });

    prevEntriesRef.current = currentEntries;
  }, [entries, users, fireSalesConfetti, showSpotlight, hideSpotlight]);

  if (loading) {
    return (
      <Card className="w-[250px] bg-background/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Sales Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse bg-muted rounded" />
                <div className="h-3 w-16 animate-pulse bg-muted rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-[250px] bg-background/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Sales Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error loading sales data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-[250px] bg-background/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Sales Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.map((entry, index) => {
            const user = users.find(u => u.id === entry.userId);
            if (!user) return null;

            return (
              <div
                key={`sales-${entry.userId}`}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center font-medium text-muted-foreground">
                  #{index + 1}
                </div>
                <div 
                  className="h-8 w-8 rounded-full overflow-hidden"
                  data-user-id={entry.userId}
                >
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    {entry.trend === 'up' && (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    )}
                    {entry.trend === 'down' && (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.count} {entry.count === 1 ? 'deal' : 'deals'}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Hidden audio element for theme song playback */}
      <audio ref={audioRef} className="hidden" />
    </>
  );
}