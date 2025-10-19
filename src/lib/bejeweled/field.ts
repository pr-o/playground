import { Sprite } from 'pixi.js';
import { boardToWorld } from './board-geometry';
import { getFieldTexture } from './resources';
import type { Tile } from './tile';

export class Field {
  readonly row: number;
  readonly col: number;
  readonly sprite: Sprite;
  tile: Tile | null = null;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.sprite = new Sprite(getFieldTexture());
    this.sprite.anchor.set(0.5);
    this.updateSpritePosition();
  }

  get position() {
    return boardToWorld({ row: this.row, col: this.col });
  }

  setTile(tile: Tile | null) {
    if (this.tile === tile) {
      return;
    }

    const previous = this.tile;
    if (previous) {
      previous.setField(null);
    }

    this.tile = tile;

    if (tile) {
      tile.setField(this);
    }
  }

  updateSpritePosition() {
    const { x, y } = this.position;
    this.sprite.position.set(x, y);
  }
}
