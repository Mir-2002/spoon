"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import LoadingView from "@/components/ui/LoadingView";
import TimeRangePicker from "@/components/dashboard/TimeRangePicker";
import { pickSpotifyImage } from "@/lib/spotify-images";
import type { TimeRange } from "@/lib/spotify";

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
  total?: number;
  limit?: number;
  offset?: number;
  next?: string | null;
};

function TrackCard({ track, index }: { track: SpotifyTrack; index: number }) {
  const img = pickSpotifyImage(track.album?.images as any, { minWidth: 160 });
  const releaseYear = track.album?.release_date
    ? track.album.release_date.slice(0, 4)
    : undefined;

  return (
    <a
      href={track.external_urls?.spotify ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-row items-center gap-4 w-full rounded-lg border border-gray-500/30 bg-special-black/30 hover:bg-special-blue/10 transition-colors duration-200 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/70"
      aria-label={`Open ${track.name} on Spotify`}
      title={track.name}
    >
      <div className="flex flex-col items-center justify-center w-8 shrink-0">
        <span className="text-lg font-bold text-special-blue">{index + 1}</span>
      </div>

      {img ? (
        <div className="relative flex items-center h-16 w-16 shrink-0 overflow-hidden rounded-md bg-special-black/40">
          <Image
            src={img}
            alt={track.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center h-16 w-16 shrink-0 overflow-hidden rounded-md bg-special-black/40 justify-center">
          <span className="text-xs text-foreground/50">No image</span>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-semibold text-special-blue truncate text-base sm:text-lg mb-0.5">
          {track.name}
        </h3>
        <span className="text-sm text-foreground/70 truncate">
          {track.artists?.map((a) => a.name).join(", ")}
        </span>
        <div className="flex flex-row gap-2 text-xs text-foreground/60 mt-1">
          <span className="truncate max-w-56">{track.album?.name}</span>
          {releaseYear ? (
            <>
              <span className="hidden sm:inline">·</span>
              <span className="truncate">{releaseYear}</span>
            </>
          ) : null}
        </div>
      </div>
    </a>
  );
}

export default function TopTracksPage() {
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [items, setItems] = useState<SpotifyTrack[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/spotify/top?type=tracks&time_range=${timeRange}&limit=50&offset=0`,
          { cache: "no-store" }
        );
        const json: SpotifyPaging<SpotifyTrack> = await res.json();
        if (!res.ok)
          throw new Error((json as any)?.error ?? "Failed to load tracks");
        if (!cancelled) {
          setItems(Array.isArray(json?.items) ? json.items : []);
          setVisibleCount(10);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load tracks");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  const visible = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );
  const canSeeMore = visibleCount < items.length;

  if (loading) {
    return (
      <Section className="py-6 sm:py-8">
        <div className="px-4">
          <LoadingView title="Loading top tracks…" />
        </div>
      </Section>
    );
  }

  return (
    <Section className="py-6 sm:py-8">
      <div className="px-4 flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-special-blue">
              Top Tracks
            </h1>
            <p className="text-sm text-foreground/70">
              Showing {Math.min(visibleCount, items.length)} of {items.length}
            </p>
          </div>
          <Button
            variant="primary"
            className="bg-transparent shadow-none text-special-blue hover:bg-special-blue hover:text-foreground"
            onClick={() => router.push("/dashboard")}
          >
            Back
          </Button>
        </div>

        <TimeRangePicker
          value={timeRange}
          onChangeAction={setTimeRange}
          className="flex items-center justify-center lg:justify-start"
        />

        {error ? <div className="text-red-400">{error}</div> : null}

        <div className="flex flex-col gap-2">
          {visible.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            variant="primary"
            className={
              "bg-transparent shadow-none text-special-blue hover:bg-special-blue hover:text-foreground " +
              (!canSeeMore ? "opacity-50 pointer-events-none" : "")
            }
            onClick={() =>
              setVisibleCount((c) => Math.min(c + 10, items.length))
            }
          >
            See more
          </Button>
        </div>
      </div>
    </Section>
  );
}
