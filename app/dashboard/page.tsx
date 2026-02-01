"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Section from "@/components/ui/Section";
import TimeRangePicker from "@/components/dashboard/TimeRangePicker";
import TopArtists from "@/components/dashboard/TopArtists";
import Button from "@/components/ui/Button";
import type { TimeRange } from "@/lib/spotify";
import TopTracks from "@/components/dashboard/TopTracks";

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
    <Section className="py-6 sm:py-8 px-4 sm:px-0">
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        <TimeRangePicker
          value={timeRange}
          onChangeAction={setTimeRange}
          className="flex items-center justify-center lg:justify-start"
        />
      </div>

      <div className="flex flex-col gap-8 sm:gap-10">
        <TopArtists timeRange={timeRange} limit={10} />
        <TopTracks TimeRange={timeRange} limit={10} />
      </div>
    </Section>
  );
}
