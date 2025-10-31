import type { SlitherConfig } from './config';
import { clamp, lerp, length } from './math';
import type { CameraState, GameState, Vector2 } from './types';

export type CameraUpdateContext = {
  targetPosition: Vector2;
  targetZoom?: number;
  dt: number;
};

export const createCameraState = (
  config: SlitherConfig,
  initialPosition: Vector2,
  initialZoom = config.maxZoom,
): CameraState => {
  const position = { x: initialPosition.x, y: initialPosition.y };
  clampPositionToWorld(position, config.worldRadius);
  const clampedZoom = clamp(initialZoom, config.minZoom, config.maxZoom);

  return {
    position,
    zoom: clampedZoom,
    targetZoom: clampedZoom,
  };
};

export const snapCameraTo = (state: GameState, position: Vector2, zoom?: number) => {
  const { camera, config } = state;
  camera.position.x = position.x;
  camera.position.y = position.y;
  clampPositionToWorld(camera.position, config.worldRadius);

  const nextZoom = zoom ?? camera.zoom;
  const clampedZoom = clamp(nextZoom, config.minZoom, config.maxZoom);
  camera.zoom = clampedZoom;
  camera.targetZoom = clampedZoom;
};

export const setCameraTargetZoom = (state: GameState, zoom: number) => {
  const clamped = clamp(zoom, state.config.minZoom, state.config.maxZoom);
  state.camera.targetZoom = clamped;
};

export const updateCamera = (state: GameState, context: CameraUpdateContext) => {
  const { camera, config } = state;
  const { targetPosition, targetZoom, dt } = context;

  const followFactor = smoothingFactor(config.camera.followLerp, dt);
  camera.position.x = lerp(camera.position.x, targetPosition.x, followFactor);
  camera.position.y = lerp(camera.position.y, targetPosition.y, followFactor);

  clampPositionToWorld(camera.position, config.worldRadius);

  const nextTargetZoom =
    targetZoom !== undefined
      ? clamp(targetZoom, config.minZoom, config.maxZoom)
      : camera.targetZoom;

  camera.targetZoom = nextTargetZoom;

  const zoomFactor = smoothingFactor(config.camera.zoomLerp, dt);
  camera.zoom = lerp(camera.zoom, camera.targetZoom, zoomFactor);
};

const clampPositionToWorld = (position: Vector2, worldRadius: number) => {
  const dist = length(position);
  if (dist <= worldRadius) return;

  if (dist === 0) {
    position.x = 0;
    position.y = 0;
    return;
  }

  const scale = worldRadius / dist;
  position.x *= scale;
  position.y *= scale;
};

const smoothingFactor = (base: number, dt: number) => {
  if (dt <= 0) return 1;
  const clampedBase = clamp(base, 0, 1);
  const steps = Math.max(dt * 60, 0);
  return 1 - Math.pow(1 - clampedBase, steps);
};
