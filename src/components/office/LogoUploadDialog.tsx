import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { uploadLogo } from '@/lib/services/logoService';
import { useToast } from '@/components/ui/use-toast';

interface LogoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogoUploaded: (url: string) => void;
}

export function LogoUploadDialog({ 
  open, 
  onOpenChange,
  onLogoUploaded 
}: LogoUploadDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadLogo(file);
      onLogoUploaded(url);
      onOpenChange(false);
      toast({
        title: "Logo uploaded successfully",
        description: "Your new logo has been set.",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error uploading logo",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="logo-upload-description"
      >
        <DialogHeader>
          <DialogTitle>Upload Logo</DialogTitle>
          <p id="logo-upload-description" className="sr-only">
            Interface to upload and customize your office logo
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or SVG (max. 2MB)
                </p>
              </div>
              <Input
                id="logo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}