import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildSpotifyCacheKey,
  fetchWithSpotifyCache,
  getTimeRangeTtl,
} from "../../../../lib/spotify-cache";

const allowedRanges = new Set([
  "short_term",
  "medium_term",
  "long_term",
] as const);

type AlbumAgg = {
  id: string;
  name: string;
  uri?: string;
  external_urls?: { spotify?: string };
  images?: Array<{ url: string; height?: number; width?: number }>;
  artists?: Array<{ id?: string; name: string; uri?: string }>;
  count: number;
};

export async function GET(req: Request) {
  const session = await getSession();
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const time_range = (
    searchParams.get("time_range") ?? "medium_term"
  ).toLowerCase();
  const limitRaw = searchParams.get("limit") ?? "10";

  if (!allowedRanges.has(time_range as any)) {
    return NextResponse.json(
      {
        error:
          "Invalid time_range. Use 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (years).",
      },
      { status: 400 }
    );
  }

  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 10, 1), 50);
  const ttlMs = getTimeRangeTtl(time_range as any);

  const cacheKey = buildSpotifyCacheKey("/api/spotify/top-albums", {
    time_range,
    limit,
    user:
      (session?.user as any)?.email ?? (session?.user as any)?.name ?? "user",
  });

  const result = await fetchWithSpotifyCache(
    cacheKey,
    async () => {
      // We derive albums from top tracks (Spotify has no /me/top/albums endpoint)
      const spotifyUrl = new URL("https://api.spotify.com/v1/me/top/tracks");
      spotifyUrl.searchParams.set("time_range", time_range);
      spotifyUrl.searchParams.set("limit", "50");

      const res = await fetch(spotifyUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: Math.floor(ttlMs / 1000) },
      });

      const data = await res.json().catch(() => null);
      return { status: res.status, data };
    },
    ttlMs
  );

  if (result.status !== 200) {
    return NextResponse.json(
      result.data ?? { error: "Spotify request failed" },
      {
        status: result.status,
      }
    );
  }

  const items: any[] = Array.isArray(result.data?.items)
    ? result.data.items
    : [];

  const map = new Map<string, AlbumAgg>();

  for (const track of items) {
    const album = track?.album;
    const albumId: string | undefined = album?.id;
    if (!albumId) continue;

    const existing = map.get(albumId);
    if (existing) {
      existing.count += 1;
      continue;
    }

    map.set(albumId, {
      id: albumId,
      name: album?.name ?? "",
      uri: album?.uri,
      external_urls: album?.external_urls,
      images: album?.images,
      artists: Array.isArray(album?.artists)
        ? album.artists.map((a: any) => ({
            id: a?.id,
            name: a?.name,
            uri: a?.uri,
          }))
        : undefined,
      count: 1,
    });
  }

  const albums = Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return NextResponse.json(
    {
      time_range,
      derivedFrom: "top_tracks",
      totalTracksConsidered: items.length,
      items: albums,
    },
    { status: 200 }
  );
}
