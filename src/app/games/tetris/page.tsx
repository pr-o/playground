import type { Metadata } from 'next';
import { TetrisGame } from './TetrisGame';

const title = 'Tetris Classic - Playground';
const description =
  'Drop tetrominoes in this minimalist Tetris experience built with React, TypeScript, and smooth Motion animations.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function TetrisPage() {
  const description = `Who doesn't know Tetris? This is a minimalist version of the classic.`;
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Tetris Classic</h1>
        <p className="max-w-2xl text-md text-muted-foreground">{description}</p>
      </header>
      <TetrisGame />
    </main>
  );
}
