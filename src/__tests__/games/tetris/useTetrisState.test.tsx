import { act, renderHook } from '@testing-library/react';
import { useTetrisState } from '@/app/games/tetris/useTetrisState';
import type { Board } from '@/lib/tetris';

const isBoardEmpty = (board: Board) =>
  board.every((row) => row.every((cell) => cell === null));

describe('useTetrisState movement controls', () => {
  it('moves the active tetromino left by one column without collisions', () => {
    const { result } = renderHook(() => useTetrisState());

    act(() => {
      result.current.spawnNext();
    });

    const initialActive = result.current.state.active;
    expect(initialActive).not.toBeNull();
    if (!initialActive) {
      return;
    }

    const initialColumn = initialActive.position.col;

    act(() => {
      result.current.move({ row: 0, col: -1 });
    });

    const updatedActive = result.current.state.active;
    expect(updatedActive).not.toBeNull();
    expect(updatedActive?.position.col).toBe(initialColumn - 1);
    expect(isBoardEmpty(result.current.state.board)).toBe(true);
  });

  it('moves the active tetromino right by two columns without collisions', () => {
    const { result } = renderHook(() => useTetrisState());

    act(() => {
      result.current.spawnNext();
    });

    const initialActive = result.current.state.active;
    expect(initialActive).not.toBeNull();
    if (!initialActive) {
      return;
    }

    const initialColumn = initialActive.position.col;

    act(() => {
      result.current.move({ row: 0, col: 1 });
      result.current.move({ row: 0, col: 1 });
    });

    const updatedActive = result.current.state.active;
    expect(updatedActive).not.toBeNull();
    expect(updatedActive?.position.col).toBe(initialColumn + 2);
    expect(isBoardEmpty(result.current.state.board)).toBe(true);
  });
});
