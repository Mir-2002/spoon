import React, { useEffect, useState } from "react";
import Section from "../ui/Section";
import Card from "../ui/Card";

type SpotifyImage = { url: string; height?: number; width?: number };

type SpotifyAlbum = {
  id: string;
  name: string;
  uri?: string;
  external_urls?: { spotify?: string };
  images?: SpotifyImage[];
  artists?: Array<{ id?: string; name: string; uri?: string }>;
  count: number;
};

type SpotifyPaging<T> = {
  items: T[];
};

export default function TopAlbums({
  TimeRange,
  limit = 10,
}: {
  TimeRange: string;
  limit?: number;
}) {
  const [data, setData] = useState<SpotifyPaging<SpotifyAlbum> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/spotify/top-albums?time_range=${TimeRange}&limit=${limit}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load albums");
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
  }, [TimeRange, limit]);

  return (
    <Section className="flex flex-col gap-2">
      <h2 className="text-xl text-special-blue font-semibold">Top Albums</h2>
      {loading ? <span>Loading…</span> : null}

      {error ? <div>{error}</div> : null}

      <div className="flex flex-row gap-4 overflow-auto w-full">
        {(data?.items ?? []).map((album, i) => {
          const img = album.images?.[0]?.url;
          const href = album.external_urls?.spotify ?? "#";
          const artistNames = album.artists?.map((a) => a.name).join(", ");

          return (
            <Card
              key={album.id}
              orientation="vertical"
              imageUrl={img}
              imageAlt={album.name}
              href={href}
            >
              <div className="flex flex-col h-full w-full p-1 hover:text-special-black transition-colors duration-200">
                <div className="flex flex-col items-start h-3/5 gap-1 w-full">
                  <p className="h-1/5 text-xs">#{i + 1}</p>
                  <h3 className="h-3/5 text-base font-semibold text-special-blue tracking-tighter w-full overflow-hidden text-ellipsis whitespace-nowrap">
                    {album.name}
                  </h3>
                  <p className="text-xs text-foreground/70">{artistNames}</p>
                </div>
                <div className="h-2/5 w-full flex items-start">
                  <span className="text-xs">Top tracks: {album.count}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
