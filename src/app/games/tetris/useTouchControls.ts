'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { TetrisInputActions } from './useInput';

type UseTouchControlsOptions = {
  ref: RefObject<HTMLElement | null>;
  actions: TetrisInputActions;
  disabled?: boolean;
};

const SWIPE_THRESHOLD = 40;
const TAP_THRESHOLD = 14;
const LONG_PRESS_MS = 450;

export const useTouchControls = ({
  ref,
  actions,
  disabled = false,
}: UseTouchControlsOptions) => {
  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    if (!ref.current) {
      return;
    }

    const target = ref.current;

    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let initialX = 0;
    let initialY = 0;
    let startTime = 0;
    let softDropActive = false;
    let longPressTimeout: number | null = null;
    let longPressTriggered = false;

    const clearLongPress = () => {
      if (longPressTimeout !== null) {
        window.clearTimeout(longPressTimeout);
        longPressTimeout = null;
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      initialX = startX;
      initialY = startY;
      lastX = startX;
      lastY = startY;
      startTime = event.timeStamp;
      softDropActive = false;
      longPressTriggered = false;

      clearLongPress();
      longPressTimeout = window.setTimeout(() => {
        actionsRef.current.onHold();
        longPressTriggered = true;
      }, LONG_PRESS_MS);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      const deltaX = currentX - lastX;
      const totalDeltaX = currentX - initialX;
      const totalDeltaY = currentY - initialY;

      if (
        Math.abs(totalDeltaX) > TAP_THRESHOLD ||
        Math.abs(totalDeltaY) > TAP_THRESHOLD
      ) {
        longPressTriggered = true;
        clearLongPress();
      }

      if (deltaX >= SWIPE_THRESHOLD) {
        actionsRef.current.onRight();
        lastX = currentX;
      } else if (deltaX <= -SWIPE_THRESHOLD) {
        actionsRef.current.onLeft();
        lastX = currentX;
      }

      if (totalDeltaY > SWIPE_THRESHOLD) {
        if (!softDropActive) {
          actionsRef.current.onSoftDrop(true);
          softDropActive = true;
        }
      } else if (softDropActive && totalDeltaY < SWIPE_THRESHOLD / 2) {
        actionsRef.current.onSoftDrop(false);
        softDropActive = false;
      }

      lastY = currentY;
      event.preventDefault();
    };

    const finishTouch = (event: TouchEvent) => {
      if (softDropActive) {
        actionsRef.current.onSoftDrop(false);
        softDropActive = false;
      }

      clearLongPress();

      const totalDeltaX = lastX - initialX;
      const totalDeltaY = lastY - initialY;
      const duration = event.timeStamp - startTime;

      if (!longPressTriggered) {
        const isTap =
          Math.abs(totalDeltaX) < TAP_THRESHOLD && Math.abs(totalDeltaY) < TAP_THRESHOLD;
        if (isTap) {
          actionsRef.current.onRotateCW();
        } else if (totalDeltaY > SWIPE_THRESHOLD * 1.5 && duration < 250) {
          actionsRef.current.onHardDrop();
        }
      }

      startTime = 0;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      finishTouch(event);
    };

    const handleTouchCancel = (event: TouchEvent) => {
      finishTouch(event);
    };

    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });
    target.addEventListener('touchend', handleTouchEnd);
    target.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      if (softDropActive) {
        actionsRef.current.onSoftDrop(false);
      }
      clearLongPress();
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
      target.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [ref, disabled]);
};
