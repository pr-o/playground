import { Ticker } from 'pixi.js';

export type TweenableProps = Partial<Record<'x' | 'y' | 'alpha', number>>;

export type TweenOptions = {
  duration: number;
  ease?: (t: number) => number;
  ticker?: Ticker;
};

export function tweenTo(
  target: Record<string, number>,
  props: TweenableProps,
  options: TweenOptions,
) {
  const ticker = options.ticker ?? Ticker.shared;
  const ease = options.ease ?? ((t: number) => t);

  const startValues: Record<string, number> = {};
  const deltas: Record<string, number> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }
    const current = target[key];
    if (typeof current !== 'number') {
      throw new Error(
        `Cannot tween property "${key}" because it is not numeric on target.`,
      );
    }
    startValues[key] = current;
    deltas[key] = value - current;
  });

  const totalMs = Math.max(options.duration, 0.0001) * 1000;
  const startTime = now();

  return new Promise<void>((resolve) => {
    const step = () => {
      const elapsed = now() - startTime;
      const progress = Math.min(1, elapsed / totalMs);
      const eased = ease(progress);

      Object.entries(deltas).forEach(([key, delta]) => {
        target[key] = startValues[key]! + delta * eased;
      });

      if (progress >= 1) {
        ticker.remove(step);
        resolve();
      }
    };

    ticker.add(step);
  });
}

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}
