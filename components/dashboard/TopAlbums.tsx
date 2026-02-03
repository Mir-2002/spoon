import React, { useEffect, useState } from "react";
import Image from "next/image";
import Section from "../ui/Section";
import Button from "../ui/Button";
import LoadingView from "../ui/LoadingView";
import { pickSpotifyImage } from "@/lib/spotify-images";
import { useRouter } from "next/navigation";

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

function AlbumCard({ album, index }: { album: SpotifyAlbum; index: number }) {
  const img = pickSpotifyImage(album.images as any, { minWidth: 320 });
  const artistNames = album.artists?.map((a) => a.name).join(", ");
  return (
    <a
      href={album.external_urls?.spotify ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col items-center w-full h-full lg:max-w-sm rounded-xl border border-gray-500/30 bg-special-black/30 hover:bg-special-blue/10 transition-colors duration-200 p-0 mb-3 last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/70 shadow-sm"
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
            sizes="(min-width: 1024px) 28vw, 100vw"
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
          <h1 className="font-semibold text-special-blue truncate text-sm lg:text-lg">
            {album.name}
          </h1>
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
  const router = useRouter();

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

  const top5 = (data?.items ?? []).slice(0, 5);

  if (loading) {
    return (
      <Section className="flex flex-col gap-4">
        <h2 className="text-xl text-special-blue font-semibold">Top Albums</h2>
        <LoadingView title="Loading top albums…" />
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="flex flex-col gap-4">
        <h2 className="text-xl text-special-blue font-semibold">Top Albums</h2>
        <div className="text-red-400">{error}</div>
      </Section>
    );
  }

  return (
    <Section className="flex flex-col gap-4">
      <h2 className="text-xl text-special-blue font-semibold">Top Albums</h2>
      <div className="grid grid-cols-1 w-full gap-3 sm:grid-cols-1 lg:grid-cols-3 lg:gap-4 items-stretch auto-rows-fr">
        {top5.map((album, i) => (
          <AlbumCard key={album.id} album={album} index={i} />
        ))}
      </div>
      <Button
        variant="primary"
        className="outline-0 bg-transparent self-end shadow-none text-lg text-special-blue tracking-tighter hover:bg-special-blue hover:text-foreground transition-colors duration-200"
        onClick={() => router.push("/dashboard/top-albums")}
      >
        See All Top Albums
      </Button>
    </Section>
  );
}
