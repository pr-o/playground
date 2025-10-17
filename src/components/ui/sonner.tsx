'use client';

import { Toaster, type ToasterProps } from 'sonner';

export function SonnerToaster(props: ToasterProps) {
  return (
    <Toaster
      richColors
      closeButton
      expand
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            'rounded-2xl border border-border/60 bg-card/95 text-foreground shadow-[0_16px_40px_-24px_rgba(15,23,42,0.65)] backdrop-blur',
          title: 'text-sm font-semibold tracking-tight',
          description: 'text-xs text-muted-foreground',
          actionButton:
            'rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-background/80',
        },
      }}
      {...props}
    />
  );
}

export { toast } from 'sonner';
