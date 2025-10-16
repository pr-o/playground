const DEFAULT_USER_AGENT = 'youtube-music-clone/1.0 (+https://github.com/placeholder)';

export function getDiscogsBaseUrl() {
  return 'https://api.discogs.com';
}

export function getDiscogsUserAgent() {
  return process.env.DISCOGS_USER_AGENT || DEFAULT_USER_AGENT;
}

export function getDiscogsConsumerKey() {
  return process.env.DISCOGS_CONSUMER_KEY ?? '';
}

export function getDiscogsConsumerSecret() {
  return process.env.DISCOGS_CONSUMER_SECRET ?? '';
}

export function getDiscogsUserToken() {
  return process.env.DISCOGS_USER_TOKEN ?? '';
}

export function hasDiscogsAuth() {
  return Boolean(
    getDiscogsUserToken() || (getDiscogsConsumerKey() && getDiscogsConsumerSecret()),
  );
}
