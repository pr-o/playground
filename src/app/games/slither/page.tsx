import type { Metadata } from 'next';
import { SlitherClient } from './SlitherClient';

const title = 'Slither Arcade - Playground';

export const metadata: Metadata = {
  title,
  description:
    'Glide through a neon arena in this single-player Slither-inspired experiment built with PixiJS and Next.js.',
  openGraph: {
    title,
    description:
      'Glide through a neon arena in this single-player Slither-inspired experiment built with PixiJS and Next.js.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description:
      'Glide through a neon arena in this single-player Slither-inspired experiment built with PixiJS and Next.js.',
  },
};

export default function SlitherPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 text-slate-100">
      <div className="w-full max-w-6xl px-6">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Slither</p>
          <h1 className="text-4xl font-semibold">Slither</h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300">
            Pilot a snake through a sprawling arena, collect energy orbs, and grow longer.
          </p>
        </header>
        <section className="mt-10 rounded-3xl border border-white/5 bg-slate-950/50 p-4 shadow-[0_40px_120px_-50px_rgba(56,189,248,0.45)] backdrop-blur">
          <SlitherClient />
        </section>
      </div>
    </main>
  );
}
