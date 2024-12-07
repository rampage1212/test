import { useState, useRef, useEffect } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '../office/UserAvatar';
import { ThemeSongUploader } from '../settings/ThemeSongUploader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Circle, LogOut, Upload, Volume2, VolumeX } from 'lucide-react';
import { updateUserStatus } from '@/lib/services/userService';
import { updatePresence } from '@/lib/services/presenceService';
import { useToast } from '@/components/ui/use-toast';
import { logout } from '@/lib/services/authService';
import { useAuthContext } from '@/contexts/AuthContext';
import { leaveOffice } from '@/lib/services/roomService';
import { getThemeSongUrl } from '@/lib/services/themeService';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const statusOptions = [
  { value: 'online', label: 'Online', color: 'text-green-500' },
  { value: 'busy', label: 'Busy', color: 'text-red-500' },
  { value: 'away', label: 'Away', color: 'text-yellow-500' },
  { value: 'offline', label: 'Offline', color: 'text-gray-500' },
] as const;

export function Header() {
  const { userData: currentUser } = useAuthContext();
  const { toast } = useToast();
  const [showThemeSongDialog, setShowThemeSongDialog] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const toggleAudio = () => {
    // Find all audio elements and mute/unmute them
    const audioElements = document.getElementsByTagName('audio');
    Array.from(audioElements).forEach(audio => {
      if (audioEnabled) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    setAudioEnabled(!audioEnabled);
    
    toast({
      title: audioEnabled ? "Audio disabled" : "Audio enabled",
      description: audioEnabled ? "All sounds are now muted" : "Theme songs and effects enabled",
    });
  };

  const handleStatusChange = async (status: typeof statusOptions[number]['value']) => {
    if (!currentUser) return;

    try {
      await Promise.all([
        updateUserStatus(currentUser.id, status),
        updatePresence(currentUser.id, status)
      ]);

      toast({
        title: "Status updated",
        description: `Your status is now ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReturnHome = async () => {
    if (!currentUser) return;

    try {
      await leaveOffice(currentUser.id);
      toast({
        title: "Returned home",
        description: "You've returned to your home office.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to return to home office. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!currentUser) return null;

  const currentStatus = statusOptions.find(s => s.value === currentUser.status);
  const isInDifferentOffice = currentUser.currentOfficeId !== currentUser.homeOfficeId;

  return (
    <>
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            {currentUser.homeOfficeId && isInDifferentOffice && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReturnHome}
              >
                My Seat
              </Button>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAudio}
                  className={audioEnabled ? 'text-primary' : 'text-muted-foreground'}
                >
                  {audioEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {audioEnabled ? 'Disable audio' : 'Enable audio'}
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Circle className={`h-3 w-3 ${currentStatus?.color || 'text-gray-500'}`} />
                  <span className="capitalize">{currentStatus?.label || 'Set Status'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    className="flex items-center gap-2"
                    onClick={() => handleStatusChange(status.value)}
                  >
                    <Circle className={`h-3 w-3 ${status.color}`} />
                    <span className="capitalize">{status.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserAvatar user={currentUser} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowThemeSongDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Change Theme Song</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <ThemeSongUploader
        open={showThemeSongDialog}
        onOpenChange={setShowThemeSongDialog}
      />
    </>
  );
}