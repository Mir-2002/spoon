import React, { useEffect, useState } from "react";
import Image from "next/image";
import type { TimeRange } from "@/lib/spotify";
import Section from "../ui/Section";
import Button from "../ui/Button";
import LoadingView from "../ui/LoadingView";
import { pickSpotifyImage } from "@/lib/spotify-images";
import { useRouter } from "next/navigation";

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

function TrackCard({ track, index }: { track: SpotifyTrack; index: number }) {
  const img = pickSpotifyImage(track.album?.images as any, { minWidth: 160 });
  // Extract year from release_date (YYYY-MM-DD or YYYY)
  const releaseYear = track.album?.release_date
    ? track.album.release_date.slice(0, 4)
    : undefined;
  return (
    <a
      href={track.external_urls?.spotify ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-row items-center gap-4 w-full rounded-lg border border-gray-500/30 bg-special-black/30 hover:bg-special-blue/10 transition-colors duration-200 p-3 mb-2 last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/70"
      aria-label={`Open ${track.name} on Spotify`}
      title={track.name}
    >
      {/* Track number */}
      <div className="flex flex-col items-center justify-center w-8">
        <span className="text-lg font-bold text-special-blue">{index + 1}</span>
      </div>
      {/* Track image */}
      {img ? (
        <div className="relative flex items-center h-16 w-16 min-w-0 overflow-hidden rounded-md bg-special-black/40">
          <Image
            src={img}
            alt={track.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center h-16 w-16 min-w-0 overflow-hidden rounded-md bg-special-black/40 justify-center">
          <span className="text-xs text-foreground/50">No image</span>
        </div>
      )}
      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h1 className="font-semibold text-special-blue truncate text-base sm:text-lg mb-0.5">
          {track.name}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
          <span className="text-sm text-foreground/70 truncate">
            {track.artists?.map((a) => a.name).join(", ")}
          </span>
        </div>
        <div className="flex flex-row gap-2 text-xs text-foreground/60 mt-1">
          <span className="truncate max-w-40">{track.album?.name}</span>
          {releaseYear && (
            <>
              <span className="hidden sm:inline">·</span>
              <span className="truncate">{releaseYear}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

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
  const router = useRouter();

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

  const top5 = (data?.items ?? []).slice(0, 5);

  if (loading) {
    return (
      <Section className="flex flex-col gap-4">
        <h2 className="text-xl text-special-blue font-semibold">Top Tracks</h2>
        <LoadingView title="Loading top tracks…" />
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="flex flex-col gap-4">
        <h2 className="text-xl text-special-blue font-semibold">Top Tracks</h2>
        <div className="text-red-400">{error}</div>
      </Section>
    );
  }

  return (
    <Section className="flex flex-col gap-4">
      <h2 className="text-xl text-special-blue font-semibold">Top Tracks</h2>

      <div className="flex flex-col w-full">
        {top5.map((track, i) => (
          <TrackCard key={track.id} track={track} index={i} />
        ))}
      </div>

      <Button
        variant="primary"
        className="outline-0 bg-transparent self-end shadow-none text-lg text-special-blue tracking-tighter hover:bg-special-blue hover:text-foreground transition-colors duration-200"
        onClick={() => router.push("/dashboard/top-tracks")}
      >
        See All Top Tracks
      </Button>
    </Section>
  );
}
