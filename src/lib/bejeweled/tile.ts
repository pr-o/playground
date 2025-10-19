import { Sprite } from 'pixi.js';
import type { Field } from './field';
import type { BejeweledTileId } from './config';
import { getRandomTileId, getTileTexture } from './resources';

export class Tile {
  readonly id: BejeweledTileId;
  readonly sprite: Sprite;
  field: Field | null = null;

  constructor(id: BejeweledTileId = getRandomTileId()) {
    this.id = id;
    this.sprite = new Sprite(getTileTexture(id));
    this.sprite.anchor.set(0.5);
    this.sprite.eventMode = 'static';
    this.sprite.cursor = 'pointer';
  }

  setField(field: Field | null) {
    if (this.field && this.field !== field && this.field.tile === this) {
      this.field.tile = null;
    }

    this.field = field;

    if (field) {
      const { x, y } = field.position;
      this.sprite.position.set(x, y);
    }
  }

  isNeighbor(other: Tile): boolean {
    if (!this.field || !other.field) {
      return false;
    }

    const rowDiff = Math.abs(this.field.row - other.field.row);
    const colDiff = Math.abs(this.field.col - other.field.col);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  destroy() {
    this.setField(null);
    this.sprite.destroy();
  }
}
