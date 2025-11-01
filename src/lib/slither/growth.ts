import type { GameState } from './types';

const MIN_RESERVE_FACTOR = 0.15;

export const applyGrowthReserve = (state: GameState, dt: number) => {
  const snake = state.player;
  const reserve = snake.growthReserve;
  if (reserve <= 0) return;

  const {
    snake: { growthApplyRate, segmentSpacing },
  } = state.config;

  const rate = Math.max(0, growthApplyRate);
  const minReserveThreshold = segmentSpacing * MIN_RESERVE_FACTOR;

  if (reserve <= minReserveThreshold || rate <= 0) {
    snake.targetLength += reserve;
    snake.growthReserve = 0;
    return;
  }

  const growthStep = Math.min(reserve, rate * dt);
  if (growthStep <= 0) return;

  snake.targetLength += growthStep;
  snake.growthReserve = reserve - growthStep;
};
