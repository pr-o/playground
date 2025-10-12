'use client';

import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { Check, Plus } from 'lucide-react';
import type { MediaItem } from '@/lib/netflix/types';
import { cn } from '@/lib/utils';
import { useMyList } from './my-list-context';

type MyListButtonProps = {
  media: MediaItem;
  variant?: 'default' | 'icon';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function MyListButton({
  media,
  variant = 'default',
  className,
  onClick,
  ...rest
}: MyListButtonProps) {
  const { toggleItem, contains } = useMyList();
  const isSaved = contains(media.id, media.mediaType);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    toggleItem(media);
  };

  const baseClasses =
    variant === 'icon'
      ? 'flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white hover:text-black'
      : 'flex items-center gap-2 rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      className={cn(baseClasses, className)}
      {...rest}
    >
      {isSaved ? (
        <Check className={variant === 'icon' ? 'size-6' : 'size-4'} aria-hidden="true" />
      ) : (
        <Plus className={variant === 'icon' ? 'size-6' : 'size-4'} aria-hidden="true" />
      )}
      {variant === 'default' && <span>{isSaved ? 'My List' : 'Add to My List'}</span>}
      <span className="sr-only">
        {isSaved ? 'Remove from My List' : 'Add to My List'}: {media.title}
      </span>
    </button>
  );
}
