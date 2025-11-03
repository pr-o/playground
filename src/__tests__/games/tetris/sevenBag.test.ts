import { SevenBagGenerator, TETROMINO_IDS, type TetrominoId } from '@/lib/tetris';

const createDeterministicRandom = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const sortIds = (ids: TetrominoId[]) => [...ids].sort();

describe('SevenBagGenerator', () => {
  it('emits each tetromino exactly once per bag cycle', () => {
    const generator = new SevenBagGenerator(createDeterministicRandom(1337));
    const expected = sortIds([...TETROMINO_IDS]);

    for (let cycle = 0; cycle < 2; cycle += 1) {
      const pieces = Array.from({ length: 7 }, () => generator.next());
      expect(sortIds(pieces)).toEqual(expected);
    }
  });

  it('produces deterministic sequences when seeded with the same RNG', () => {
    const generatorA = new SevenBagGenerator(createDeterministicRandom(42));
    const generatorB = new SevenBagGenerator(createDeterministicRandom(42));

    const drawsA = Array.from({ length: 21 }, () => generatorA.next());
    const drawsB = Array.from({ length: 21 }, () => generatorB.next());

    expect(drawsA).toEqual(drawsB);
  });

  it('refills the bag from scratch after reset', () => {
    const generator = new SevenBagGenerator(createDeterministicRandom(7));

    // Consume part of the current bag.
    generator.next();
    generator.next();
    generator.next();

    generator.reset();

    const postResetPieces = Array.from({ length: 7 }, () => generator.next());

    expect(new Set(postResetPieces).size).toBe(7);
    expect(sortIds(postResetPieces)).toEqual(sortIds([...TETROMINO_IDS]));
  });
});
