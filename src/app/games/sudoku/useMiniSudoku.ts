import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_CONFIGS,
  Difficulty,
  createEmptyBoard,
  deserializePuzzleState,
  generateMiniSudokuPuzzle,
  gridToBoard,
  serializePuzzleState,
  type Digit,
  type MiniSudokuBoard,
  type MiniSudokuCell,
  type MiniSudokuGrid,
  type PuzzleStatePayload,
  type PuzzleStatus,
  type SerializedPuzzle,
} from '@/lib/sudoku-mini';
import { usePersistentPuzzle } from './hooks/usePersistentPuzzle';

export type ConflictFlags = {
  row?: boolean;
  col?: boolean;
  region?: boolean;
};

type Selection = { row: number; col: number };
type GameStatus = 'idle' | 'loading' | 'playing' | 'completed' | 'error';

type MiniSudokuState = {
  board: MiniSudokuBoard;
  puzzle: MiniSudokuGrid;
  solution: MiniSudokuGrid;
  difficulty: Difficulty;
  selected: Selection | null;
  notesMode: boolean;
  history: MiniSudokuBoard[];
  future: MiniSudokuBoard[];
  hintsUsed: number;
  lastHint: Selection | null;
  conflicts: Record<string, ConflictFlags>;
  mistakeTokens: Record<string, number>;
  mistakeCount: number;
  status: GameStatus;
  puzzleId: number;
  error?: string;
};

type Action =
  | { type: 'SELECT_CELL'; payload: Selection }
  | { type: 'MOVE_SELECTION'; payload: { rowDelta: number; colDelta: number } }
  | { type: 'TOGGLE_NOTES' }
  | { type: 'INPUT_VALUE'; payload: { value: number } }
  | { type: 'ERASE' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'REQUEST_HINT' }
  | { type: 'RESTORE_PUZZLE' }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty }
  | {
      type: 'LOAD_PUZZLE_REQUEST';
      payload: { difficulty: Difficulty };
    }
  | {
      type: 'LOAD_PUZZLE_SUCCESS';
      payload: {
        board: MiniSudokuBoard;
        puzzle: MiniSudokuGrid;
        solution: MiniSudokuGrid;
        difficulty: Difficulty;
        puzzleId: number;
      };
    }
  | { type: 'LOAD_PUZZLE_FAILURE'; payload: { message: string } }
  | { type: 'HYDRATE_STATE'; payload: MiniSudokuState };

const GRID_SIZE = 6;
const REGION_HEIGHT = 2;
const REGION_WIDTH = 3;
const HISTORY_LIMIT = 50;
const STORAGE_KEY = 'mini-sudoku-state-v2';

const createInitialState = (): MiniSudokuState => {
  const puzzle = createEmptyBoard();
  const solution = createEmptyBoard();
  const board = gridToBoard(puzzle);
  return {
    board,
    puzzle,
    solution,
    difficulty: DEFAULT_DIFFICULTY,
    selected: null,
    notesMode: false,
    history: [],
    future: [],
    hintsUsed: 0,
    lastHint: null,
    conflicts: {},
    mistakeTokens: {},
    mistakeCount: 0,
    status: 'idle',
    puzzleId: 0,
    error: undefined,
  };
};

const initialState: MiniSudokuState = createInitialState();

const buildStateFromPayload = (payload: PuzzleStatePayload): MiniSudokuState => {
  const board = payload.board;
  return {
    ...createInitialState(),
    board,
    puzzle: payload.puzzle,
    solution: payload.solution,
    difficulty: payload.difficulty,
    notesMode: payload.notesMode,
    hintsUsed: payload.hintsUsed,
    lastHint: payload.lastHint,
    conflicts: calculateConflicts(board),
    mistakeTokens: {},
    mistakeCount: payload.mistakeCount,
    status: payload.status === 'completed' ? 'completed' : 'playing',
    puzzleId: payload.puzzleId,
    selected: null,
    history: [],
    future: [],
  };
};

const getCellKey = (row: number, col: number) => `${row}-${col}`;

const hasActiveConflict = (flags?: ConflictFlags) =>
  Boolean(flags?.row || flags?.col || flags?.region);

function calculateConflicts(board: MiniSudokuBoard): Record<string, ConflictFlags> {
  const conflicts: Record<string, ConflictFlags> = {};

  const markConflicts = (
    positions: Array<{ row: number; col: number }>,
    key: keyof ConflictFlags,
  ) => {
    if (positions.length <= 1) return;
    positions.forEach(({ row, col }) => {
      const cellKey = getCellKey(row, col);
      const entry = conflicts[cellKey] ?? {};
      entry[key] = true;
      conflicts[cellKey] = entry;
    });
  };

  for (let row = 0; row < GRID_SIZE; row += 1) {
    const buckets: Record<number, Array<{ row: number; col: number }>> = {};
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = board[row][col]?.value;
      if (value == null) continue;
      buckets[value] = buckets[value] ?? [];
      buckets[value].push({ row, col });
    }
    Object.values(buckets).forEach((positions) => markConflicts(positions, 'row'));
  }

  for (let col = 0; col < GRID_SIZE; col += 1) {
    const buckets: Record<number, Array<{ row: number; col: number }>> = {};
    for (let row = 0; row < GRID_SIZE; row += 1) {
      const value = board[row][col]?.value;
      if (value == null) continue;
      buckets[value] = buckets[value] ?? [];
      buckets[value].push({ row, col });
    }
    Object.values(buckets).forEach((positions) => markConflicts(positions, 'col'));
  }

  for (let startRow = 0; startRow < GRID_SIZE; startRow += REGION_HEIGHT) {
    for (let startCol = 0; startCol < GRID_SIZE; startCol += REGION_WIDTH) {
      const buckets: Record<number, Array<{ row: number; col: number }>> = {};
      for (let r = 0; r < REGION_HEIGHT; r += 1) {
        for (let c = 0; c < REGION_WIDTH; c += 1) {
          const row = startRow + r;
          const col = startCol + c;
          const value = board[row][col]?.value;
          if (value == null) continue;
          buckets[value] = buckets[value] ?? [];
          buckets[value].push({ row, col });
        }
      }
      Object.values(buckets).forEach((positions) => markConflicts(positions, 'region'));
    }
  }

  return conflicts;
}

const isBoardSolved = (board: MiniSudokuBoard, solution: MiniSudokuGrid): boolean =>
  board.every((row, rowIndex) =>
    row.every((cell, colIndex) => cell.value === solution[rowIndex]?.[colIndex]),
  );

const selectCell = (state: MiniSudokuState, next: Selection): MiniSudokuState => {
  const isSameCell = state.selected?.row === next.row && state.selected?.col === next.col;
  return { ...state, selected: isSameCell ? null : next };
};

const moveSelection = (state: MiniSudokuState, deltaRow: number, deltaCol: number) => {
  const current = state.selected ?? { row: 0, col: 0 };
  const nextRow = Math.max(0, Math.min(GRID_SIZE - 1, current.row + deltaRow));
  const nextCol = Math.max(0, Math.min(GRID_SIZE - 1, current.col + deltaCol));
  return { ...state, selected: { row: nextRow, col: nextCol } };
};

type CommitOptions = {
  conflicts?: Record<string, ConflictFlags>;
  mistakeKey?: string | null;
  incrementMistakes?: boolean;
};

const commitBoardChange = (
  state: MiniSudokuState,
  nextBoard: MiniSudokuBoard,
  options?: CommitOptions,
): MiniSudokuState => {
  if (nextBoard === state.board) {
    return state;
  }

  const nextHistory = [...state.history, state.board];
  if (nextHistory.length > HISTORY_LIMIT) {
    nextHistory.shift();
  }

  const nextConflicts = options?.conflicts ?? calculateConflicts(nextBoard);
  const nextMistakeTokens =
    options?.mistakeKey != null
      ? {
          ...state.mistakeTokens,
          [options.mistakeKey]: Date.now(),
        }
      : state.mistakeTokens;

  let nextStatus: GameStatus = state.status;
  if (state.status !== 'loading' && state.status !== 'error') {
    nextStatus = isBoardSolved(nextBoard, state.solution) ? 'completed' : 'playing';
  }

  return {
    ...state,
    board: nextBoard,
    history: nextHistory,
    future: [],
    conflicts: nextConflicts,
    mistakeTokens: nextMistakeTokens,
    mistakeCount: options?.incrementMistakes
      ? state.mistakeCount + 1
      : state.mistakeCount,
    status: nextStatus,
  };
};

const areArraysEqual = (a: Digit[], b: Digit[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const sortNotes = (notes: Digit[]) => [...notes].sort((a, b) => a - b);

const updateCell = (
  board: MiniSudokuBoard,
  row: number,
  col: number,
  updater: (cell: MiniSudokuCell) => MiniSudokuCell,
) => {
  const currentCell = board[row]?.[col];
  if (!currentCell) {
    return board;
  }

  const updatedCell = updater(currentCell);
  if (updatedCell === currentCell) {
    return board;
  }

  const nextRow = board[row].slice();
  nextRow[col] = updatedCell;
  const nextBoard = board.slice();
  nextBoard[row] = nextRow;
  return nextBoard;
};

const reducer = (state: MiniSudokuState, action: Action): MiniSudokuState => {
  switch (action.type) {
    case 'SELECT_CELL':
      return selectCell(state, action.payload);
    case 'MOVE_SELECTION':
      return moveSelection(state, action.payload.rowDelta, action.payload.colDelta);
    case 'TOGGLE_NOTES':
      return { ...state, notesMode: !state.notesMode };
    case 'INPUT_VALUE': {
      if (state.status === 'loading' || state.status === 'error') {
        return state;
      }
      const { selected } = state;
      if (!selected) return state;

      const cell = state.board[selected.row][selected.col];
      if (cell.given) return state;

      const value = action.payload.value as Digit;
      const nextBoard = updateCell(state.board, selected.row, selected.col, (current) => {
        if (state.notesMode) {
          const hasNote = current.notes.includes(value);
          const nextNotes = hasNote
            ? current.notes.filter((note) => note !== value)
            : sortNotes([...current.notes, value]);
          if (areArraysEqual(nextNotes, current.notes)) {
            return current;
          }
          return { ...current, notes: nextNotes };
        }

        if (current.value === value) {
          return current;
        }

        return { ...current, value, notes: [] as Digit[] };
      });

      const conflicts = calculateConflicts(nextBoard);
      const cellKey = getCellKey(selected.row, selected.col);
      const hasMistake = !state.notesMode && hasActiveConflict(conflicts[cellKey]);

      return commitBoardChange(state, nextBoard, {
        conflicts,
        mistakeKey: hasMistake ? cellKey : null,
        incrementMistakes: hasMistake,
      });
    }
    case 'ERASE': {
      if (state.status === 'loading' || state.status === 'error') {
        return state;
      }
      const { selected } = state;
      if (!selected) return state;
      const cell = state.board[selected.row][selected.col];
      if (cell.given) return state;

      const nextBoard = updateCell(state.board, selected.row, selected.col, (current) => {
        if (current.value === null && current.notes.length === 0) {
          return current;
        }
        return { ...current, value: null, notes: [] as Digit[] };
      });

      return commitBoardChange(state, nextBoard);
    }
    case 'UNDO': {
      if (!state.history.length) return state;
      const previous = state.history[state.history.length - 1];
      const history = state.history.slice(0, -1);
      const future = [state.board, ...state.future];
      return {
        ...state,
        board: previous,
        history,
        future,
        conflicts: calculateConflicts(previous),
        status:
          state.status === 'error'
            ? 'error'
            : isBoardSolved(previous, state.solution)
              ? 'completed'
              : 'playing',
      };
    }
    case 'REDO': {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      const history = [...state.history, state.board];
      return {
        ...state,
        board: next,
        history,
        future: rest,
        conflicts: calculateConflicts(next),
        status:
          state.status === 'error'
            ? 'error'
            : isBoardSolved(next, state.solution)
              ? 'completed'
              : 'playing',
      };
    }
    case 'REQUEST_HINT': {
      if (state.status !== 'playing') {
        return state;
      }
      const config = DIFFICULTY_CONFIGS[state.difficulty];
      if (config && state.hintsUsed >= config.maxHints) {
        return state;
      }
      const target = findHintTarget(state);
      if (!target) {
        return state;
      }

      const correctValue = state.solution[target.row]?.[target.col];
      if (!correctValue) {
        return state;
      }

      const nextBoard = updateCell(state.board, target.row, target.col, (current) => {
        if (current.value === correctValue) {
          return current;
        }

        return {
          ...current,
          value: correctValue,
          notes: [] as Digit[],
          wasHint: true,
        };
      });

      const committed = commitBoardChange(state, nextBoard);
      if (committed === state) {
        return state;
      }

      return {
        ...committed,
        hintsUsed: committed.hintsUsed + 1,
        lastHint: target,
        selected: target,
      };
    }
    case 'RESTORE_PUZZLE': {
      const board = gridToBoard(state.puzzle);
      return {
        ...state,
        board,
        history: [],
        future: [],
        notesMode: false,
        hintsUsed: 0,
        mistakeCount: 0,
        mistakeTokens: {},
        conflicts: calculateConflicts(board),
        status: 'playing',
        selected: null,
        lastHint: null,
      };
    }
    case 'SET_DIFFICULTY': {
      if (action.payload === state.difficulty && state.status !== 'error') {
        return state;
      }
      return {
        ...state,
        difficulty: action.payload,
        status: 'idle',
        error: undefined,
      };
    }
    case 'LOAD_PUZZLE_REQUEST':
      return {
        ...state,
        status: 'loading',
        difficulty: action.payload.difficulty,
        error: undefined,
        selected: null,
      };
    case 'LOAD_PUZZLE_SUCCESS': {
      const { board, puzzle, solution, difficulty, puzzleId } = action.payload;
      return {
        ...state,
        board,
        puzzle,
        solution,
        difficulty,
        puzzleId,
        status: 'playing',
        history: [],
        future: [],
        notesMode: false,
        hintsUsed: 0,
        lastHint: null,
        conflicts: calculateConflicts(board),
        mistakeTokens: {},
        mistakeCount: 0,
        selected: null,
      };
    }
    case 'LOAD_PUZZLE_FAILURE':
      return {
        ...state,
        status: 'error',
        error: action.payload.message,
      };
    case 'HYDRATE_STATE': {
      return {
        ...state,
        ...action.payload,
        history: [],
        future: [],
        conflicts: calculateConflicts(action.payload.board),
        mistakeTokens: {},
        status: action.payload.status,
        error: undefined,
      };
    }
    default:
      return state;
  }
};

const findHintTarget = (state: MiniSudokuState): Selection | null => {
  const { selected } = state;
  if (selected) {
    const cell = state.board[selected.row][selected.col];
    if (!cell.given && cell.value === null) {
      return selected;
    }
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const cell = state.board[row][col];
      if (!cell.given && cell.value === null) {
        return { row, col };
      }
    }
  }

  return null;
};

export function useMiniSudoku() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);
  const { loadState, saveState } = usePersistentPuzzle<SerializedPuzzle>(STORAGE_KEY);

  const loadPuzzle = useCallback(
    (difficulty: Difficulty, options: { forceNew?: boolean } = {}) => {
      dispatch({ type: 'LOAD_PUZZLE_REQUEST', payload: { difficulty } });
      try {
        const generated = generateMiniSudokuPuzzle(difficulty, {
          forceNew: options.forceNew,
        });
        const board = gridToBoard(generated.puzzle);
        dispatch({
          type: 'LOAD_PUZZLE_SUCCESS',
          payload: {
            board,
            puzzle: generated.puzzle,
            solution: generated.solution,
            difficulty,
            puzzleId: generated.seed,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to load Mini Sudoku puzzle.';
        dispatch({ type: 'LOAD_PUZZLE_FAILURE', payload: { message } });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const stored = loadState();
    if (stored) {
      const blankState = createInitialState();
      const defaults: PuzzleStatePayload = {
        puzzleId: blankState.puzzleId,
        difficulty: blankState.difficulty,
        board: blankState.board,
        puzzle: blankState.puzzle,
        solution: blankState.solution,
        notesMode: blankState.notesMode,
        hintsUsed: blankState.hintsUsed,
        mistakeCount: blankState.mistakeCount,
        status: 'playing',
        lastHint: null,
      };
      const payload = deserializePuzzleState(stored, defaults);
      dispatch({ type: 'HYDRATE_STATE', payload: buildStateFromPayload(payload) });
    }
    hydratedRef.current = true;
  }, [dispatch, loadState]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    if (state.status !== 'idle') return;
    loadPuzzle(state.difficulty, { forceNew: true });
  }, [loadPuzzle, state.difficulty, state.status]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !hydratedRef.current ||
      state.puzzleId === 0 ||
      state.status === 'idle' ||
      state.status === 'loading'
    ) {
      return;
    }

    const persistedStatus: PuzzleStatus =
      state.status === 'completed' ? 'completed' : 'playing';

    const payload = serializePuzzleState({
      puzzleId: state.puzzleId,
      difficulty: state.difficulty,
      board: state.board,
      puzzle: state.puzzle,
      solution: state.solution,
      notesMode: state.notesMode,
      hintsUsed: state.hintsUsed,
      mistakeCount: state.mistakeCount,
      status: persistedStatus,
      lastHint: state.lastHint,
    });

    saveState(payload);
  }, [
    state.board,
    state.notesMode,
    state.hintsUsed,
    state.lastHint,
    state.mistakeCount,
    state.status,
    state.puzzleId,
    state.difficulty,
    state.puzzle,
    state.solution,
    saveState,
  ]);

  const selectCellHandler = useCallback(
    (row: number, col: number) =>
      dispatch({ type: 'SELECT_CELL', payload: { row, col } }),
    [],
  );

  const moveSelectionHandler = useCallback(
    (rowDelta: number, colDelta: number) =>
      dispatch({ type: 'MOVE_SELECTION', payload: { rowDelta, colDelta } }),
    [],
  );

  const toggleNotes = useCallback(() => dispatch({ type: 'TOGGLE_NOTES' }), []);
  const inputDigit = useCallback(
    (value: number) => dispatch({ type: 'INPUT_VALUE', payload: { value } }),
    [],
  );
  const erase = useCallback(() => dispatch({ type: 'ERASE' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const hint = useCallback(() => dispatch({ type: 'REQUEST_HINT' }), []);
  const restartPuzzle = useCallback(() => dispatch({ type: 'RESTORE_PUZZLE' }), []);
  const nextPuzzle = useCallback(
    () => loadPuzzle(state.difficulty, { forceNew: true }),
    [loadPuzzle, state.difficulty],
  );
  const setDifficulty = useCallback(
    (difficulty: Difficulty) => dispatch({ type: 'SET_DIFFICULTY', payload: difficulty }),
    [],
  );

  return {
    board: state.board,
    selected: state.selected,
    notesMode: state.notesMode,
    hintsUsed: state.hintsUsed,
    lastHint: state.lastHint,
    conflicts: state.conflicts,
    mistakeTokens: state.mistakeTokens,
    mistakeCount: state.mistakeCount,
    status: state.status,
    puzzleId: state.puzzleId,
    difficulty: state.difficulty,
    canUndo: state.history.length > 0,
    canRedo: state.future.length > 0,
    selectCell: selectCellHandler,
    moveSelection: moveSelectionHandler,
    toggleNotes,
    inputDigit,
    erase,
    undo,
    redo,
    requestHint: hint,
    restartPuzzle,
    nextPuzzle,
    setDifficulty,
  };
}
