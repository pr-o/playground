import { Application } from 'pixi.js';
import { MATCH3_CONFIG } from './config';
import { loadMatch3Assets } from './assets';

export type Match3PixiContext = {
  app: Application;
};

export async function initMatch3Pixi(container: HTMLElement): Promise<Match3PixiContext> {
  const targetWidth =
    container.clientWidth || MATCH3_CONFIG.cols * MATCH3_CONFIG.tileSize;
  const targetHeight =
    container.clientHeight || MATCH3_CONFIG.rows * MATCH3_CONFIG.tileSize;

  const app = new Application();
  await app.init({
    width: targetWidth,
    height: targetHeight,
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
  });

  container.replaceChildren(app.canvas);

  await loadMatch3Assets();

  return { app };
}
