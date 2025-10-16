'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import type { MusicPlaybackTrack } from '@/types/playback';

type MusicQueueDrawerProps = {
  isOpen: boolean;
};

export function MusicQueueDrawer({ isOpen }: MusicQueueDrawerProps) {
  const sidebarDensity = useMusicUIStore((state) => state.sidebarDensity);
  const toggleQueue = useMusicUIStore((state) => state.toggleQueue);
  const queue = useMusicPlaybackStore((state) => state.queue);
  const currentIndex = useMusicPlaybackStore((state) => state.currentIndex);
  const history = useMusicPlaybackStore((state) => state.history);
  const removeFromQueue = useMusicPlaybackStore((state) => state.removeFromQueue);
  const moveQueueItem = useMusicPlaybackStore((state) => state.moveQueueItem);
  const playTrack = useMusicPlaybackStore((state) => state.playTrack);

  const isMobile = sidebarDensity === 'hidden';
  const currentTrack =
    currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : undefined;
  const nextUp =
    currentIndex >= 0 && currentIndex < queue.length
      ? queue.slice(currentIndex + 1)
      : queue;

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
          <QueueSections
            currentTrack={currentTrack}
            nextUp={nextUp}
            history={history}
            currentIndex={currentIndex}
            onRemove={removeFromQueue}
            onMove={moveQueueItem}
            onPlay={(track) => playTrack(track)}
          />
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
            <QueueSections
              currentTrack={currentTrack}
              nextUp={nextUp}
              history={history}
              currentIndex={currentIndex}
              onRemove={removeFromQueue}
              onMove={moveQueueItem}
              onPlay={(track) => playTrack(track)}
            />
          </div>
        </>
      )}
    </aside>
  );
}

type QueueSectionsProps = {
  currentTrack?: MusicPlaybackTrack;
  nextUp: MusicPlaybackTrack[];
  history: MusicPlaybackTrack[];
  currentIndex: number;
  onRemove: (trackId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  onPlay: (track: MusicPlaybackTrack) => void;
};

function QueueSections({
  currentTrack,
  nextUp,
  history,
  currentIndex,
  onRemove,
  onMove,
  onPlay,
}: QueueSectionsProps) {
  if (!currentTrack && nextUp.length === 0) {
    return <EmptyQueueNote />;
  }

  return (
    <div className="space-y-6 text-sm">
      {currentTrack && (
        <section>
          <h3 className="text-xs uppercase tracking-[0.3em] text-music-ghost">
            Now playing
          </h3>
          <button
            type="button"
            onClick={() => onPlay(currentTrack)}
            className="mt-3 w-full rounded-2xl border border-white/20 bg-white/10 px-3 py-3 text-left transition hover:bg-white/15"
          >
            <p className="truncate font-semibold text-music-primary">
              {currentTrack.title}
            </p>
            <p className="truncate text-xs text-music-muted">
              {currentTrack.artists.join(', ')} • {currentTrack.albumName ?? 'Single'}
            </p>
          </button>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.3em] text-music-ghost">Next up</h3>
          <p className="text-[10px] uppercase tracking-[0.3em] text-music-muted">
            {nextUp.length} tracks
          </p>
        </div>
        {nextUp.length === 0 ? (
          <p className="mt-3 text-xs text-music-muted">
            Queue new tracks to keep the music going.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {nextUp.map((track, index) => {
              const absoluteIndex = currentIndex + 1 + index;
              return (
                <li
                  key={`${track.id}-${absoluteIndex}`}
                  className="group rounded-xl border border-transparent bg-white/5 px-3 py-2 transition hover:border-white/30 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-music-primary">
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-music-muted">
                        {track.artists.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          onMove(
                            absoluteIndex,
                            Math.max(currentIndex + 1, absoluteIndex - 1),
                          )
                        }
                        className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-music-muted transition hover:border-white/40 hover:text-music-primary"
                        aria-label="Move track up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onMove(
                            absoluteIndex,
                            Math.min(absoluteIndex + 1, currentIndex + nextUp.length),
                          )
                        }
                        className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-music-muted transition hover:border-white/40 hover:text-music-primary"
                        aria-label="Move track down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(track.id)}
                        className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-music-muted transition hover:border-white/40 hover:text-red-200"
                        aria-label="Remove from queue"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.3em] text-music-ghost">History</h3>
          <p className="text-[10px] uppercase tracking-[0.3em] text-music-muted">
            {history.length} plays
          </p>
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-xs text-music-muted">
            Tracks you play will appear here.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {history
              .slice()
              .reverse()
              .map((track) => (
                <li
                  key={`${track.id}-history`}
                  className="rounded-xl border border-transparent bg-white/5 px-3 py-2 text-xs text-music-muted transition hover:border-white/30 hover:bg-white/10"
                >
                  <p className="truncate font-medium text-music-primary">{track.title}</p>
                  <p className="truncate">{track.artists.join(', ')}</p>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
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
