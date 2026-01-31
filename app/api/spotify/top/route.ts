import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const allowedTypes = new Set(["artists", "tracks"] as const);
const allowedRanges = new Set([
  "short_term",
  "medium_term",
  "long_term",
] as const);

export async function GET(req: Request) {
  const session = await getSession();
  const accessToken = session?.accessToken;

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

  const res = await fetch(spotifyUrl.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    // Avoid caching user-specific data
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { error: "Invalid response from Spotify" }, {
    status: res.status,
  });
}
