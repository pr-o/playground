import { Assets } from 'pixi.js';
import { BEJEWELED_CONFIG } from './config';

let manifestRegistered = false;

const bundleId = 'bejeweled';

function registerManifest() {
  if (manifestRegistered) {
    return;
  }

  const baseTextures: Record<string, string> = {
    background: BEJEWELED_CONFIG.textures.background,
    field: BEJEWELED_CONFIG.textures.field,
    fieldSelected: BEJEWELED_CONFIG.textures.fieldSelected,
  };

  const tileTextures = BEJEWELED_CONFIG.tileTypes.reduce<Record<string, string>>(
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

export async function loadBejeweledAssets() {
  registerManifest();

  return Assets.loadBundle(bundleId);
}
