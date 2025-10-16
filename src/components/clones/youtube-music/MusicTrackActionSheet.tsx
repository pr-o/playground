'use client';

import { Play, ListPlus, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';

export function MusicTrackActionSheet() {
  const track = useMusicUIStore((state) => state.trackActionSheetTrack);
  const setTrackActionSheetTrack = useMusicUIStore(
    (state) => state.setTrackActionSheetTrack,
  );
  const pushToast = useMusicUIStore((state) => state.pushToast);
  const addToQueue = useMusicPlaybackStore((state) => state.addToQueue);
  const playTrack = useMusicPlaybackStore((state) => state.playTrack);

  const isOpen = Boolean(track);

  const handleClose = () => setTrackActionSheetTrack(undefined);

  const handlePlay = () => {
    if (!track) return;
    playTrack(track, { startPlaying: true });
    pushToast({
      title: 'Now playing',
      description: `${track.title} • ${track.artists.join(', ')}`,
      variant: 'info',
    });
    handleClose();
  };

  const handlePlayNext = () => {
    if (!track) return;
    addToQueue(track, { next: true });
    pushToast({
      title: 'Queued to play next',
      description: track.title,
      variant: 'success',
    });
    handleClose();
  };

  const handleAddToQueue = () => {
    if (!track) return;
    addToQueue(track);
    pushToast({
      title: 'Added to queue',
      description: track.title,
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className={cn(
          'fixed inset-x-0 bottom-0 z-[9999] mt-auto flex max-h-[80vh] flex-col rounded-t-3xl border border-white/10 bg-music-hero/95 p-0 text-music-primary shadow-xl backdrop-blur md:hidden',
        )}
      >
        <DialogHeader className="border-b border-white/10 px-6 py-4 text-left">
          <DialogTitle className="text-base font-semibold uppercase tracking-[0.3em] text-music-ghost">
            Track actions
          </DialogTitle>
          {track && (
            <DialogDescription className="mt-1 text-sm text-music-muted">
              {track.title}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex flex-col gap-2 px-4 py-4">
          <ActionButton icon={Play} label="Play" onClick={handlePlay} />
          <ActionButton icon={ListPlus} label="Play next" onClick={handlePlayNext} />
          <ActionButton icon={Plus} label="Add to queue" onClick={handleAddToQueue} />
          <DialogClose className="mt-2 inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm uppercase tracking-[0.3em] text-music-muted transition hover:border-white/40 hover:text-music-primary">
            <X className="mr-2 h-4 w-4" /> Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ActionButtonProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
};

function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm text-music-primary transition hover:border-white/30 hover:bg-white/10"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-music-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}
