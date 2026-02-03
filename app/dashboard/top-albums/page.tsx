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

type SpotifyAlbum = {
  id: string;
  name: string;
  uri?: string;
  external_urls?: { spotify?: string };
  images?: SpotifyImage[];
  artists?: Array<{
    id?: string;
    name: string;
    uri?: string;
    images?: SpotifyImage[];
  }>;
  count: number;
};

type SpotifyPaging<T> = {
  items: T[];
};

function AlbumCard({ album, index }: { album: SpotifyAlbum; index: number }) {
  const img = pickSpotifyImage(album.images as any, { minWidth: 320 });
  const artistNames = album.artists?.map((a) => a.name).join(", ");

  return (
    <a
      href={album.external_urls?.spotify ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col items-center w-full h-full lg:max-w-sm rounded-xl border border-gray-500/30 bg-special-black/30 hover:bg-special-blue/10 transition-colors duration-200 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/70 shadow-sm"
      aria-label={`Open ${album.name} on Spotify`}
      title={album.name}
    >
      {/* Album image */}
      {img ? (
        <div className="relative w-full aspect-square overflow-hidden rounded-t-xl bg-special-black/40 h-32 lg:h-44">
          <Image
            src={img}
            alt={album.name}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center rounded-t-xl bg-special-black/40 h-32 lg:h-44">
          <span className="text-xs text-foreground/50">No image</span>
        </div>
      )}

      {/* Details */}
      <div className="flex flex-col w-full px-3 py-2 gap-1 lg:px-4 lg:py-3">
        <div className="flex flex-row items-center gap-2 mb-1">
          <span className="text-base lg:text-lg font-bold text-special-blue">
            {index + 1}.
          </span>
          <h3 className="font-semibold text-special-blue truncate text-sm lg:text-lg">
            {album.name}
          </h3>
        </div>
        <span className="text-xs lg:text-sm text-foreground/70 truncate mb-1">
          {artistNames}
        </span>
        <span className="text-xs text-foreground/60">
          Top tracks: {album.count}
        </span>
      </div>
    </a>
  );
}

export default function TopAlbumsPage() {
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");
  const [items, setItems] = useState<SpotifyAlbum[]>([]);
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
          `/api/spotify/top-albums?time_range=${timeRange}&limit=50`,
          { cache: "no-store" }
        );
        const json: SpotifyPaging<SpotifyAlbum> = await res.json();
        if (!res.ok)
          throw new Error((json as any)?.error ?? "Failed to load albums");
        if (!cancelled) {
          setItems(Array.isArray(json?.items) ? json.items : []);
          setVisibleCount(10);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load albums");
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
          <LoadingView title="Loading top albums…" />
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
              Top Albums
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch auto-rows-fr">
          {visible.map((album, i) => (
            <AlbumCard key={album.id} album={album} index={i} />
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
