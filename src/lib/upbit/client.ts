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

export function openUpbitWebSocket<T>({
  payload,
  onMessage,
  onError,
  onClose,
}: WebSocketOptions<T>): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const socket = new WebSocket(UPBIT_WEBSOCKET_ENDPOINT);

  const handleMessage = (event: MessageEvent<ArrayBuffer>) => {
    try {
      const textDecoder = new TextDecoder('utf-8');
      const json = textDecoder.decode(event.data);
      const parsed = JSON.parse(json) as T;
      onMessage(parsed);
    } catch (error) {
      console.error('Failed to parse Upbit websocket message', error);
    }
  };

  socket.addEventListener('open', () => {
    const payloadBuffer = JSON.stringify(payload);
    socket.send(payloadBuffer);
  });

  socket.addEventListener('message', handleMessage);
  if (onError) socket.addEventListener('error', onError);
  if (onClose) socket.addEventListener('close', onClose);

  return () => {
    socket.removeEventListener('message', handleMessage);
    if (onError) socket.removeEventListener('error', onError);
    if (onClose) socket.removeEventListener('close', onClose);
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };
}
