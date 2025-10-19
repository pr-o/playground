import { Application } from 'pixi.js';
import { BEJEWELED_CONFIG } from './config';
import { loadBejeweledAssets } from './assets';

export type BejeweledPixiContext = {
  app: Application;
};

export async function initBejeweledPixi(
  container: HTMLElement,
): Promise<BejeweledPixiContext> {
  const targetWidth =
    container.clientWidth || BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize;
  const targetHeight =
    container.clientHeight || BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize;

  const app = new Application();
  await app.init({
    width: targetWidth,
    height: targetHeight,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
  });

  container.replaceChildren(app.canvas);

  await loadBejeweledAssets();

  return { app };
}
