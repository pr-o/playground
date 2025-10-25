import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
};

export function ToolbarButton({
  label,
  onClick,
  active = false,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      aria-pressed={active}
      variant="ghost"
      size="icon"
      className={cn(
        'font-semibold transition-colors',
        active
          ? 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground'
          : 'hover:bg-muted hover:text-foreground active:bg-muted/80',
      )}
    >
      {children}
    </Button>
  );
}
