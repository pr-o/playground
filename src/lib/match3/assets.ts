import { Assets, type ResolverAsset } from 'pixi.js';
import { MATCH3_CONFIG } from './config';

let manifestRegistered = false;

const bundleId = 'match3';

function registerManifest() {
  if (manifestRegistered) {
    return;
  }

  const baseTextures: Record<string, ResolverAsset> = {
    background: MATCH3_CONFIG.textures.background,
    field: MATCH3_CONFIG.textures.field,
    fieldSelected: MATCH3_CONFIG.textures.fieldSelected,
  };

  const tileTextures = MATCH3_CONFIG.tileTypes.reduce<Record<string, ResolverAsset>>(
    (acc, { id, texture }) => {
      acc[`tile-${id}`] = texture;
      return acc;
    },
    {},
  );

  Assets.addBundle(bundleId, {
    ...baseTextures,
    ...tileTextures,
  });

  manifestRegistered = true;
}

export async function loadMatch3Assets() {
  registerManifest();

  return Assets.loadBundle(bundleId);
}
