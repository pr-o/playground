import { ExcalidrawElement } from '@/types/excalidraw/elements';

export const EXCALIDRAW_CLIPBOARD_MIME = 'application/x-excalidraw-elements';

export type ClipboardPayload = {
  type: 'excalidraw/elements';
  version: number;
  createdAt: number;
  elements: ExcalidrawElement[];
};

export const createClipboardPayload = (
  elements: ExcalidrawElement[],
  options?: { createdAt?: number },
): ClipboardPayload => ({
  type: 'excalidraw/elements',
  version: 1,
  createdAt: options?.createdAt ?? Date.now(),
  elements,
});

export const isClipboardPayload = (value: unknown): value is ClipboardPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const payload = value as Partial<ClipboardPayload>;
  return (
    payload.type === 'excalidraw/elements' &&
    Array.isArray(payload.elements) &&
    payload.elements.length > 0
  );
};

export const parseClipboardPayload = (serialized: string) => {
  if (!serialized) {
    return null;
  }
  try {
    const value = JSON.parse(serialized) as ClipboardPayload;
    return isClipboardPayload(value) ? value : null;
  } catch {
    return null;
  }
};
