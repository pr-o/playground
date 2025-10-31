export const createId = (prefix: string): string => {
  const globalCrypto = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (globalCrypto && 'randomUUID' in globalCrypto) {
    return globalCrypto.randomUUID();
  }

  const random = Math.random().toString(16).slice(2, 10);
  return `${prefix}-${random}`;
};
