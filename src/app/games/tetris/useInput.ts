'use client';

import { useEffect, useRef } from 'react';

export type TetrisInputActions = {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: (active: boolean) => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  onPauseToggle: () => void;
  onRestart: () => void;
};

const KEY_REPEAT_MS = 60;

const LEFT_KEYS = new Set(['ArrowLeft', 'KeyA']);
const RIGHT_KEYS = new Set(['ArrowRight', 'KeyD']);
const SOFT_DROP_KEYS = new Set(['ArrowDown', 'KeyS']);
const HARD_DROP_KEYS = new Set(['Space']);
const ROTATE_CW_KEYS = new Set(['ArrowUp', 'KeyW', 'KeyX']);
const ROTATE_CCW_KEYS = new Set(['KeyZ', 'ControlLeft', 'ControlRight']);
const HOLD_KEYS = new Set(['ShiftLeft', 'ShiftRight', 'KeyC']);
const PAUSE_KEYS = new Set(['KeyP', 'Escape']);
const RESTART_KEYS = new Set(['KeyR']);

type Timer = ReturnType<typeof setInterval> | null;

type RepeatState = {
  left: Timer;
  right: Timer;
};

const clearRepeat = (state: RepeatState) => {
  if (state.left) {
    clearInterval(state.left);
    state.left = null;
  }
  if (state.right) {
    clearInterval(state.right);
    state.right = null;
  }
};

export const useInput = (actions: TetrisInputActions) => {
  const repeatRef = useRef<RepeatState>({ left: null, right: null });
  const softDropActiveRef = useRef(false);

  useEffect(() => {
    const repeatState = repeatRef.current;
    const clearRepeatTimers = () => {
      clearRepeat(repeatState);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (LEFT_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onLeft();
        clearRepeatTimers();
        repeatState.left = setInterval(() => {
          actions.onLeft();
        }, KEY_REPEAT_MS);
        return;
      }

      if (RIGHT_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onRight();
        clearRepeatTimers();
        repeatState.right = setInterval(() => {
          actions.onRight();
        }, KEY_REPEAT_MS);
        return;
      }

      if (SOFT_DROP_KEYS.has(event.code)) {
        event.preventDefault();
        if (!softDropActiveRef.current) {
          softDropActiveRef.current = true;
          actions.onSoftDrop(true);
        }
        return;
      }

      if (HARD_DROP_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onHardDrop();
        return;
      }

      if (ROTATE_CW_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onRotateCW();
        return;
      }

      if (ROTATE_CCW_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onRotateCCW();
        return;
      }

      if (HOLD_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onHold();
        return;
      }

      if (PAUSE_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onPauseToggle();
        return;
      }

      if (RESTART_KEYS.has(event.code)) {
        event.preventDefault();
        actions.onRestart();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (LEFT_KEYS.has(event.code)) {
        if (repeatState.left) {
          clearInterval(repeatState.left);
          repeatState.left = null;
        }
        return;
      }

      if (RIGHT_KEYS.has(event.code)) {
        if (repeatState.right) {
          clearInterval(repeatState.right);
          repeatState.right = null;
        }
        return;
      }

      if (SOFT_DROP_KEYS.has(event.code)) {
        if (softDropActiveRef.current) {
          softDropActiveRef.current = false;
          actions.onSoftDrop(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearRepeatTimers();
      if (softDropActiveRef.current) {
        actions.onSoftDrop(false);
        softDropActiveRef.current = false;
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [actions]);
};
