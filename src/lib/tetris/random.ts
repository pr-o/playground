import { TETROMINO_IDS, type TetrominoId } from './types';

export type RandomSource = () => number;

const shuffle = (input: readonly TetrominoId[], rng: RandomSource): TetrominoId[] => {
  const result = Array.from(input);

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

export class SevenBagGenerator {
  private bag: TetrominoId[] = [];

  constructor(private readonly random: RandomSource = Math.random) {}

  private refill() {
    this.bag = shuffle(TETROMINO_IDS, this.random);
  }

  next(): TetrominoId {
    if (this.bag.length === 0) {
      this.refill();
    }

    const value = this.bag.shift();
    if (!value) {
      throw new Error('Failed to draw tetromino from bag.');
    }
    return value;
  }

  preview(count: number): TetrominoId[] {
    while (this.bag.length < count) {
      this.refill();
    }

    return this.bag.slice(0, count);
  }

  reset() {
    this.bag = [];
  }
}
