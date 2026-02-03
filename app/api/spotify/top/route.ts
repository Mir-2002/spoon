import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  buildSpotifyCacheKey,
  fetchWithSpotifyCache,
  getTimeRangeTtl,
} from "../../../../lib/spotify-cache";

const allowedTypes = new Set(["artists", "tracks"] as const);
const allowedRanges = new Set([
  "short_term", //4 Weeks
  "medium_term", // 6 Months
  "long_term", // All Time
] as const);

export async function GET(req: Request) {
  const session = await getSession();
  const accessToken = (session as any)?.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const type = (searchParams.get("type") ?? "artists").toLowerCase();
  const time_range = (
    searchParams.get("time_range") ?? "medium_term"
  ).toLowerCase();
  const limitRaw = searchParams.get("limit") ?? "20";
  const offsetRaw = searchParams.get("offset") ?? "0";

  if (!allowedTypes.has(type as any)) {
    return NextResponse.json(
      { error: "Invalid type. Use 'artists' or 'tracks'." },
      { status: 400 }
    );
  }

  if (!allowedRanges.has(time_range as any)) {
    return NextResponse.json(
      {
        error:
          "Invalid time_range. Use 'short_term' (4 weeks), 'medium_term' (6 months), or 'long_term' (years).",
      },
      { status: 400 }
    );
  }

  const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 20, 1), 50);
  const offset = Math.max(parseInt(offsetRaw, 10) || 0, 0);

  const spotifyUrl = new URL(`https://api.spotify.com/v1/me/top/${type}`);
  spotifyUrl.searchParams.set("time_range", time_range);
  spotifyUrl.searchParams.set("limit", String(limit));
  spotifyUrl.searchParams.set("offset", String(offset));

  const cacheKey = buildSpotifyCacheKey("/api/spotify/top", {
    type,
    time_range,
    limit,
    offset,
    user:
      (session?.user as any)?.email ?? (session?.user as any)?.name ?? "user",
  });

  const ttlMs = getTimeRangeTtl(time_range as any);

  const data = await fetchWithSpotifyCache(
    cacheKey,
    async () => {
      const res = await fetch(spotifyUrl.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // allow caching on the Next.js side as well
        next: { revalidate: Math.floor(ttlMs / 1000) },
      });

      const json = await res.json().catch(() => null);
      return { status: res.status, json };
    },
    ttlMs
  );

  return NextResponse.json(
    data.json ?? { error: "Invalid response from Spotify" },
    { status: data.status }
  );
}
