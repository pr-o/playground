import type { ReactNode } from 'react';

export default function YoutubeMusicShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-music-hero text-white transition-colors">
      {children}
    </div>
  );
}
