import { useMemo, useRef, useState } from 'react';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  SPAWN_POSITION,
  SevenBagGenerator,
  clearCompletedLines,
  createEmptyBoard,
  getNextRotation,
  getTetrominoShape,
  lockShapeIntoBoard,
  type ActivePiece,
  type Board,
  type RotationIndex,
  type TetrominoId,
} from '@/lib/tetris';

type TetrisStats = {
  score: number;
  lines: number;
  level: number;
};

type TetrisState = {
  board: Board;
  active: ActivePiece | null;
  queue: TetrominoId[];
  hold: TetrominoId | null;
  canHold: boolean;
  stats: TetrisStats;
  isGameOver: boolean;
};

const INITIAL_STATS: TetrisStats = {
  score: 0,
  lines: 0,
  level: 1,
};

const createInitialState = (): TetrisState => ({
  board: createEmptyBoard(),
  active: null,
  queue: [],
  hold: null,
  canHold: true,
  stats: INITIAL_STATS,
  isGameOver: false,
});

const scoreForClearedLines = (lines: number, level: number): number => {
  if (lines === 0) return 0;
  const baseScores = [0, 100, 300, 500, 800];
  const base = baseScores[lines] ?? baseScores[baseScores.length - 1];
  return base * level;
};

const spawnTetromino = (
  board: Board,
  id: TetrominoId,
  rotation: RotationIndex = 0,
): ActivePiece | null => {
  const shape = getTetrominoShape(id, rotation);
  const active: ActivePiece = {
    id,
    rotation,
    position: { ...SPAWN_POSITION },
    shape,
  };
  const canSpawn = shape.every(({ row, col }) => {
    const targetRow = SPAWN_POSITION.row + row;
    const targetCol = SPAWN_POSITION.col + col;

    if (
      targetRow < 0 ||
      targetRow >= BOARD_HEIGHT ||
      targetCol < 0 ||
      targetCol >= BOARD_WIDTH
    ) {
      return false;
    }

    return board[targetRow][targetCol] === null;
  });

  return canSpawn ? active : null;
};

const applyMove = (
  state: TetrisState,
  delta: { row: number; col: number },
): TetrisState => {
  if (!state.active) return state;

  const { board, active } = state;
  const nextPosition = {
    row: active.position.row + delta.row,
    col: active.position.col + delta.col,
  };

  const canMove = active.shape.every(({ row, col }) => {
    const targetRow = nextPosition.row + row;
    const targetCol = nextPosition.col + col;

    return (
      targetCol >= 0 &&
      targetCol < BOARD_WIDTH &&
      targetRow < BOARD_HEIGHT &&
      (targetRow < 0 || board[targetRow]?.[targetCol] === null)
    );
  });

  if (!canMove) {
    return state;
  }

  return {
    ...state,
    active: {
      ...active,
      position: nextPosition,
    },
  };
};

const rotateActive = (state: TetrisState, direction: 'cw' | 'ccw'): TetrisState => {
  if (!state.active) {
    return state;
  }

  const current = state.active;
  const nextRotation =
    direction === 'cw'
      ? getNextRotation(current.id, current.rotation)
      : (((current.rotation - 1 + 4) % 4) as RotationIndex);
  const nextShape = getTetrominoShape(current.id, nextRotation);

  const canRotate = nextShape.every(({ row, col }) => {
    const targetRow = current.position.row + row;
    const targetCol = current.position.col + col;
    if (targetCol < 0 || targetCol >= BOARD_WIDTH || targetRow >= BOARD_HEIGHT) {
      return false;
    }
    if (targetRow < 0) return true;
    return state.board[targetRow][targetCol] === null;
  });

  if (!canRotate) {
    return state;
  }

  return {
    ...state,
    active: {
      ...current,
      rotation: nextRotation,
      shape: nextShape,
    },
  };
};

const lockAndClear = (state: TetrisState): TetrisState => {
  if (!state.active) return state;

  const boardWithPiece = lockShapeIntoBoard(
    state.board,
    state.active.shape,
    state.active.position,
    state.active.id,
  );

  const { board: clearedBoard, cleared } = clearCompletedLines(boardWithPiece);
  const totalLines = state.stats.lines + cleared;
  const level = Math.max(Math.floor(totalLines / 10) + 1, state.stats.level);
  const score = state.stats.score + scoreForClearedLines(cleared, level);

  return {
    ...state,
    board: clearedBoard,
    active: null,
    stats: {
      score,
      lines: totalLines,
      level,
    },
    canHold: true,
  };
};

const executeHardDrop = (state: TetrisState): TetrisState => {
  if (!state.active) return state;
  let nextState = state;

  while (true) {
    const moved = applyMove(nextState, { row: 1, col: 0 });
    if (moved === nextState) {
      nextState = lockAndClear(nextState);
      break;
    }
    nextState = moved;
  }

  return nextState;
};

const DEFAULT_PREVIEW_COUNT = 3;

export type UseTetrisStateReturn = {
  state: TetrisState;
  queuePreview: TetrominoId[];
  spawnNext: () => void;
  reset: () => void;
  move: (delta: { row: number; col: number }) => void;
  rotate: (direction: 'cw' | 'ccw') => void;
  tick: () => void;
  hardDrop: () => void;
  hold: () => void;
};

export function useTetrisState(
  previewCount: number = DEFAULT_PREVIEW_COUNT,
): UseTetrisStateReturn {
  const bagRef = useRef(new SevenBagGenerator());
  const [state, setState] = useState<TetrisState>(() => createInitialState());

  const fillQueue = (queue: TetrominoId[], minCount: number): TetrominoId[] => {
    const nextQueue = [...queue];
    while (nextQueue.length < minCount) {
      nextQueue.push(bagRef.current.next());
    }
    return nextQueue;
  };

  const spawnNext = () => {
    setState((prev) => {
      if (prev.isGameOver) return prev;
      const queue = fillQueue(prev.queue, previewCount + 1);
      const [nextId, ...remainingQueue] = queue;
      if (!nextId) {
        return prev;
      }
      const nextActive = spawnTetromino(prev.board, nextId);
      if (!nextActive) {
        return {
          ...prev,
          queue: remainingQueue,
          active: null,
          isGameOver: true,
        };
      }

      return {
        ...prev,
        active: nextActive,
        queue: remainingQueue,
        canHold: true,
      };
    });
  };

  const reset = () => {
    bagRef.current.reset();
    setState(createInitialState);
  };

  const move = (delta: { row: number; col: number }) => {
    setState((prev) => {
      if (prev.isGameOver) return prev;
      const next = applyMove(prev, delta);
      return next === prev ? prev : next;
    });
  };

  const rotate = (direction: 'cw' | 'ccw') => {
    setState((prev) => {
      if (prev.isGameOver) return prev;
      const next = rotateActive(prev, direction);
      return next === prev ? prev : next;
    });
  };

  const tick = () => {
    setState((prev) => {
      if (prev.isGameOver || !prev.active) return prev;
      const stepped = applyMove(prev, { row: 1, col: 0 });
      if (stepped === prev) {
        return lockAndClear(prev);
      }
      return stepped;
    });
  };

  const hardDrop = () => {
    setState((prev) => {
      if (prev.isGameOver) return prev;
      return executeHardDrop(prev);
    });
  };

  const hold = () => {
    setState((prev) => {
      if (prev.isGameOver || !prev.active || !prev.canHold) {
        return prev;
      }

      const currentId = prev.active.id;

      if (prev.hold) {
        const nextActive = spawnTetromino(prev.board, prev.hold);
        if (!nextActive) {
          return {
            ...prev,
            active: null,
            hold: currentId,
            canHold: false,
            isGameOver: true,
          };
        }

        return {
          ...prev,
          active: nextActive,
          hold: currentId,
          canHold: false,
        };
      }

      const queue = fillQueue(prev.queue, previewCount + 1);
      const [nextId, ...remainingQueue] = queue;
      if (!nextId) {
        return {
          ...prev,
          hold: currentId,
          canHold: false,
        };
      }

      const nextActive = spawnTetromino(prev.board, nextId);
      if (!nextActive) {
        return {
          ...prev,
          queue: remainingQueue,
          active: null,
          hold: currentId,
          canHold: false,
          isGameOver: true,
        };
      }

      return {
        ...prev,
        active: nextActive,
        queue: remainingQueue,
        hold: currentId,
        canHold: false,
      };
    });
  };

  const queuePreview = useMemo(() => {
    if (previewCount <= 0) {
      return [];
    }

    if (state.queue.length >= previewCount) {
      return state.queue.slice(0, previewCount);
    }

    const missing = previewCount - state.queue.length;
    const additional = bagRef.current.preview(missing);

    return [...state.queue, ...additional].slice(0, previewCount);
  }, [state.queue, previewCount]);

  return {
    state,
    queuePreview,
    spawnNext,
    reset,
    move,
    rotate,
    tick,
    hardDrop,
    hold,
  };
}
