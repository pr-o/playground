import { Application, type ApplicationOptions } from 'pixi.js';

export type SlitherApp = Application;
export type SlitherAppOptions = Partial<ApplicationOptions>;

export const createSlitherApp = async (
  options: SlitherAppOptions = {},
): Promise<SlitherApp> => {
  if (typeof window === 'undefined') {
    throw new Error('createSlitherApp can only be used in the browser.');
  }

  const app = new Application();

  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio ?? 1,
    autoDensity: true,
    powerPreference: 'high-performance',
    ...options,
  });

  app.ticker.maxFPS = 60;

  return app;
};
