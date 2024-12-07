import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall, TrendingUp, TrendingDown } from 'lucide-react';
import { useUsers } from '@/lib/hooks/useUsers';
import { useCallLeaderboard } from '@/lib/hooks/useLeaderboardData';

export function CallLeaderboard() {
  const { users } = useUsers();
  const { entries, loading, error } = useCallLeaderboard();

  if (loading) {
    return (
      <Card className="w-[250px] bg-background/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <PhoneCall className="h-4 w-4 text-green-500" />
            Today's Calls
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
            <PhoneCall className="h-4 w-4 text-green-500" />
            Today's Calls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Error loading call data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[250px] bg-background/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <PhoneCall className="h-4 w-4 text-green-500" />
          Today's Calls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry, index) => {
          const user = users.find(u => u.id === entry.userId);
          if (!user) return null;

          return (
            <div
              key={`call-${entry.userId}`}
              className="flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center font-medium text-muted-foreground">
                #{index + 1}
              </div>
              <div className="h-8 w-8 rounded-full overflow-hidden">
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
                  {entry.count} calls today
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}