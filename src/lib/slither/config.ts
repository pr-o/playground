export type SlitherPalette = {
  background: string;
  grid: string;
  player: string[];
  bots: string[];
  pellets: {
    normal: string;
    rare: string;
    boost: string;
  };
};

export type SlitherConfig = {
  worldRadius: number;
  minZoom: number;
  maxZoom: number;
  baseSpeed: number;
  boostMultiplier: number;
  boostDrainRate: number;
  boostRegenRate: number;
  pellet: {
    initialCount: number;
    maxCount: number;
    rareChance: number;
    boostChance: number;
    radius: number;
  };
  snake: {
    initialLength: number;
    minTurnRadius: number;
    segmentSpacing: number;
    growthPerPellet: number;
    growthApplyRate: number;
  };
  camera: {
    followLerp: number;
    zoomLerp: number;
    zoomSpeedFactor: number;
  };
  particles: {
    maxTrail: number;
    burstPool: number;
  };
  palette: SlitherPalette;
};

export const defaultSlitherConfig: SlitherConfig = {
  worldRadius: 2500,
  minZoom: 0.45,
  maxZoom: 1.1,
  baseSpeed: 180,
  boostMultiplier: 1.8,
  boostDrainRate: 24,
  boostRegenRate: 12,
  pellet: {
    initialCount: 320,
    maxCount: 380,
    rareChance: 0.08,
    boostChance: 0.04,
    radius: 6,
  },
  snake: {
    initialLength: 24,
    minTurnRadius: 16,
    segmentSpacing: 10,
    growthPerPellet: 8,
    growthApplyRate: 48,
  },
  camera: {
    followLerp: 0.1,
    zoomLerp: 0.08,
    zoomSpeedFactor: 0.002,
  },
  particles: {
    maxTrail: 160,
    burstPool: 96,
  },
  palette: {
    background: '#040714',
    grid: 'rgba(255,255,255,0.04)',
    player: ['#49f8ff', '#3ed1ff', '#8dfdff'],
    bots: ['#f97316', '#db2777', '#22d3ee', '#84cc16', '#c084fc'],
    pellets: {
      normal: '#facc15',
      rare: '#fde68a',
      boost: '#fb7185',
    },
  },
};

export type SlitherConfigOverrides = PartialDeep<SlitherConfig>;

export const createSlitherConfig = (
  overrides: SlitherConfigOverrides = {},
): SlitherConfig => mergeConfig(defaultSlitherConfig, overrides);

function mergeConfig<T>(base: T, overrides: PartialDeep<T>): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(overrides)) {
      return [...(base as unknown[])] as unknown as T;
    }

    return overrides.map((item, index) => {
      const original = (base as unknown[])[index];

      if (isPlainObject(item) && isPlainObject(original)) {
        return mergeConfig(original, item as PartialDeep<typeof original>);
      }

      if (Array.isArray(item)) {
        return [...item];
      }

      return isPlainObject(item) ? { ...(item as Record<string, unknown>) } : item;
    }) as unknown as T;
  }

  if (!isPlainObject(base)) {
    return (overrides as T) ?? base;
  }

  if (!isPlainObject(overrides)) {
    return { ...(base as Record<string, unknown>) } as T;
  }

  const result: Record<string, unknown> = {
    ...(base as Record<string, unknown>),
  };

  for (const key of Object.keys(overrides) as Array<keyof typeof overrides>) {
    const overrideValue = overrides[key];
    if (overrideValue === undefined) continue;

    const originalValue = (base as Record<string, unknown>)[key as string];

    if (Array.isArray(overrideValue)) {
      result[key as string] = overrideValue.map((item) =>
        Array.isArray(item)
          ? [...item]
          : isPlainObject(item)
            ? { ...(item as Record<string, unknown>) }
            : item,
      );
      continue;
    }

    if (isPlainObject(overrideValue) && isPlainObject(originalValue)) {
      result[key as string] = mergeConfig(originalValue, overrideValue);
      continue;
    }

    result[key as string] = overrideValue;
  }

  return result as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && value.constructor === Object;
}

type PartialDeep<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown>
    ? PartialDeep<T[K]>
    : T[K] extends Array<infer U>
      ? Array<PartialDeep<U>>
      : T[K];
};
