import { Settings, Users, Upload, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { UserManagementDialog } from './UserManagementDialog';
import { LogoUploadDialog } from './LogoUploadDialog';
import { DirectMessageDialog } from '../chat/DirectMessageDialog';

interface BottomBarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export function BottomBar({ isEditMode, onToggleEditMode }: BottomBarProps) {
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showLogoUpload, setShowLogoUpload] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const handleLogoUploaded = (url: string) => {
    console.log('Logo uploaded:', url);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card px-4 py-2">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowMessages(true)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
            {isEditMode && (
              <span className="text-sm text-muted-foreground">
                Editing Mode Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLogoUpload(true)}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Upload Logo</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUserManagement(true)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Manage Users</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isEditMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={onToggleEditMode}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isEditMode ? 'Exit' : 'Enter'} Edit Mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <UserManagementDialog 
        open={showUserManagement} 
        onOpenChange={setShowUserManagement}
      />

      <LogoUploadDialog
        open={showLogoUpload}
        onOpenChange={setShowLogoUpload}
        onLogoUploaded={handleLogoUploaded}
      />

      <DirectMessageDialog
        open={showMessages}
        onOpenChange={setShowMessages}
      />
    </>
  );
}