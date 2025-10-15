'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';

type MusicQueueDrawerProps = {
  isOpen: boolean;
};

export function MusicQueueDrawer({ isOpen }: MusicQueueDrawerProps) {
  const sidebarDensity = useMusicUIStore((state) => state.sidebarDensity);
  const toggleQueue = useMusicUIStore((state) => state.toggleQueue);
  const queue = useMusicPlaybackStore((state) => state.queue);
  const currentIndex = useMusicPlaybackStore((state) => state.currentIndex);

  const isMobile = sidebarDensity === 'hidden';

  if (isMobile) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-music-queue text-music-primary transition',
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-music/70 px-4 py-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-music-ghost">
            Queue
          </p>
          <button
            type="button"
            onClick={() => toggleQueue(false)}
            className="rounded-full p-2 text-music-muted transition hover:bg-white/10 hover:text-music-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {queue.length === 0 ? (
            <EmptyQueueNote />
          ) : (
            <ol className="space-y-3 text-sm">
              {queue.map((track, index) => (
                <li
                  key={track.id}
                  className={cn(
                    'rounded-lg border border-transparent bg-white/5 px-4 py-2',
                    index === currentIndex &&
                      'border-white/30 bg-white/15 text-music-primary',
                  )}
                >
                  <p className="truncate font-medium">{track.name}</p>
                  <p className="truncate text-xs text-music-muted">
                    {track.artists.map((artist) => artist.name).join(', ')}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'hidden h-full flex-col border-l border-music/70 bg-music-queue/95 text-music-primary backdrop-blur transition-all duration-200 lg:flex',
        isOpen ? 'w-80 px-4 py-6' : 'w-0 px-0 py-0',
      )}
    >
      {isOpen && (
        <>
          <div className="flex items-center justify-between pb-4">
            <p className="text-sm uppercase tracking-[0.3em] text-music-ghost">Queue</p>
            <button
              type="button"
              onClick={() => toggleQueue(false)}
              className="rounded-full p-2 text-music-muted transition hover:bg-white/10 hover:text-music-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            {queue.length === 0 ? (
              <EmptyQueueNote />
            ) : (
              <ol className="space-y-3 text-sm">
                {queue.map((track, index) => (
                  <li
                    key={track.id}
                    className={cn(
                      'rounded-lg border border-transparent bg-white/5 px-3 py-2 transition hover:bg-white/10',
                      index === currentIndex &&
                        'border-white/40 bg-white/15 text-music-primary',
                    )}
                  >
                    <p className="truncate font-medium">{track.name}</p>
                    <p className="truncate text-xs text-music-muted">
                      {track.artists.map((artist) => artist.name).join(', ')}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

function EmptyQueueNote() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-music/60 bg-white/5 p-8 text-center text-sm text-music-muted">
      <p className="font-medium text-music-secondary">Your queue is empty</p>
      <p className="mt-2 text-xs text-music-muted">
        Play a song or tap the more button on any track to add it to your queue.
      </p>
    </div>
  );
}
