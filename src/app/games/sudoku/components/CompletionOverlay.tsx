'use client';

import { AnimatePresence, motion } from 'framer-motion';

type CompletionOverlayProps = {
  open: boolean;
  puzzleLabel: string;
  elapsedMs: number;
  mistakes: number;
  hintsUsed: number;
  onRestart: () => void;
  onNext: () => void;
};

const formatElapsedDetailed = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
};

export function CompletionOverlay({
  open,
  puzzleLabel,
  elapsedMs,
  mistakes,
  hintsUsed,
  onRestart,
  onNext,
}: CompletionOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="w-full max-w-md rounded-2xl border border-border/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-2xl"
            role="dialog"
            aria-labelledby="completion-overlay-title"
          >
            <div className="mb-4 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-primary">Solved</p>
              <h3 id="completion-overlay-title" className="mt-2 text-3xl font-semibold">
                {puzzleLabel} Complete
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Great focus! Review your stats or queue up the next neon grid.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Time</p>
                <p className="text-xl font-semibold text-white">
                  {formatElapsedDetailed(elapsedMs)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Mistakes</p>
                <p className="text-xl font-semibold text-destructive">{mistakes}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Hints</p>
                <p className="text-xl font-semibold text-primary">{hintsUsed}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-xl border border-white/30 px-4 py-3 font-semibold text-white transition hover:border-white/60 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                onClick={onRestart}
              >
                Review Board
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-black transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={onNext}
              >
                Next Puzzle
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
