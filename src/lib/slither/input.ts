'use client';

import { useEffect, useState } from 'react';
import type { MutableRefObject } from 'react';
import { normalize, vec } from './math';
import type { InputSource, SlitherInputState, Vector2 } from './types';

const ZERO_VECTOR = Object.freeze({ x: 0, y: 0 });
const POINTER_BUTTON_BOOST = 2;
const KEY_FORWARD = new Set(['ArrowUp', 'KeyW']);
const KEY_BACK = new Set(['ArrowDown', 'KeyS']);
const KEY_LEFT = new Set(['ArrowLeft', 'KeyA']);
const KEY_RIGHT = new Set(['ArrowRight', 'KeyD']);
const BOOST_KEYS = new Set(['Space', 'ShiftLeft', 'ShiftRight', 'KeyE']);

const createInitialState = (): SlitherInputState => ({
  steering: { x: 0, y: 0 },
  isBoosting: false,
  source: 'none',
  pointerActive: false,
  pointerPosition: null,
  keyboardVector: { x: 0, y: 0 },
  updatedAt: now(),
});

export const useSlitherInput = (
  elementRef: MutableRefObject<HTMLElement | null>,
): SlitherInputState => {
  const [state, setState] = useState<SlitherInputState>(() => createInitialState());

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let pointerActive = false;
    let pointerPosition: Vector2 | null = null;
    const boostKeys = new Set<string>();
    const pointerBoostButtons = new Set<number>();
    const activeKeys = new Set<string>();

    const computeKeyboardVector = (): Vector2 => {
      let x = 0;
      let y = 0;

      if (hasAny(activeKeys, KEY_LEFT)) x -= 1;
      if (hasAny(activeKeys, KEY_RIGHT)) x += 1;
      if (hasAny(activeKeys, KEY_FORWARD)) y -= 1;
      if (hasAny(activeKeys, KEY_BACK)) y += 1;

      return vec(x, y);
    };

    const computePointerSteering = (): Vector2 | null => {
      if (!pointerActive || !pointerPosition) return null;

      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width === 0 || height === 0) return null;

      const centerX = width / 2;
      const centerY = height / 2;
      const relative = vec(pointerPosition.x - centerX, pointerPosition.y - centerY);
      const normalized = normalize(relative);

      if (normalized.x === 0 && normalized.y === 0) return null;

      return normalized;
    };

    const updateState = () => {
      const pointerVector = computePointerSteering();
      const keyboardVector = computeKeyboardVector();
      const keyboardSteering = normalize(keyboardVector);

      const hasPointer = pointerVector !== null;
      const hasKeyboard = keyboardSteering.x !== 0 || keyboardSteering.y !== 0;

      const steering = hasPointer
        ? pointerVector!
        : hasKeyboard
          ? keyboardSteering
          : ZERO_VECTOR;

      const resolvedSource: InputSource = hasPointer
        ? 'pointer'
        : hasKeyboard
          ? 'keyboard'
          : 'none';

      const boosting =
        boostKeys.size > 0 || pointerBoostButtons.has(POINTER_BUTTON_BOOST);

      setState({
        steering,
        isBoosting: boosting,
        source: resolvedSource,
        pointerActive,
        pointerPosition,
        keyboardVector,
        updatedAt: now(),
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerActive = true;
      pointerPosition = toLocalPosition(event, element);
      updateState();
    };

    const handlePointerEnter = (event: PointerEvent) => {
      pointerActive = true;
      pointerPosition = toLocalPosition(event, element);
      updateState();
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointerActive = true;
      if (event.button === POINTER_BUTTON_BOOST) {
        pointerBoostButtons.add(event.button);
        event.preventDefault();
      }
      pointerPosition = toLocalPosition(event, element);
      element.setPointerCapture?.(event.pointerId);
      updateState();
    };

    const handlePointerUp = (event: PointerEvent) => {
      pointerBoostButtons.delete(event.button);
      pointerPosition = toLocalPosition(event, element);
      updateState();
    };

    const handlePointerLeave = () => {
      pointerActive = false;
      pointerPosition = null;
      pointerBoostButtons.clear();
      updateState();
    };

    const handlePointerCancel = handlePointerLeave;

    const handleContextMenu = (event: MouseEvent) => {
      if (pointerBoostButtons.size > 0) {
        event.preventDefault();
      }
    };

    const updateKeyboard = (event: KeyboardEvent, pressed: boolean) => {
      const code = event.code;

      if (
        KEY_FORWARD.has(code) ||
        KEY_BACK.has(code) ||
        KEY_LEFT.has(code) ||
        KEY_RIGHT.has(code)
      ) {
        event.preventDefault();
        if (pressed) {
          activeKeys.add(code);
        } else {
          activeKeys.delete(code);
        }
      }

      if (BOOST_KEYS.has(code)) {
        if (pressed) {
          boostKeys.add(code);
        } else {
          boostKeys.delete(code);
        }
        event.preventDefault();
      }

      updateState();
    };

    const handleKeyDown = (event: KeyboardEvent) => updateKeyboard(event, true);
    const handleKeyUp = (event: KeyboardEvent) => updateKeyboard(event, false);

    const handleBlur = () => {
      pointerActive = false;
      pointerPosition = null;
      pointerBoostButtons.clear();
      boostKeys.clear();
      activeKeys.clear();
      updateState();
    };

    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointerenter', handlePointerEnter);
    element.addEventListener('pointerleave', handlePointerLeave);
    element.addEventListener('pointercancel', handlePointerCancel);
    element.addEventListener('contextmenu', handleContextMenu);

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    window.addEventListener('blur', handleBlur);

    updateState();

    return () => {
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointerenter', handlePointerEnter);
      element.removeEventListener('pointerleave', handlePointerLeave);
      element.removeEventListener('pointercancel', handlePointerCancel);
      element.removeEventListener('contextmenu', handleContextMenu);

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [elementRef]);

  return state;
};

const toLocalPosition = (event: PointerEvent, element: HTMLElement): Vector2 => {
  const rect = element.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const hasAny = (haystack: Set<string>, needles: Set<string>): boolean => {
  for (const needle of needles) {
    if (haystack.has(needle)) return true;
  }
  return false;
};

const now = () => {
  if (typeof performance !== 'undefined') {
    return performance.now();
  }
  return Date.now();
};
