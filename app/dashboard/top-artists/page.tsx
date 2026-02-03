"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Section from "@/components/ui/Section";
import Button from "@/components/ui/Button";
import LoadingView from "@/components/ui/LoadingView";
import TimeRangePicker from "@/components/dashboard/TimeRangePicker";
import { pickSpotifyImage } from "@/lib/spotify-images";
import type { TimeRange } from "@/lib/spotify";

type SpotifyImage = { url: string; height?: number; width?: number };

type SpotifyArtist = {
  id: string;
  name: string;
  images?: SpotifyImage[];
  external_urls?: { spotify?: string };
  genres?: string[];
  popularity?: number;
  followers?: { total?: number };
};

type SpotifyPaging<T> = {
  items: T[];
  total?: number;
  limit?: number;
  offset?: number;
  next?: string | null;
};

function ArtistRowCard({
  artist,
  rank,
}: {
  artist: SpotifyArtist;
  rank: number;
}) {
  const img = pickSpotifyImage(artist.images as any, { minWidth: 1280 });

  return (
    <a
      href={artist.external_urls?.spotify ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group relative flex w-full min-h-24 sm:min-h-28 overflow-hidden border border-gray-500/30 bg-special-black/20 hover:bg-special-blue/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/70"
      aria-label={`Open ${artist.name} on Spotify`}
      title={artist.name}
    >
      {img ? (
        <Image
          src={img}
          alt={artist.name}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      ) : null}

      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 bg-special-black/20" />

      {/* Left shadow (like TopArtists section, but from the left) */}
      <div className="absolute inset-y-0 left-0 w-44 bg-linear-to-r from-special-black/90 via-special-black/30 to-transparent" />

      <div className="relative flex items-center gap-3 sm:gap-4 w-full p-3 sm:p-4">
        <div className="shrink-0 flex flex-col">
          <p className="text-xs text-foreground/70">#{rank}</p>
          <p className="text-lg sm:text-xl font-semibold text-foreground truncate max-w-48 sm:max-w-72">
            {artist.name}
          </p>
        </div>

        {/* Right-side meta */}
        <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-foreground/70">
          {typeof artist.popularity === "number" ? (
            <span className="rounded-full border border-gray-500/20 bg-special-black/20 px-2 py-1">
              Popularity: {artist.popularity}
            </span>
          ) : null}
          {typeof artist.followers?.total === "number" ? (
            <span className="rounded-full border border-gray-500/20 bg-special-black/20 px-2 py-1">
              {artist.followers.total.toLocaleString()} followers
            </span>
          ) : null}
        </div>
      </div>
    </a>
  );
}

export default function TopArtistsPage() {
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [items, setItems] = useState<SpotifyArtist[]>([]);
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
          `/api/spotify/top?type=artists&time_range=${timeRange}&limit=50&offset=0`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Failed to load artists");
        if (!cancelled) {
          setItems(Array.isArray(json?.items) ? json.items : []);
          setVisibleCount(10);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load artists");
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
          <LoadingView title="Loading top artists…" />
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
              Top Artists
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

        <div className="grid grid-cols-1 gap-3">
          {visible.map((artist, i) => (
            <ArtistRowCard key={artist.id} artist={artist} rank={i + 1} />
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
