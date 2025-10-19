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
  }

  setField(field: Field | null) {
    this.field = field;
    if (field) {
      const { x, y } = field.position;
      this.sprite.position.set(x, y);
      field.tile = this;
    }
  }

  destroy() {
    this.sprite.destroy();
    this.field = null;
  }
}
