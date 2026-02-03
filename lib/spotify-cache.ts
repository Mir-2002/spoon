import type { TimeRange } from "./spotify";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function buildSpotifyCacheKey(
  path: string,
  params: Record<string, string | number | boolean | undefined>
) {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(String(params[k] ?? ""))}`)
    .join("&");
  return `${path}?${sorted}`;
}

export async function fetchWithSpotifyCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number
): Promise<T> {
  const now = Date.now();
  const existing = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) return existing.value;

  const value = await fetcher();
  memoryCache.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function getTimeRangeTtl(timeRange: TimeRange) {
  switch (timeRange) {
    // User expectation: short term changes more often
    case "short_term":
      return 60 * 60 * 1000; // 1 hour
    case "medium_term":
      return 6 * 60 * 60 * 1000; // 6 hours
    case "long_term":
      return 24 * 60 * 60 * 1000; // 24 hours
    default:
      return 6 * 60 * 60 * 1000;
  }
}

const _default = {
  buildSpotifyCacheKey,
  fetchWithSpotifyCache,
  getTimeRangeTtl,
};
export default _default;
