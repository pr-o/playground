import { randomBytes, createHash } from 'node:crypto';

const CODE_VERIFIER_LENGTH = 96;

export function generateCodeVerifier(length = CODE_VERIFIER_LENGTH) {
  const bytes = randomBytes(length);
  return base64UrlEncode(bytes);
}

export async function generateCodeChallenge(codeVerifier: string) {
  const hash = createHash('sha256').update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

export function generateStateToken(length = 32) {
  const bytes = randomBytes(length);
  return base64UrlEncode(bytes);
}

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export const SPOTIFY_AUTH_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
] as const;
