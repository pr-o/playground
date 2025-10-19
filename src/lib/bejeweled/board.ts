import { Container, Sprite, Ticker } from 'pixi.js';
import { BEJEWELED_CONFIG } from './config';
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
};

export class Board {
  readonly container: Container;
  readonly fieldsContainer: Container;
  readonly tilesContainer: Container;
  readonly highlightSprite: Sprite;

  readonly fields: Field[][] = [];
  readonly tiles: Tile[] = [];

  onSwapComplete?: (from: Tile, to: Tile, context: { reverse: boolean }) => void;

  private selectedTile: Tile | null = null;
  private readonly tileHandlers = new Map<Tile, () => void>();
  private inputEnabled = true;
  private readonly ticker: Ticker;

  constructor(options: BoardOptions) {
    this.container = new Container();
    this.container.name = 'BejeweledBoard';

    this.fieldsContainer = new Container();
    this.fieldsContainer.name = 'FieldsLayer';

    this.tilesContainer = new Container();
    this.tilesContainer.name = 'TilesLayer';

    this.highlightSprite = new Sprite(getSelectedFieldTexture());
    this.highlightSprite.anchor.set(0.5);
    this.highlightSprite.visible = false;

    this.container.addChild(this.fieldsContainer);
    this.container.addChild(this.highlightSprite);
    this.container.addChild(this.tilesContainer);

    options.stage.addChild(this.container);
    this.ticker = options.ticker;

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
    this.tiles.forEach((tile) => tile.destroy());
    this.tileHandlers.forEach((handler, tile) => {
      tile.sprite.off('pointerdown', handler);
    });
    this.tileHandlers.clear();
    this.selectedTile = null;
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

  private attachTileToField(tile: Tile, field: Field) {
    field.setTile(tile);
    this.registerTile(tile);
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
      void this.swapTiles(from, tile);
      return;
    }

    this.setSelectedTile(tile);
  }

  private setSelectedTile(tile: Tile | null) {
    this.selectedTile = tile;

    if (tile && tile.field) {
      this.highlightSprite.visible = true;
      this.highlightSprite.position.copyFrom(tile.field.sprite.position);
    } else {
      this.highlightSprite.visible = false;
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
    } finally {
      this.inputEnabled = true;
    }
  }
}
