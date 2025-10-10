import { UPBIT_PROXY_ENDPOINT, UPBIT_WEBSOCKET_ENDPOINT } from './constants';
import type { UpbitErrorShape } from './types';

const DEFAULT_HEADERS: HeadersInit = {
  Accept: 'application/json',
};

export async function fetchJson<T>(
  path: string,
  init?: RequestInit,
  searchParams?: Record<string, string | number | boolean | undefined>,
  signal?: AbortSignal,
): Promise<T> {
  const search = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      search.set(key, String(value));
    });
  }

  const url = `${UPBIT_PROXY_ENDPOINT}${path.startsWith('/') ? path : `/${path}`}${
    search.toString() ? `?${search.toString()}` : ''
  }`;

  const response = await fetch(url, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...init?.headers,
    },
    signal,
    cache: 'no-store',
  });

  if (!response.ok) {
    let payload: UpbitErrorShape | undefined;

    try {
      payload = (await response.json()) as UpbitErrorShape;
    } catch {
      // no-op; use fallback error message below.
    }

    const errorMessage = payload?.error?.message ?? response.statusText;
    throw new Error(`Upbit API error: ${errorMessage}`);
  }

  return (await response.json()) as T;
}

export type WebSocketMessageHandler<T> = (message: T) => void;

interface WebSocketOptions<T> {
  payload: unknown;
  onMessage: WebSocketMessageHandler<T>;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

interface WebSocketSubscriber<T = unknown> {
  onMessage: WebSocketMessageHandler<T>;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

interface WebSocketEntry {
  socket: WebSocket;
  subscribers: Set<WebSocketSubscriber<unknown>>;
  cleanup: () => void;
  closeTimer: ReturnType<typeof setTimeout> | null;
}

const socketRegistry = new Map<string, WebSocketEntry>();

function ensureSocket<T>(payload: unknown): {
  entry: WebSocketEntry;
  subscriber: WebSocketSubscriber<T>;
  key: string;
} {
  const key = JSON.stringify(payload);
  const subscriber: WebSocketSubscriber<T> = {
    onMessage: () => undefined,
  };

  const existing = socketRegistry.get(key);
  if (existing) {
    return { entry: existing, subscriber, key };
  }

  const socket = new WebSocket(UPBIT_WEBSOCKET_ENDPOINT);
  socket.binaryType = 'arraybuffer';
  const textDecoder = new TextDecoder('utf-8');

  const entry: WebSocketEntry = {
    socket,
    subscribers: new Set(),
    cleanup: () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('close', handleClose);
    },
    closeTimer: null,
  };

  const notifyMessage = (raw: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.error('Failed to parse Upbit websocket message', error);
      return;
    }

    const payloads = Array.isArray(parsed) ? parsed : [parsed];

    for (const payload of payloads) {
      for (const subscriberEntry of entry.subscribers) {
        subscriberEntry.onMessage(payload);
      }
    }
  };

  const handleMessage = (event: MessageEvent<ArrayBuffer | string | Blob>) => {
    if (typeof event.data === 'string') {
      notifyMessage(event.data);
      return;
    }

    if (event.data instanceof ArrayBuffer) {
      notifyMessage(textDecoder.decode(event.data));
      return;
    }

    if (event.data instanceof Blob) {
      void event.data
        .arrayBuffer()
        .then((buffer) => notifyMessage(textDecoder.decode(buffer)))
        .catch((error) => console.error('Failed to read Upbit websocket blob', error));
      return;
    }

    console.warn(
      'Received unsupported websocket payload type from Upbit',
      typeof event.data,
    );
  };

  const handleError = (event: Event) => {
    for (const subscriberEntry of entry.subscribers) {
      subscriberEntry.onError?.(event);
    }
  };

  const handleClose = (event: CloseEvent) => {
    for (const subscriberEntry of entry.subscribers) {
      subscriberEntry.onClose?.(event);
    }
    entry.subscribers.clear();
    entry.cleanup();
    socketRegistry.delete(key);
  };

  socket.addEventListener('open', () => {
    const payloadBuffer = JSON.stringify(payload);
    socket.send(payloadBuffer);
  });

  socket.addEventListener('message', handleMessage);
  socket.addEventListener('error', handleError);
  socket.addEventListener('close', handleClose);

  entry.cleanup = () => {
    socket.removeEventListener('message', handleMessage);
    socket.removeEventListener('error', handleError);
    socket.removeEventListener('close', handleClose);
  };

  socketRegistry.set(key, entry);

  return { entry, subscriber, key };
}

function scheduleSocketClose(entry: WebSocketEntry, key: string, delayMs = 500) {
  if (entry.closeTimer) {
    clearTimeout(entry.closeTimer);
  }

  entry.closeTimer = setTimeout(() => {
    socketRegistry.delete(key);
    entry.cleanup();

    const { socket } = entry;
    if (socket.readyState === WebSocket.CONNECTING) {
      const handleOpen = () => {
        socket.removeEventListener('open', handleOpen);
        socket.close();
      };
      socket.addEventListener('open', handleOpen);
      entry.closeTimer = null;
      return;
    }

    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }

    entry.closeTimer = null;
  }, delayMs);
}

export function openUpbitWebSocket<T>({
  payload,
  onMessage,
  onError,
  onClose,
}: WebSocketOptions<T>): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const { entry, subscriber, key } = ensureSocket<T>(payload);

  subscriber.onMessage = onMessage;
  subscriber.onError = onError;
  subscriber.onClose = onClose;

  entry.subscribers.add(subscriber as WebSocketSubscriber<unknown>);
  if (entry.closeTimer) {
    clearTimeout(entry.closeTimer);
    entry.closeTimer = null;
  }

  return () => {
    const activeEntry = socketRegistry.get(key);
    if (!activeEntry) return;

    activeEntry.subscribers.delete(subscriber as WebSocketSubscriber<unknown>);

    if (activeEntry.subscribers.size === 0) {
      scheduleSocketClose(activeEntry, key);
    }
  };
}
