import { useState, useRef } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Music, Upload, Play, Square, Loader2 } from 'lucide-react';
import { uploadThemeSong, getThemeSongUrl } from '@/lib/services/themeService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ThemeSongUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThemeSongUploader({ open, onOpenChange }: ThemeSongUploaderProps) {
  const { userData } = useAuthContext();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentSongUrl, setCurrentSongUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current theme song URL when dialog opens
  const loadCurrentSong = async () => {
    if (!userData) return;
    try {
      const url = await getThemeSongUrl(userData.id);
      setCurrentSongUrl(url);
    } catch (error) {
      console.error('Error loading theme song:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    // Validate file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP3 file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Theme song must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      const url = await uploadThemeSong(userData.id, file);
      setCurrentSongUrl(url);
      toast({
        title: "Theme song updated",
        description: "Your new theme song has been set.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload theme song. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Theme Song</DialogTitle>
          <DialogDescription>
            Upload an MP3 file (max 5MB) to set as your theme song.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Choose File
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {currentSongUrl && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-primary" />
                <span className="text-sm">Current Theme Song</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                disabled={uploading}
              >
                {playing ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {currentSongUrl && (
            <audio
              ref={audioRef}
              src={currentSongUrl}
              onEnded={() => setPlaying(false)}
              onError={() => {
                setPlaying(false);
                toast({
                  title: "Playback error",
                  description: "Failed to play theme song.",
                  variant: "destructive",
                });
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}