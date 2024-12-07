import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FloorPlan } from '@/components/office/FloorPlan';
import { Header } from '@/components/layout/Header';
import { SalesLeaderboard } from '@/components/office/SalesLeaderboard';
import { CallLeaderboard } from '@/components/office/CallLeaderboard';
import { Toaster } from '@/components/ui/toaster';
import { LoginPage } from '@/components/auth/LoginPage';
import { useAuthContext } from '@/contexts/AuthContext';
import { EffectsProvider } from '@/components/effects/EffectsProvider';

export function App() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { authUser, userData, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Only check for authUser since userData will be populated automatically
  if (!authUser) {
    return <LoginPage />;
  }

  return (
    <TooltipProvider>
      <EffectsProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="p-4 pb-16">
            <div className="flex gap-4">
              <div className="flex-1">
                <FloorPlan onEditModeChange={setIsEditMode} />
              </div>
              <div className="space-y-4">
                <SalesLeaderboard />
                <CallLeaderboard />
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </EffectsProvider>
    </TooltipProvider>
  );
}