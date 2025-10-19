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
  }

  const Texture = {
    from: () => ({ width: 64, height: 64 }),
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

import { Container, Ticker } from 'pixi.js';
import { Board } from '@/lib/bejeweled/board';
import { BEJEWELED_CONFIG } from '@/lib/bejeweled/config';

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
});
