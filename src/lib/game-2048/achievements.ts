import type { Achievement, AchievementDefinition, GameMetrics } from './types';

type TimestampFactory = () => number;

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: '25_moves',
    label: 'Getting Warm',
    description: 'Log 25 moves across all sessions.',
    icon: 'sparkles',
    target: 25,
    trackKey: 'totalMoves',
  },
  {
    id: '50_moves',
    label: 'On A Roll',
    description: 'Log 50 moves across all sessions.',
    icon: 'medal',
    target: 50,
    trackKey: 'totalMoves',
  },
  {
    id: '100_moves',
    label: 'Centurion',
    description: 'Make 100 moves across all sessions.',
    icon: 'trophy',
    target: 100,
    trackKey: 'totalMoves',
  },
  {
    id: 'undo_5',
    label: 'Time Twister',
    description: 'Use undo five times to revisit past boards.',
    icon: 'undo',
    target: 5,
    trackKey: 'undoUses',
  },
  {
    id: 'spawned_100_fours',
    label: 'Lucky Roller',
    description: 'Spawn one hundred value-four tiles.',
    icon: 'sparkles',
    target: 100,
    trackKey: 'totalFours',
  },
  {
    id: 'fifth_new_game',
    label: 'Seasoned Starter',
    description: 'Kick off five separate games.',
    icon: 'sprout',
    target: 5,
    trackKey: 'gamesStarted',
  },
  {
    id: 'first_tile_32',
    label: 'First Ember',
    description: 'Reach a tile value of 32.',
    icon: 'gem',
    target: 32,
    trackKey: 'maxTile',
  },
  {
    id: 'first_tile_64',
    label: 'Step Into 64',
    description: 'Reach a tile value of 64.',
    icon: 'gem',
    target: 64,
    trackKey: 'maxTile',
  },
  {
    id: 'first_tile_128',
    label: 'Triple Digits',
    description: 'Reach a tile value of 128.',
    icon: 'gem',
    target: 128,
    trackKey: 'maxTile',
  },
  {
    id: 'first_tile_256',
    label: 'Quarter Kilobyte',
    description: 'Reach a tile value of 256.',
    icon: 'gem',
    target: 256,
    trackKey: 'maxTile',
  },
  {
    id: 'first_tile_512',
    label: 'Halfway There',
    description: 'Reach a tile value of 512.',
    icon: 'gem',
    target: 512,
    trackKey: 'maxTile',
  },
  {
    id: 'first_tile_1024',
    label: 'Into The Thousands',
    description: 'Reach a tile value of 1024.',
    icon: 'gem',
    target: 1024,
    trackKey: 'maxTile',
  },
  {
    id: 'first_2048',
    label: 'First Crown',
    description: 'Reach the 2048 tile at least once.',
    icon: 'crown',
    target: 2048,
    trackKey: 'maxTile',
  },
  {
    id: 'max_tile_4096',
    label: 'Beyond 2048',
    description: 'Reach a tile value of 4096.',
    icon: 'gem',
    target: 4096,
    trackKey: 'maxTile',
  },
];

const definitionMap = new Map<string, AchievementDefinition>(
  ACHIEVEMENT_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export const createInitialAchievements = (): Achievement[] =>
  ACHIEVEMENT_DEFINITIONS.map((definition) => ({
    ...definition,
    progress: 0,
    unlockedAt: null,
  }));

export const mergeAchievementsWithDefinitions = (
  incoming: Achievement[] | undefined | null,
): Achievement[] => {
  const incomingMap = new Map<string, Achievement>(
    Array.isArray(incoming)
      ? incoming.map((achievement) => [achievement.id, achievement])
      : [],
  );

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const previous = incomingMap.get(definition.id);
    const progress = previous
      ? Math.max(0, Math.min(previous.progress, definition.target))
      : 0;
    const unlockedAt = previous?.unlockedAt ?? null;
    return {
      ...definition,
      progress,
      unlockedAt,
    };
  });
};

export const evaluateAchievements = (
  achievements: Achievement[],
  metrics: GameMetrics,
  getTimestamp: TimestampFactory = () => Date.now(),
): Achievement[] => {
  let didChange = false;

  const nextAchievements = achievements.map((achievement) => {
    const definition = definitionMap.get(achievement.id);
    if (!definition) {
      return achievement;
    }

    const trackedValue = metrics[definition.trackKey] ?? 0;
    const progress = Math.max(0, Math.min(trackedValue, definition.target));
    const hasUnlocked = progress >= definition.target;
    const unlockedAt = hasUnlocked ? (achievement.unlockedAt ?? getTimestamp()) : null;

    if (
      progress !== achievement.progress ||
      unlockedAt !== achievement.unlockedAt ||
      achievement.label !== definition.label ||
      achievement.description !== definition.description ||
      achievement.icon !== definition.icon ||
      achievement.target !== definition.target
    ) {
      didChange = true;
      return {
        ...achievement,
        label: definition.label,
        description: definition.description,
        icon: definition.icon,
        target: definition.target,
        progress,
        unlockedAt,
      };
    }

    return achievement;
  });

  return didChange ? nextAchievements : achievements;
};
