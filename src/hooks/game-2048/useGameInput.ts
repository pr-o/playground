import { useEffect, useRef, type RefObject } from 'react';
import type { MoveDirection } from '@/lib/game-2048';
import { useGame2048Store } from '@/store/game-2048';

const KEY_DIRECTION_MAP: Record<string, MoveDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

const SWIPE_THRESHOLD = 30;
const MOVE_THROTTLE_MS = 120;

export function useGameInput(boardRef: RefObject<HTMLElement | null>) {
  const lastMoveAtRef = useRef(0);

  useEffect(() => {
    const queueMove = (direction: MoveDirection) => {
      const state = useGame2048Store.getState();
      if (!state.isHydrated || state.isOver) {
        return;
      }
      const now = Date.now();
      if (now - lastMoveAtRef.current < MOVE_THROTTLE_MS) {
        return;
      }
      lastMoveAtRef.current = now;
      state.move(direction);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTION_MAP[event.key];
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      queueMove(direction);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });

    const element = boardRef.current;
    let cleanupTouch: (() => void) | undefined;

    if (element) {
      const touchStart = { x: 0, y: 0, active: false };

      const onTouchStart = (event: TouchEvent) => {
        if (!isHydratedRef.current || isOverRef.current) return;
        const touch = event.touches[0];
        if (!touch) return;
        touchStart.x = touch.clientX;
        touchStart.y = touch.clientY;
        touchStart.active = true;
      };

      const onTouchMove = (event: TouchEvent) => {
        if (!touchStart.active) return;
        event.preventDefault();
      };

      const onTouchEnd = (event: TouchEvent) => {
        if (!touchStart.active) return;
        const touch = event.changedTouches[0];
        touchStart.active = false;
        if (!touch) {
          return;
        }
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = touch.clientY - touchStart.y;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
          return;
        }
        const direction: MoveDirection =
          absX > absY ? (deltaX > 0 ? 'right' : 'left') : deltaY > 0 ? 'down' : 'up';
        queueMove(direction);
      };

      const onTouchCancel = () => {
        touchStart.active = false;
      };

      element.addEventListener('touchstart', onTouchStart, { passive: true });
      element.addEventListener('touchmove', onTouchMove, { passive: false });
      element.addEventListener('touchend', onTouchEnd, { passive: false });
      element.addEventListener('touchcancel', onTouchCancel, { passive: true });

      cleanupTouch = () => {
        element.removeEventListener('touchstart', onTouchStart);
        element.removeEventListener('touchmove', onTouchMove);
        element.removeEventListener('touchend', onTouchEnd);
        element.removeEventListener('touchcancel', onTouchCancel);
      };
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cleanupTouch) {
        cleanupTouch();
      }
    };
  }, [boardRef]);
}
