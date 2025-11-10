import type { Metadata } from 'next';
import { MiniSudokuGame } from './MiniSudokuGame';

const title = 'Mini Sudoku - Playground';
const description = 'Solve 6×6 Mini Sudoku puzzles';

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

export default function MiniSudokuPage() {
  const intro =
    'Mini Sudoku squeezes the classic puzzle into a friendly 6×6 grid with 3×2 regions—perfect for quick sessions on any device.';
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Mini Sudoku</h1>
        <p className="max-w-2xl text-md text-muted-foreground">{intro}</p>
      </header>
      <MiniSudokuGame />
    </main>
  );
}
