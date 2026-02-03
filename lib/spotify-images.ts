export type SpotifyImage = { url: string; height?: number; width?: number };

export function pickSpotifyImage(
  images: SpotifyImage[] | undefined,
  opts?: { minWidth?: number }
) {
  const minWidth = opts?.minWidth ?? 0;
  if (!images || images.length === 0) return undefined;

  // Prefer the smallest image that is still >= minWidth (sharp without being huge)
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));

  const candidate = sorted.find((img) => (img.width ?? 0) >= minWidth);
  return (candidate ?? sorted[sorted.length - 1])?.url;
}
