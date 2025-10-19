import { Sprite } from 'pixi.js';
import { boardToWorld } from './board-geometry';
import { BEJEWELED_CONFIG } from './config';
import { getFieldTexture, getSelectedFieldTexture } from './resources';
import type { Tile } from './tile';

type SetTileOptions = {
  snap?: boolean;
};

export class Field {
  readonly row: number;
  readonly col: number;
  readonly sprite: Sprite;
  tile: Tile | null = null;
  private selected = false;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
    this.sprite = new Sprite(getFieldTexture());
    this.sprite.anchor.set(0.5);
    this.applyTexture(getFieldTexture());
    this.updateSpritePosition();
  }

  get position() {
    return boardToWorld({ row: this.row, col: this.col });
  }

  setTile(tile: Tile | null, options: SetTileOptions = {}) {
    const { snap = true } = options;

    if (this.tile === tile) {
      if (tile) {
        tile.setField(this, { snap });
      }
      return;
    }

    if (this.tile) {
      this.tile.setField(null);
    }

    this.tile = tile;

    if (tile) {
      tile.setField(this, { snap });
    }
  }

  setSelected(selected: boolean) {
    if (this.selected === selected) {
      return;
    }
    this.selected = selected;
    this.applyTexture(selected ? getSelectedFieldTexture() : getFieldTexture());
  }

  updateSpritePosition() {
    const { x, y } = this.position;
    this.sprite.position.set(x, y);
  }

  private applyTexture(texture: ReturnType<typeof getFieldTexture>) {
    this.sprite.texture = texture;
    const targetSize = BEJEWELED_CONFIG.tileSize - BEJEWELED_CONFIG.tileSpacing;
    const scale = targetSize / texture.width;
    this.sprite.scale.set(scale);
  }
}
