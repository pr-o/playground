import { cn } from '@/lib/utils';

export function PlaylistCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-64 flex-col gap-3 rounded-3xl border border-white/5 bg-white/5 p-4',
        className,
      )}
    >
      <div className="h-36 w-full animate-pulse rounded-3xl bg-white/10" />
      <div className="space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="h-2 w-1/2 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function MusicPlaylistCardSkeleton() {
  return <PlaylistCardSkeleton />;
}

export function ReleaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-44 flex-col gap-3 rounded-3xl border border-white/5 bg-white/5 p-4',
        className,
      )}
    >
      <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10" />
      <div className="space-y-2">
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="h-2 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="h-2 w-1/2 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function MusicReleaseCardSkeleton() {
  return <ReleaseCardSkeleton />;
}

export function TrackRowSkeleton({ index }: { index: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
      <span className="w-6 text-center text-xs text-music-muted">{index}</span>
      <div className="h-10 w-10 animate-pulse rounded-md bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-white/10" />
        <div className="h-2 w-1/3 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="h-2 w-10 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}
