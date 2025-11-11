import { useCallback, useReducer } from 'react';

export type MiniSudokuCell = {
  value: number | null;
  notes: number[];
  given: boolean;
  wasHint?: boolean;
};

export type ConflictFlags = {
  row?: boolean;
  col?: boolean;
  region?: boolean;
};

type Selection = { row: number; col: number };

type MiniSudokuState = {
  board: MiniSudokuCell[][];
  selected: Selection | null;
  notesMode: boolean;
  history: MiniSudokuCell[][][];
  future: MiniSudokuCell[][][];
  hintsUsed: number;
  lastHint: Selection | null;
  conflicts: Record<string, ConflictFlags>;
  mistakeTokens: Record<string, number>;
  mistakeCount: number;
};

type Action =
  | { type: 'SELECT_CELL'; payload: Selection }
  | { type: 'MOVE_SELECTION'; payload: { rowDelta: number; colDelta: number } }
  | { type: 'TOGGLE_NOTES' }
  | { type: 'INPUT_VALUE'; payload: { value: number } }
  | { type: 'ERASE' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'REQUEST_HINT' };

const GRID_SIZE = 6;
const REGION_HEIGHT = 2;
const REGION_WIDTH = 3;
const HISTORY_LIMIT = 50;

const SOLUTION_BOARD: number[][] = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 4, 5, 6, 1],
  [5, 6, 1, 2, 3, 4],
  [3, 4, 5, 6, 1, 2],
  [6, 1, 2, 3, 4, 5],
];

const PUZZLE_BOARD: (number | null)[][] = [
  [1, null, null, 4, null, 6],
  [4, null, 6, null, 2, null],
  [null, 3, null, 5, null, 1],
  [5, null, 1, null, 3, null],
  [null, 4, null, 6, null, 2],
  [6, null, 2, null, 4, null],
];

const initialBoard: MiniSudokuCell[][] = PUZZLE_BOARD.map((row) =>
  row.map((value) => ({
    value,
    notes: [],
    given: value !== null,
  })),
);

const initialState: MiniSudokuState = {
  board: initialBoard,
  selected: null,
  notesMode: false,
  history: [],
  future: [],
  hintsUsed: 0,
  lastHint: null,
  conflicts: calculateConflicts(initialBoard),
  mistakeTokens: {},
  mistakeCount: 0,
};

const getCellKey = (row: number, col: number) => `${row}-${col}`;

const hasActiveConflict = (flags?: ConflictFlags) =>
  Boolean(flags?.row || flags?.col || flags?.region);

function calculateConflicts(board: MiniSudokuCell[][]): Record<string, ConflictFlags> {
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
  nextBoard: MiniSudokuCell[][],
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
  };
};

const areArraysEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const updateCell = (
  board: MiniSudokuCell[][],
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
      const { selected } = state;
      if (!selected) return state;

      const cell = state.board[selected.row][selected.col];
      if (cell.given) return state;

      const value = action.payload.value;
      const nextBoard = updateCell(state.board, selected.row, selected.col, (current) => {
        if (state.notesMode) {
          const hasNote = current.notes.includes(value);
          const nextNotes = hasNote
            ? current.notes.filter((note) => note !== value)
            : [...current.notes, value].sort();
          if (areArraysEqual(nextNotes, current.notes)) {
            return current;
          }
          return { ...current, notes: nextNotes };
        }

        if (current.value === value) {
          return current;
        }

        return { ...current, value, notes: [] };
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
      const { selected } = state;
      if (!selected) return state;
      const cell = state.board[selected.row][selected.col];
      if (cell.given) return state;

      const nextBoard = updateCell(state.board, selected.row, selected.col, (current) => {
        if (current.value === null && current.notes.length === 0) {
          return current;
        }
        return { ...current, value: null, notes: [] };
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
      };
    }
    case 'REQUEST_HINT': {
      const target = findHintTarget(state);
      if (!target) {
        return state;
      }

      const correctValue = SOLUTION_BOARD[target.row][target.col];
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
          notes: [],
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

  return {
    board: state.board,
    selected: state.selected,
    notesMode: state.notesMode,
    hintsUsed: state.hintsUsed,
    lastHint: state.lastHint,
    conflicts: state.conflicts,
    mistakeTokens: state.mistakeTokens,
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
  };
}
