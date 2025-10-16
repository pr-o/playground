import Image from 'next/image';
import { Play, Shuffle, Download, Plus, MoreHorizontal } from 'lucide-react';
import type { AlbumHeroData } from '@/types/music';
import { Button } from '@/components/ui/button';

type MusicDetailHeroProps = {
  hero: AlbumHeroData;
  variant?: 'album' | 'playlist';
  onPlayAll?: () => void;
  onShuffle?: () => void;
  onAddToLibrary?: () => void;
  onDownload?: () => void;
};

export function MusicDetailHero({
  hero,
  variant = 'album',
  onPlayAll,
  onShuffle,
  onAddToLibrary,
  onDownload,
}: MusicDetailHeroProps) {
  const gradientColor = hero.dominantColor ?? 'rgba(94, 114, 228, 0.6)';
  const primaryActionLabel = variant === 'playlist' ? 'Play Playlist' : 'Play';
  const secondaryActionLabel = variant === 'playlist' ? 'Shuffle Playlist' : 'Shuffle';

  return (
    <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradientColor} 0%, rgba(10, 10, 15, 0.9) 70%)`,
        }}
      />
      {hero.imageUrl && (
        <div className="absolute inset-0 opacity-40">
          <Image
            src={hero.imageUrl}
            alt={hero.title}
            fill
            priority
            className="object-cover blur-3xl saturate-150"
          />
        </div>
      )}
      <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-end md:p-10">
        <div className="relative mx-auto h-48 w-48 overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl md:mx-0 md:h-52 md:w-52">
          {hero.imageUrl ? (
            <Image
              src={hero.imageUrl}
              alt={hero.title}
              fill
              sizes="208px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-music-ghost">
              Artwork
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-6 text-music-primary">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-music-ghost">
              {variant === 'playlist' ? 'Playlist' : 'Album'}
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              {hero.title}
            </h1>
            <p className="text-sm text-music-secondary">
              {hero.subtitle}
              {hero.trackCount ? ` • ${hero.trackCount} tracks` : ''}
              {hero.releaseDate ? ` • ${hero.releaseDate}` : ''}
            </p>
          </div>

          {hero.description && (
            <p className="max-w-2xl text-sm text-music-muted">{hero.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={onPlayAll}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black shadow hover:bg-white/90"
            >
              <Play className="h-4 w-4" />
              {primaryActionLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onShuffle}
              className="inline-flex items-center gap-2 rounded-full border-white/40 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-music-primary hover:bg-white/20"
            >
              <Shuffle className="h-4 w-4" />
              {secondaryActionLabel}
            </Button>
            <button
              type="button"
              onClick={onAddToLibrary}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-music-primary transition hover:bg-white/20"
            >
              <Plus className="h-4 w-4" />
              Add to Library
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-music-primary transition hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 p-2 text-music-secondary transition hover:bg-white/20 hover:text-music-primary"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-music-muted">
            {hero.artistNames.length > 0 && (
              <span>
                Featured artists:{' '}
                <span className="text-music-primary">{hero.artistNames.join(' • ')}</span>
              </span>
            )}
            {hero.followers && (
              <span>{hero.followers.toLocaleString()} listeners on Discogs</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
