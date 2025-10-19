jest.mock('pixi.js', () => {
  class MockTicker {
    add(callback: () => void): void {
      void callback;
    }

    remove(callback: () => void): void {
      void callback;
    }

    destroy(): void {}
  }

  class MockContainer {
    children: unknown[] = [];
    position = {
      x: 0,
      y: 0,
      set: (x: number, y?: number) => {
        this.position.x = x;
        this.position.y = y ?? this.position.y;
      },
    };
    name?: string;

    addChild<T>(child: T): T {
      this.children.push(child);
      return child;
    }

    destroy(): void {
      this.children = [];
    }

    removeChildren(): unknown[] {
      const removed = [...this.children];
      this.children = [];
      return removed;
    }
  }

  class MockSprite extends MockContainer {
    anchor = {
      set: (value: number, valueY?: number) => {
        void value;
        void valueY;
      },
    };
    position = {
      x: 0,
      y: 0,
      set: (x: number, y?: number) => {
        this.position.x = x;
        this.position.y = y ?? this.position.y;
      },
      copyFrom: (point: { x: number; y: number }) => {
        this.position.x = point.x;
        this.position.y = point.y;
      },
    };
    width = 64;
    height = 64;
    scale = {
      set: (_valueX: number, _valueY?: number) => {
        void _valueX;
        void _valueY;
      },
    };
    visible = true;
    eventMode: string | undefined;
    cursor: string | undefined;
    on(event: string, handler: () => void): void {
      void event;
      void handler;
    }
    off(event: string, handler: () => void): void {
      void event;
      void handler;
    }

    destroy(): void {
      this.children = [];
    }
  }

  const Texture = {
    from: () => ({ width: 64, height: 64, baseTexture: { valid: true } }),
  };

  const Assets = {
    addBundle: () => {},
    loadBundle: async () => ({}),
  };

  return {
    Container: MockContainer,
    Ticker: MockTicker,
    Sprite: MockSprite,
    Texture,
    Assets,
  };
});

jest.mock('@/lib/bejeweled/animation', () => ({
  tweenTo: jest.fn(() => Promise.resolve()),
}));

import { Container, Ticker } from 'pixi.js';
import { Board } from '@/lib/bejeweled/board';
import { BEJEWELED_CONFIG, type BejeweledTileId } from '@/lib/bejeweled/config';
import { CombinationManager } from '@/lib/bejeweled/combination-manager';
import type { Tile } from '@/lib/bejeweled/tile';

describe('Bejeweled board initialisation', () => {
  it('creates a full grid of fields and tiles', () => {
    const stage = new Container();
    const ticker = new Ticker();

    const board = new Board({
      stage,
      viewportWidth: BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize,
      viewportHeight: BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize,
      ticker,
    });

    expect(board.fields).toHaveLength(BEJEWELED_CONFIG.rows);
    board.fields.forEach((row) => expect(row).toHaveLength(BEJEWELED_CONFIG.cols));

    expect(board.tiles).toHaveLength(BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.cols);

    board.destroy();
    ticker.destroy();
  });

  it('removeMatches clears matched tiles from the board', () => {
    const stage = new Container();
    const ticker = new Ticker();

    const board = new Board({
      stage,
      viewportWidth: BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize,
      viewportHeight: BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize,
      ticker,
    });

    const layout: BejeweledTileId[][] = Array.from(
      { length: BEJEWELED_CONFIG.rows },
      (_, row) =>
        Array.from(
          { length: BEJEWELED_CONFIG.cols },
          (_, col) =>
            (['red', 'blue', 'green', 'yellow'][(row + col) % 4] ??
              'red') as BejeweledTileId,
        ),
    );

    layout[2]![1] = 'pink';
    layout[2]![2] = 'pink';
    layout[2]![3] = 'pink';

    board.debugApplyLayout(layout);

    const combinationManager = new CombinationManager(board);
    const clusters = combinationManager.findMatches();
    expect(clusters).toHaveLength(1);

    const removed = board.removeMatches(clusters);
    expect(removed).toHaveLength(3);
    expect(board.tiles).toHaveLength(BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.cols - 3);
    expect(board.fields[2]![1]!.tile).toBeNull();
    expect(board.fields[2]![2]!.tile).toBeNull();
    expect(board.fields[2]![3]!.tile).toBeNull();

    board.destroy();
    ticker.destroy();
  });

  it('dropTiles cascades tiles downward', async () => {
    const stage = new Container();
    const ticker = new Ticker();

    const board = new Board({
      stage,
      viewportWidth: BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize,
      viewportHeight: BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize,
      ticker,
    });

    const tileToDrop = board.fields[2]![0]!.tile!;
    for (let row = 3; row < BEJEWELED_CONFIG.rows; row += 1) {
      const field = board.fields[row]![0]!;
      const tile = field.tile;
      if (tile) {
        field.setTile(null);
        board.tiles.splice(board.tiles.indexOf(tile), 1);
      }
    }

    await board.dropTiles();

    expect(board.fields[7]![0]!.tile).toBe(tileToDrop);
    expect(board.fields[2]![0]!.tile).toBeNull();

    board.destroy();
    ticker.destroy();
  });

  it('spawnNewTiles fills empty slots with new tiles', async () => {
    const stage = new Container();
    const ticker = new Ticker();

    const board = new Board({
      stage,
      viewportWidth: BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize,
      viewportHeight: BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize,
      ticker,
    });

    const removed: Tile[] = [];
    for (let row = 0; row < BEJEWELED_CONFIG.rows; row += 1) {
      const field = board.fields[row]![3]!;
      const tile = field.tile;
      if (tile) {
        field.setTile(null);
        removed.push(tile);
        board.tiles.splice(board.tiles.indexOf(tile), 1);
      }
    }

    const created = await board.spawnNewTiles();

    expect(created.length).toBe(removed.length);
    for (let row = 0; row < BEJEWELED_CONFIG.rows; row += 1) {
      expect(board.fields[row]![3]!.tile).not.toBeNull();
    }

    board.destroy();
    ticker.destroy();
  });
});
