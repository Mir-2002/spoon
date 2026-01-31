"use client";

import Button from "@/components/ui/Button";
import { signIn, useSession } from "next-auth/react";
import { FaSpotify } from "react-icons/fa";

export default function Home() {
  const { status } = useSession();

  return (
    <main className="flex flex-col items-center justify-center gap-4 min-h-screen p-4">
      <h1 className="text-4xl text-center w-3/4 font-bold">
        Find out your top artists, albums, and tracks in a few clicks.
      </h1>

      <Button
        variant="custom"
        className="bg-green-600 w-2/4 hover:bg-green-700 flex flex-row items-center justify-center gap-2"
        onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
        disabled={status === "loading"}
      >
        Sign In With Spotify
        <span>
          <FaSpotify size={24} />
        </span>
      </Button>
    </main>
  );
}
