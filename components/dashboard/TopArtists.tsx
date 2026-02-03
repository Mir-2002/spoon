"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { TimeRange } from "@/lib/spotify";
import Section from "../ui/Section";
import Button from "../ui/Button";
import LoadingView from "../ui/LoadingView";
import { pickSpotifyImage } from "@/lib/spotify-images";
import { useRouter } from "next/navigation";

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

function ArtistTile({
  artist,
  rank,
  className = "",
}: {
  artist?: SpotifyArtist;
  rank: number;
  className?: string;
}) {
  const img = pickSpotifyImage(artist?.images as any, { minWidth: 640 });

  return (
    <a
      href={artist?.external_urls?.spotify ?? "#"}
      target="_blank"
      rel="noreferrer"
      className={`group relative block h-full w-full overflow-hidden bg-special-black/20 ${className}`}
      aria-label={artist ? `Open ${artist.name} on Spotify` : undefined}
      title={artist?.name}
    >
      {img ? (
        <Image
          src={img}
          alt={artist?.name ?? "Artist"}
          fill
          sizes="(min-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-special-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-special-black/90 via-special-black/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-2">
        <div className="flex items-end justify-between gap-2">
          <p className="text-xs text-foreground/70">#{rank}</p>
          <p className="text-sm font-semibold text-foreground truncate">
            {artist?.name ?? ""}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]" />
    </a>
  );
}

export default function TopArtists({
  timeRange,
  limit = 5,
}: {
  timeRange: TimeRange;
  limit?: number;
}) {
  const [data, setData] = useState<SpotifyPaging<SpotifyArtist> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const top5 = (data?.items ?? []).slice(0, 5);

  if (loading) {
    return (
      <Section className="flex flex-col items-center gap-6">
        <h2 className="text-xl text-special-blue font-semibold self-start">
          Top Artists
        </h2>
        <LoadingView title="Loading top artists…" />
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="flex flex-col items-center gap-6">
        <h2 className="text-xl text-special-blue font-semibold self-start">
          Top Artists
        </h2>
        <div className="text-red-400 w-full">{error}</div>
      </Section>
    );
  }

  return (
    <Section className="flex flex-col items-center gap-6">
      <h2 className="text-xl text-special-blue font-semibold self-start">
        Top Artists
      </h2>

      {/* Chart container */}
      <div className="w-3/4 h-50 flex flex-row lg:h-90">
        {/* Left side: #1 artist */}
        <div className="w-1/2 h-full">
          <ArtistTile artist={top5[0]} rank={1} />
        </div>

        {/* Right side: #2-#5 artists */}
        <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2">
          <ArtistTile artist={top5[1]} rank={2} />
          <ArtistTile artist={top5[2]} rank={3} />
          <ArtistTile artist={top5[3]} rank={4} />
          <ArtistTile artist={top5[4]} rank={5} />
        </div>
      </div>

      <Button
        variant="primary"
        className="outline-0 bg-transparent self-end shadow-none text-lg text-special-blue tracking-tighter hover:bg-special-blue hover:text-foreground transition-colors duration-200"
        onClick={() => router.push("/dashboard/top-artists")}
      >
        See All Top Artists
      </Button>
    </Section>
  );
}
