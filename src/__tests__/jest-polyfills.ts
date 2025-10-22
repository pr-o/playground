import { TransformStream } from 'stream/web';
import { TextDecoder, TextEncoder } from 'util';

if (!globalThis.TextEncoder) {
  // @ts-expect-error Node.js TextEncoder matches the DOM interface sufficiently for tests.
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  // @ts-expect-error Node.js TextDecoder matches the DOM interface sufficiently for tests.
  globalThis.TextDecoder = TextDecoder;
}

if (!globalThis.TransformStream) {
  // @ts-expect-error Node.js TransformStream is compatible with the Web API interface.
  globalThis.TransformStream = TransformStream;
}
