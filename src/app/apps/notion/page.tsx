import type { Metadata } from 'next';
import { NotionWorkspace } from '@/components/clones/notion/NotionWorkspace';

const title = 'Notion - Playground';

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

export default function NotionClonePage() {
  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <NotionWorkspace />
      </div>
    </main>
  );
}
