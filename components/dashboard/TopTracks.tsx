import React, { useEffect, useState } from "react";
import type { TimeRange } from "@/lib/spotify";
import Section from "../ui/Section";
import Card from "../ui/Card";

type SpotifyImage = { url: string; height?: number; width?: number };

type SpotifyTrack = {
  id: string;
  name: string;
  album?: {
    images?: SpotifyImage[];
    name?: string;
    release_date?: string;
  };
  artists?: { name: string }[];
  external_urls?: { spotify?: string };
};

type SpotifyPaging<T> = {
  items: T[];
};

export default function TopTracks({
  TimeRange,
  limit = 10,
}: {
  TimeRange: TimeRange;
  limit?: number;
}) {
  const [data, setData] = useState<SpotifyPaging<SpotifyTrack> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/spotify/top?type=tracks&time_range=${TimeRange}&limit=${limit}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load tracks");
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load tracks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [TimeRange, limit]);
  return (
    <Section className="flex flex-col gap-2">
      <h2 className="text-xl font-bold text-special-blue">Top Tracks</h2>

      {loading ? <span>Loading…</span> : null}

      {error ? <div>{error}</div> : null}

      <div className="flex flex-row gap-4 overflow-auto w-full">
        {(data?.items ?? []).map((track, i) => {
          const img = track.album?.images?.[0]?.url;
          const href = track.external_urls?.spotify ?? "#";

          return (
            <Card
              key={track.id}
              orientation="vertical"
              imageUrl={img}
              imageAlt={track.name}
              href={href}
            >
              <div className="flex flex-col h-full w-full p-1 hover:text-special-black transition-colors duration-200">
                <div className="flex flex-col items-start h-3/5 gap-1 w-full">
                  <p className="h-1/5 text-xs">#{i + 1}</p>
                  <h3 className="h-3/5 text-base font-semibold text-special-blue tracking-tighter w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {track.name}
                  </h3>
                </div>
                <div className="h-2/5 w-full flex items-start">Placeholder</div>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
