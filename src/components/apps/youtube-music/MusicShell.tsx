'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { MusicBottomPlayer } from '@/components/apps/youtube-music/MusicBottomPlayer';
import { MusicMobileNav } from '@/components/apps/youtube-music/MusicMobileNav';
import { MusicQueueDrawer } from '@/components/apps/youtube-music/MusicQueueDrawer';
import { MusicSidebar } from '@/components/apps/youtube-music/MusicSidebar';
import { MusicTopBar } from '@/components/apps/youtube-music/MusicTopBar';
import { MusicToastViewport } from '@/components/apps/youtube-music/MusicToastViewport';
import { MusicTrackActionSheet } from '@/components/apps/youtube-music/MusicTrackActionSheet';
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
      <Suspense fallback={<div className="h-20 w-full bg-music-hero/80" />}>
        <MusicTopBar />
      </Suspense>
      <div className="flex flex-1 overflow-hidden">
        <MusicSidebar />
        <main className="relative flex-1 border-l border-music/70 overflow-y-auto pb-32 lg:pb-28">
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
