import { Container, Sprite } from 'pixi.js';
import { BEJEWELED_CONFIG } from './config';
import { getBoardDimensions } from './board-geometry';
import { Field } from './field';
import { Tile } from './tile';
import { getSelectedFieldTexture } from './resources';

export type BoardOptions = {
  stage: Container;
  viewportWidth: number;
  viewportHeight: number;
};

export class Board {
  readonly container: Container;
  readonly fieldsContainer: Container;
  readonly tilesContainer: Container;
  readonly highlightSprite: Sprite;

  readonly fields: Field[][] = [];
  readonly tiles: Tile[] = [];

  onValidSwap?: (from: Tile, to: Tile) => void;

  private selectedTile: Tile | null = null;
  private readonly tileHandlers = new Map<Tile, () => void>();
  private inputEnabled = true;

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
      this.onValidSwap?.(from, tile);
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
}
