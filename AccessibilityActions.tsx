import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SkipForward, Keyboard } from 'lucide-react';

interface AccessibilityActionsProps {
  onSkip?: () => void;
  onTypeMode?: () => void;
  showSkip?: boolean;
  showTypeMode?: boolean;
  className?: string;
}

export const AccessibilityActions: React.FC<AccessibilityActionsProps> = ({
  onSkip,
  onTypeMode,
  showSkip = true,
  showTypeMode = true,
  className,
}) => {
  return (
    <div className={cn('flex gap-4 justify-center', className)}>
      {showTypeMode && onTypeMode && (
        <Button
          onClick={onTypeMode}
          variant="outline"
          size="lg"
          className="gap-2 min-h-touch"
        >
          <Keyboard size={20} />
          Type Instead
        </Button>
      )}
      {showSkip && onSkip && (
        <Button
          onClick={onSkip}
          variant="ghost"
          size="lg"
          className="gap-2 min-h-touch text-muted-foreground"
        >
          <SkipForward size={20} />
          Skip
        </Button>
      )}
    </div>
  );
};
