"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import type { TimeRange } from "@/lib/spotify";
import Section from "../ui/Section";

// Spotify API types
type SpotifyImage = { url: string; height?: number; width?: number };

type SpotifyArtist = {
  id: string;
  name: string;
  images?: SpotifyImage[];
  genres?: string[];
  followers?: { total?: number };
  popularity?: number;
  external_urls?: { spotify?: string };
};

type SpotifyPaging<T> = {
  items: T[];
};

export default function TopArtists({
  timeRange,
  limit = 10,
}: {
  timeRange: TimeRange;
  limit?: number;
}) {
  const [data, setData] = useState<SpotifyPaging<SpotifyArtist> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/spotify/top?type=artists&time_range=${timeRange}&limit=${limit}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load artists");
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load artists");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [timeRange, limit]);
  return (
    <Section className="flex flex-col items-center gap-2">
      <h2 className="text-xl text-special-blue font-semibold self-start">
        Top Artists
      </h2>

      {loading ? <span>Loading…</span> : null}

      {error ? <div>{error}</div> : null}

      {/* <div className="flex flex-row gap-4 overflow-auto w-full">
        {(data?.items ?? []).map((artist, i) => {
          const img = artist.images?.[0]?.url;
          const href = artist.external_urls?.spotify ?? "#";

          return (
            <Card
              key={artist.id}
              orientation="vertical"
              imageUrl={img}
              imageAlt={artist.name}
              href={href}
            >
              <div className="flex flex-col h-full w-full">
                <div className="flex flex-col items-start h-3/5 p-1 gap-1 w-full">
                  <p className="h-1/5 text-xs">#{i + 1}</p>
                  <h3 className="h-3/5 text-base font-semibold text-special-blue tracking-tighter text-ellipsis overflow-hidden whitespace-nowrap w-full">
                    {artist.name}
                  </h3>
                </div>
                <div className="h-2/5 w-full flex items-start p-1">
                  {typeof artist.popularity === "number" ? (
                    <span className="text-xs">
                      Popularity: {artist.popularity}
                    </span>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div> */}
      <div className="w-100 h-60 bg-red-200 grid grid-cols-5 grid-rows-2">
        {(data?.items ?? []).map((artist, i) => {
          const img = artist.images?.[0]?.url;
          const href = artist.external_urls?.spotify ?? "#";

          return (
            <div
              key={artist.id}
              className={`${
                i === 0 ? "row-span-2 col-span-3" : ""
              } bg-cover bg-center inset-shadow-md`}
              style={{ backgroundImage: `url('${img}')` }}
            ></div>
          );
        })}
      </div>
    </Section>
  );
}
