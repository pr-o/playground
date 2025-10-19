import { Container, Sprite, Ticker } from 'pixi.js';
import type { MatchCluster } from './combination-manager';
import { BEJEWELED_CONFIG, type BejeweledTileId } from './config';
import { getBoardDimensions } from './board-geometry';
import { Field } from './field';
import { Tile } from './tile';
import { getSelectedFieldTexture } from './resources';
import { tweenTo } from './animation';

export type BoardOptions = {
  stage: Container;
  viewportWidth: number;
  viewportHeight: number;
  ticker: Ticker;
  enableDebugOverlay?: boolean;
};

export class Board {
  readonly container: Container;
  readonly fieldsContainer: Container;
  readonly tilesContainer: Container;

  readonly fields: Field[][] = [];
  readonly tiles: Tile[] = [];

  onSwapRequest?: (from: Tile, to: Tile) => void;
  onSwapComplete?: (from: Tile, to: Tile, context: { reverse: boolean }) => void;
  onInvalidSwap?: (tiles: [Tile, Tile]) => void;

  private selectedTile: Tile | null = null;
  private readonly tileHandlers = new Map<Tile, () => void>();
  private inputEnabled = true;
  private readonly ticker: Ticker;
  private readonly debugLayer: Container;
  private debugOverlayEnabled: boolean;
  private feedbackTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(options: BoardOptions) {
    this.container = new Container();
    this.container.name = 'BejeweledBoard';

    this.fieldsContainer = new Container();
    this.fieldsContainer.name = 'FieldsLayer';

    this.tilesContainer = new Container();
    this.tilesContainer.name = 'TilesLayer';

    this.debugLayer = new Container();
    this.debugLayer.name = 'DebugMatchesLayer';
    this.debugLayer.visible = false;
    this.debugLayer.eventMode = 'none';

    this.container.addChild(this.fieldsContainer);
    this.container.addChild(this.tilesContainer);
    this.container.addChild(this.debugLayer);

    options.stage.addChild(this.container);
    this.ticker = options.ticker;
    this.debugOverlayEnabled = options.enableDebugOverlay ?? false;

    this.createFields();
    this.populateTiles();
    this.centerWithin(options.viewportWidth, options.viewportHeight);
  }

  resize(viewportWidth: number, viewportHeight: number) {
    this.centerWithin(viewportWidth, viewportHeight);
  }

  getField(row: number, col: number): Field | undefined {
    return this.fields[row]?.[col];
  }

  destroy() {
    this.setSelectedTile(null);
    this.tiles.forEach((tile) => tile.destroy());
    this.tileHandlers.forEach((handler, tile) => {
      tile.sprite.off('pointerdown', handler);
    });
    this.tileHandlers.clear();
    this.container.destroy({ children: true });
    this.fields.length = 0;
    this.tiles.length = 0;
  }

  private createFields() {
    for (let row = 0; row < BEJEWELED_CONFIG.rows; row += 1) {
      const rowFields: Field[] = [];
      for (let col = 0; col < BEJEWELED_CONFIG.cols; col += 1) {
        const field = new Field(row, col);
        this.fieldsContainer.addChild(field.sprite);
        rowFields.push(field);
      }
      this.fields.push(rowFields);
    }
  }

  private populateTiles() {
    for (const rowFields of this.fields) {
      for (const field of rowFields) {
        const tile = new Tile();
        this.attachTileToField(tile, field);
        this.tilesContainer.addChild(tile.sprite);
        this.tiles.push(tile);
      }
    }
  }

  private centerWithin(viewportWidth: number, viewportHeight: number) {
    const { width, height } = getBoardDimensions();
    const padding = BEJEWELED_CONFIG.boardPadding;
    const offsetX = Math.max((viewportWidth - width) / 2, padding);
    const offsetY = Math.max((viewportHeight - height) / 2, padding);

    this.container.position.set(offsetX, offsetY);
  }

  setDebugOverlay(enabled: boolean) {
    this.debugOverlayEnabled = enabled;
    if (!enabled) {
      this.clearDebugMatches();
    } else if (this.debugLayer.children.length > 0) {
      this.debugLayer.visible = true;
    }
  }

  setDebugMatches(clusters: MatchCluster[] | null) {
    if (!this.debugOverlayEnabled) {
      return;
    }

    this.debugLayer.removeChildren();

    if (!clusters || clusters.length === 0) {
      this.debugLayer.visible = false;
      return;
    }

    const seen = new Set<Tile>();
    for (const cluster of clusters) {
      for (const tile of cluster.tiles) {
        if (!tile.field || seen.has(tile)) {
          continue;
        }
        seen.add(tile);
        const marker = new Sprite(getSelectedFieldTexture());
        marker.anchor.set(0.5);
        marker.tint = 0xffc107;
        marker.alpha = 0.4;
        marker.eventMode = 'none';
        marker.position.copyFrom(tile.field.sprite.position);
        this.debugLayer.addChild(marker);
      }
    }

    this.debugLayer.visible =
      this.debugOverlayEnabled && this.debugLayer.children.length > 0;
  }

  clearDebugMatches() {
    this.debugLayer.removeChildren();
    this.debugLayer.visible = false;
  }

  async dropTiles(options: { animate?: boolean } = {}): Promise<void> {
    const { animate = true } = options;
    const animations: Promise<void>[] = [];

    for (let col = 0; col < BEJEWELED_CONFIG.cols; col += 1) {
      let targetRow = BEJEWELED_CONFIG.rows - 1;

      for (let row = BEJEWELED_CONFIG.rows - 1; row >= 0; row -= 1) {
        const sourceField = this.fields[row]?.[col];
        if (!sourceField) {
          continue;
        }

        const tile = sourceField.tile;
        if (!tile) {
          continue;
        }

        const targetField = this.fields[targetRow]![col]!;
        if (targetField !== sourceField) {
          sourceField.setTile(null);
          targetField.setTile(tile, { snap: false });

          const { x, y } = targetField.position;
          if (animate) {
            animations.push(
              tweenTo(
                tile.sprite,
                { x, y },
                {
                  duration: BEJEWELED_CONFIG.fallDuration,
                  ticker: this.ticker,
                },
              ).then(() => {
                tile.sprite.position.set(x, y);
              }),
            );
          } else {
            tile.sprite.position.set(x, y);
          }
        }

        targetRow -= 1;
      }
    }

    if (animate && animations.length > 0) {
      await Promise.all(animations);
    }
  }

  async spawnNewTiles(options: { animate?: boolean } = {}): Promise<Tile[]> {
    const { animate = true } = options;
    const created: Tile[] = [];
    const animations: Promise<void>[] = [];

    const strideY = BEJEWELED_CONFIG.tileSize + BEJEWELED_CONFIG.tileSpacing;

    for (let col = 0; col < BEJEWELED_CONFIG.cols; col += 1) {
      const emptyFields: Field[] = [];
      for (let row = BEJEWELED_CONFIG.rows - 1; row >= 0; row -= 1) {
        const field = this.fields[row]?.[col];
        if (field && !field.tile) {
          emptyFields.push(field);
        }
      }

      emptyFields.reverse();

      emptyFields.forEach((field, index) => {
        const tile = new Tile();
        this.registerTile(tile);
        this.tilesContainer.addChild(tile.sprite);
        this.tiles.push(tile);

        tile.setField(field, { snap: false });

        const { x, y } = field.position;
        const startY = y - strideY * (index + 1);
        tile.sprite.position.set(x, startY);

        if (animate) {
          animations.push(
            tweenTo(
              tile.sprite,
              { x, y },
              {
                duration: BEJEWELED_CONFIG.fallDuration,
                ticker: this.ticker,
              },
            ).then(() => {
              tile.sprite.position.set(x, y);
            }),
          );
        } else {
          tile.sprite.position.set(x, y);
        }

        created.push(tile);
      });
    }

    if (animate && animations.length > 0) {
      await Promise.all(animations);
    }

    return created;
  }

  removeMatches(clusters: MatchCluster[]): Tile[] {
    if (clusters.length === 0) {
      return [];
    }

    const uniqueTiles = new Set<Tile>();
    clusters.forEach((cluster) => cluster.tiles.forEach((tile) => uniqueTiles.add(tile)));

    const removed: Tile[] = [];
    for (const tile of uniqueTiles) {
      const handler = this.tileHandlers.get(tile);
      if (handler) {
        tile.sprite.off('pointerdown', handler);
        this.tileHandlers.delete(tile);
      }

      const field = tile.field;
      if (field) {
        field.setTile(null);
      }

      const index = this.tiles.indexOf(tile);
      if (index >= 0) {
        this.tiles.splice(index, 1);
      }

      tile.destroy();
      removed.push(tile);
    }

    this.clearDebugMatches();
    return removed;
  }

  debugApplyLayout(layout: BejeweledTileId[][]) {
    if (
      layout.length !== BEJEWELED_CONFIG.rows ||
      layout.some((row) => row.length !== BEJEWELED_CONFIG.cols)
    ) {
      throw new Error('Invalid debug layout dimensions');
    }

    const nextTiles: Tile[] = [];

    for (let row = 0; row < BEJEWELED_CONFIG.rows; row += 1) {
      for (let col = 0; col < BEJEWELED_CONFIG.cols; col += 1) {
        const field = this.fields[row]?.[col];
        if (!field) {
          continue;
        }

        const tileId = layout[row]![col]!;
        let tile = field.tile;

        if (!tile) {
          tile = new Tile(tileId);
          this.registerTile(tile);
          this.tilesContainer.addChild(tile.sprite);
        } else {
          tile.setId(tileId);
        }

        field.setTile(tile);
        tile.sprite.position.copyFrom(field.sprite.position);
        nextTiles.push(tile);
      }
    }

    this.tiles.length = 0;
    this.tiles.push(...nextTiles);
  }

  private attachTileToField(tile: Tile, field: Field) {
    field.setTile(tile);
    this.registerTile(tile);
    tile.sprite.zIndex = 1;
  }

  private registerTile(tile: Tile) {
    const handler = () => this.handleTilePointer(tile);
    this.tileHandlers.set(tile, handler);
    tile.sprite.on('pointerdown', handler);
  }

  private handleTilePointer(tile: Tile) {
    if (!this.inputEnabled) {
      return;
    }

    if (!this.selectedTile) {
      this.setSelectedTile(tile);
      return;
    }

    if (this.selectedTile === tile) {
      this.setSelectedTile(null);
      return;
    }

    if (this.selectedTile.isNeighbor(tile)) {
      const from = this.selectedTile;
      this.setSelectedTile(null);
      if (this.onSwapRequest) {
        this.onSwapRequest(from, tile);
      } else {
        void this.swapTiles(from, tile);
      }
      return;
    }

    this.setSelectedTile(tile);
  }

  private setSelectedTile(tile: Tile | null) {
    if (this.selectedTile?.field) {
      this.selectedTile.field.setSelected(false);
    }

    this.selectedTile = tile;

    if (tile && tile.field) {
      tile.field.setSelected(true);
    }
  }

  async swapTiles(
    tileA: Tile,
    tileB: Tile,
    options: { animate?: boolean; reverse?: boolean } = {},
  ) {
    if (!tileA.field || !tileB.field) {
      return;
    }

    const { animate = true, reverse = false } = options;
    const fieldA = tileA.field;
    const fieldB = tileB.field;
    const targetPosA = fieldB.position;
    const targetPosB = fieldA.position;

    this.inputEnabled = false;
    this.setSelectedTile(null);

    fieldA.setTile(tileB, { snap: !animate });
    fieldB.setTile(tileA, { snap: !animate });

    try {
      if (animate) {
        const duration = BEJEWELED_CONFIG.swapDuration;
        await Promise.all([
          tweenTo(
            tileA.sprite,
            { x: targetPosA.x, y: targetPosA.y },
            { duration, ticker: this.ticker },
          ),
          tweenTo(
            tileB.sprite,
            { x: targetPosB.x, y: targetPosB.y },
            { duration, ticker: this.ticker },
          ),
        ]);
      }

      tileA.sprite.position.set(targetPosA.x, targetPosA.y);
      tileB.sprite.position.set(targetPosB.x, targetPosB.y);

      this.onSwapComplete?.(tileA, tileB, { reverse });
      if (reverse) {
        this.onInvalidSwap?.([tileA, tileB]);
      }
    } finally {
      this.inputEnabled = true;
    }
  }

  flashInvalidSwap(pair: [Tile, Tile]) {
    const affected = pair.filter((tile) => tile && tile.sprite);
    if (affected.length === 0) {
      return;
    }

    if (this.feedbackTimeout) {
      clearTimeout(this.feedbackTimeout);
    }

    const flashes = 3;
    const interval = 120;
    let count = 0;
    const amplitude = Math.max(2, Math.floor(BEJEWELED_CONFIG.tileSpacing / 2));

    const originals = affected.map((tile) => ({
      tile,
      x: tile.sprite.position.x,
      y: tile.sprite.position.y,
    }));

    const apply = () => {
      const isDim = count % 2 === 0;
      const direction = count % 2 === 0 ? 1 : -1;

      affected.forEach((tile, index) => {
        tile.sprite.alpha = isDim ? 0.35 : 1;
        const origin = originals[index];
        tile.sprite.position.set(origin.x + direction * amplitude, origin.y);
      });

      count += 1;

      if (count <= flashes * 2) {
        this.feedbackTimeout = setTimeout(apply, interval);
      } else {
        originals.forEach(({ tile, x, y }) => {
          tile.sprite.alpha = 1;
          tile.sprite.position.set(x, y);
        });
        this.feedbackTimeout = null;
      }
    };

    apply();
  }
}
