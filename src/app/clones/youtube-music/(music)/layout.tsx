import type { ReactNode } from 'react';
import { MusicProviders } from '@/components/clones/youtube-music/MusicProviders';
import { MusicShell } from '@/components/clones/youtube-music/MusicShell';

export default function YoutubeMusicShellLayout({ children }: { children: ReactNode }) {
  return (
    <MusicProviders>
      <MusicShell>{children}</MusicShell>
    </MusicProviders>
  );
}
