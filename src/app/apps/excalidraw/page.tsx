import type { Metadata } from 'next';
import { ExcalidrawApp } from '@/components/apps/excalidraw/ExcalidrawApp';

const title = 'Excalidraw - Playground';

export const metadata: Metadata = {
  title,
  description:
    'Browse the curated Playground projects, including interactive apps and games built with Next.js and modern UI patterns.',
  openGraph: {
    title,
    description:
      'Discover interactive apps and games crafted in the Playground with polished Next.js experiences.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description:
      'Discover interactive apps and games crafted in the Playground with polished Next.js experiences.',
  },
};

export default function ExcalidrawClonePage() {
  return (
    <main className="flex h-[calc(100vh-6rem)] flex-col px-4 py-6 md:px-8">
      <div className="mx-auto flex w-full max-w-[2000px] flex-1">
        <ExcalidrawApp />
      </div>
    </main>
  );
}
