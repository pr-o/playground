import { Container, Graphics } from 'pixi.js';
import type { SlitherApp } from './pixi';
import type { GameState, SnakeSegment } from './types';

export type SlitherRenderer = {
  root: Container;
  render: (state: GameState) => void;
  destroy: () => void;
};

export const createSlitherRenderer = (
  app: SlitherApp,
  state: GameState,
): SlitherRenderer => {
  const root = new Container();
  const world = new Container();
  const background = new Graphics();
  const pellets = new Graphics();
  const snakes = new Graphics();
  let currentState = state;

  world.addChild(background);
  world.addChild(pellets);
  world.addChild(snakes);
  root.addChild(world);

  drawWorld(background, state);
  const renderScene = (nextState: GameState) => {
    currentState = nextState;
    drawPellets(pellets, currentState);
    drawSnake(snakes, currentState);
    applyCamera(app, world, currentState);
  };

  renderScene(state);

  app.stage.addChild(root);

  const handleResize = () => applyCamera(app, world, currentState);
  const resizeObserver = createResizeObserver(app, handleResize);

  return {
    root,
    render: renderScene,
    destroy: () => {
      resizeObserver?.();
      if (root.parent) {
        root.parent.removeChild(root);
      }
      root.destroy({ children: true });
    },
  };
};

const drawWorld = (gfx: Graphics, state: GameState) => {
  const {
    config: {
      worldRadius,
      palette: { background, grid },
    },
  } = state;

  gfx.clear();

  // Outer arena boundary
  gfx.circle(0, 0, worldRadius).fill({ color: parseHex(background), alpha: 0.1 });
  gfx
    .circle(0, 0, worldRadius)
    .stroke({ color: parseHex(background), alpha: 0.35, width: 8 });

  // Radial grid rings
  const ringCount = 6;
  const ringColor = parseCssColor(grid);

  for (let i = 1; i <= ringCount; i += 1) {
    const radius = (worldRadius / ringCount) * i;
    gfx.circle(0, 0, radius).stroke({ color: ringColor, alpha: 0.18, width: 1 });
  }
};

const drawPellets = (gfx: Graphics, state: GameState) => {
  gfx.clear();

  for (const pellet of state.pellets) {
    gfx.circle(pellet.position.x, pellet.position.y, pellet.radius).fill({
      color: parseHex(pellet.color),
      alpha: 0.92,
    });
  }
};

const drawSnake = (gfx: Graphics, state: GameState) => {
  gfx.clear();
  const palette = state.config.palette.player;

  const radius = state.config.snake.segmentSpacing * 0.55;
  const segments = state.player.segments;
  const lastIndex = segments.length - 1;

  for (let i = lastIndex; i >= 0; i -= 1) {
    const segment = segments[i];
    const color = pickGradientColor(palette, i / Math.max(lastIndex, 1));

    const alpha = 0.65 + 0.35 * (1 - i / Math.max(lastIndex, 1));
    const scale = 0.75 + 0.25 * (1 - i / Math.max(lastIndex, 1));

    gfx.circle(segment.position.x, segment.position.y, radius * scale).fill({
      color,
      alpha,
    });
  }

  drawHeadHighlight(gfx, segments);
};

const drawHeadHighlight = (gfx: Graphics, segments: SnakeSegment[]) => {
  const head = segments[0];
  if (!head) return;

  gfx.circle(head.position.x, head.position.y, 4).fill({ color: 0xffffff, alpha: 0.9 });
};

const applyCamera = (app: SlitherApp, world: Container, state: GameState) => {
  const {
    camera: { position, zoom },
  } = state;
  const renderer = app.renderer as PixiRendererLike;
  const screen = renderer?.screen ?? {
    width: renderer?.width ?? 0,
    height: renderer?.height ?? 0,
  };

  world.pivot.set(position.x, position.y);
  world.position.set(screen.width / 2, screen.height / 2);
  world.scale.set(zoom, zoom);
};

const createResizeObserver = (
  app: SlitherApp,
  callback: () => void,
): (() => void) | null => {
  const renderer = app.renderer as PixiRendererLike & { resizeTo?: Element | null };
  const resizeElem = renderer.resizeTo ?? app.canvas.parentElement;

  if (!resizeElem || typeof ResizeObserver === 'undefined') {
    return null;
  }

  const observer = new ResizeObserver(() => callback());
  observer.observe(resizeElem);

  return () => observer.disconnect();
};

const pickGradientColor = (palette: string[], t: number): number => {
  if (palette.length === 0) return 0xffffff;
  if (palette.length === 1) return parseHex(palette[0]);

  const scaled = t * (palette.length - 1);
  const startIndex = Math.floor(scaled);
  const endIndex = Math.min(startIndex + 1, palette.length - 1);
  const localT = scaled - startIndex;

  const startColor = parseHex(palette[startIndex]);
  const endColor = parseHex(palette[endIndex]);

  const r = lerpChannel((startColor >> 16) & 0xff, (endColor >> 16) & 0xff, localT);
  const g = lerpChannel((startColor >> 8) & 0xff, (endColor >> 8) & 0xff, localT);
  const b = lerpChannel(startColor & 0xff, endColor & 0xff, localT);

  return (r << 16) | (g << 8) | b;
};

const lerpChannel = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

const parseHex = (hex: string): number => {
  const value = hex.startsWith('#') ? hex.slice(1) : hex;
  return Number.parseInt(value, 16);
};

const parseCssColor = (cssColor: string): number => {
  if (cssColor.startsWith('#')) {
    return parseHex(cssColor);
  }

  const match = cssColor.match(/rgba?\(([^)]+)\)/i);
  if (!match) {
    return 0xffffff;
  }

  const [r, g, b] = match[1]
    .split(',')
    .slice(0, 3)
    .map((channel) => Number.parseFloat(channel.trim()) || 0);

  return (clampChannel(r) << 16) | (clampChannel(g) << 8) | clampChannel(b);
};

type PixiRendererLike = {
  screen?: { width: number; height: number };
  width?: number;
  height?: number;
};

const clampChannel = (value: number) => Math.round(Math.min(Math.max(value, 0), 255));
