import { Texture } from 'pixi.js';
import { BEJEWELED_CONFIG, type BejeweledTileId } from './config';

const fieldTextureCache: {
  normal?: Texture;
  selected?: Texture;
} = {};

const tileTextureCache: Partial<Record<BejeweledTileId, Texture>> = {};

export function getFieldTexture(): Texture {
  if (!fieldTextureCache.normal) {
    fieldTextureCache.normal = Texture.from(BEJEWELED_CONFIG.textures.field);
  }
  return fieldTextureCache.normal;
}

export function getSelectedFieldTexture(): Texture {
  if (!fieldTextureCache.selected) {
    fieldTextureCache.selected = Texture.from(BEJEWELED_CONFIG.textures.fieldSelected);
  }
  return fieldTextureCache.selected;
}

export function getTileTexture(id: BejeweledTileId): Texture {
  const cached = tileTextureCache[id];
  if (cached) {
    return cached;
  }

  const found = BEJEWELED_CONFIG.tileTypes.find((tile) => tile.id === id);
  if (!found) {
    throw new Error(`Unknown Bejeweled tile id: ${id as string}`);
  }

  const texture = Texture.from(found.texture);
  tileTextureCache[id] = texture;
  return texture;
}

export function getRandomTileId(): BejeweledTileId {
  const index = Math.floor(Math.random() * BEJEWELED_CONFIG.tileTypes.length);
  return BEJEWELED_CONFIG.tileTypes[index]!.id;
}
