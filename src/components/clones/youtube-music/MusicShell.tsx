'use client';

import type { ReactNode } from 'react';
import { MusicBottomPlayer } from '@/components/clones/youtube-music/MusicBottomPlayer';
import { MusicMobileNav } from '@/components/clones/youtube-music/MusicMobileNav';
import { MusicQueueDrawer } from '@/components/clones/youtube-music/MusicQueueDrawer';
import { MusicSidebar } from '@/components/clones/youtube-music/MusicSidebar';
import { MusicTopBar } from '@/components/clones/youtube-music/MusicTopBar';
import { MusicToastViewport } from '@/components/clones/youtube-music/MusicToastViewport';
import { MusicTrackActionSheet } from '@/components/clones/youtube-music/MusicTrackActionSheet';
import { usePlaybackShortcuts } from '@/hooks/music/use-playback-shortcuts';
import { useMusicUIStore } from '@/store/music';

type MusicShellProps = {
  children: ReactNode;
};

export function MusicShell({ children }: MusicShellProps) {
  const isQueueOpen = useMusicUIStore((state) => state.isQueueOpen);
  usePlaybackShortcuts();

  return (
    <div className="flex min-h-screen flex-col bg-music-hero text-music-primary transition-colors">
      <MusicTopBar />
      <div className="flex flex-1 overflow-hidden">
        <MusicSidebar />
        <main className="relative flex-1 overflow-y-auto pb-32 lg:pb-28">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
        <MusicQueueDrawer isOpen={isQueueOpen} />
      </div>
      <MusicBottomPlayer />
      <MusicMobileNav />
      <MusicToastViewport />
      <MusicTrackActionSheet />
    </div>
  );
}
