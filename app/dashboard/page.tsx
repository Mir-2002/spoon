"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Section from "@/components/ui/Section";
import TimeRangePicker from "@/components/dashboard/TimeRangePicker";
import TopArtists from "@/components/dashboard/TopArtists";
import Button from "@/components/ui/Button";
import type { TimeRange } from "@/lib/spotify";
import TopTracks from "@/components/dashboard/TopTracks";
import TopAlbums from "@/components/dashboard/TopAlbums";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [timeRange, setTimeRange] = useState<TimeRange>("medium_term");

  if (status === "loading") {
    return (
      <Section className="py-6 sm:py-8">
        <div className="text-foreground/80">Loading…</div>
      </Section>
    );
  }

  if (!session) {
    return (
      <Section className="py-6 sm:py-8">
        <div className="flex flex-col gap-3">
          <p className="text-foreground/80">You're not signed in.</p>
          <div>
            <Button
              onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
            >
              Sign in with Spotify
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex flex-col p-4">
        <TimeRangePicker
          value={timeRange}
          onChangeAction={setTimeRange}
          className="flex items-center justify-center lg:justify-start"
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-10 px-4">
        <TopArtists timeRange={timeRange} limit={5} />
        <TopTracks TimeRange={timeRange} limit={5} />
        <TopAlbums TimeRange={timeRange} limit={5} />
      </div>
    </Section>
  );
}
