import { Sprite } from 'pixi.js';
import type { Field } from './field';
import type { BejeweledTileId } from './config';
import { getRandomTileId, getTileTexture } from './resources';

type SetFieldOptions = {
  snap?: boolean;
};

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

  setField(field: Field | null, options: SetFieldOptions = {}) {
    const { snap = true } = options;
    const previousField = this.field;

    if (previousField && previousField !== field && previousField.tile === this) {
      previousField.tile = null;
    }

    this.field = field;

    if (!field) {
      return;
    }

    if (field.tile !== this) {
      field.tile = this;
    }

    if (snap) {
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
