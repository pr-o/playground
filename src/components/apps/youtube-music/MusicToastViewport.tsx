'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicUIStore } from '@/store/music';

export function MusicToastViewport() {
  const toasts = useMusicUIStore((state) => state.toasts);
  const dismissToast = useMusicUIStore((state) => state.dismissToast);

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (!toast.durationMs) return undefined;
      return setTimeout(() => dismissToast(toast.id), toast.durationMs);
    });
    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [dismissToast, toasts]);

  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-end gap-3 px-4 sm:px-6 lg:px-8">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur',
            getToastStyles(toast.variant),
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.description && (
              <p className="mt-1 text-xs opacity-80">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="rounded-full p-1 text-xs opacity-60 transition hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function getToastStyles(variant: string = 'default') {
  switch (variant) {
    case 'success':
      return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-50';
    case 'warning':
      return 'border-amber-500/50 bg-amber-500/15 text-amber-50';
    case 'error':
      return 'border-red-500/50 bg-red-500/15 text-red-50';
    case 'info':
      return 'border-sky-500/50 bg-sky-500/15 text-sky-50';
    default:
      return 'border-white/20 bg-white/10 text-music-primary';
  }
}
