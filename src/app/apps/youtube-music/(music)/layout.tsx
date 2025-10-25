import type { ReactNode } from 'react';
import { MusicProviders } from '@/components/apps/youtube-music/MusicProviders';
import { MusicShell } from '@/components/apps/youtube-music/MusicShell';

export default function YoutubeMusicShellLayout({ children }: { children: ReactNode }) {
  return (
    <MusicProviders>
      <MusicShell>{children}</MusicShell>
    </MusicProviders>
  );
}
