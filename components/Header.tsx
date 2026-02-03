"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";

export default function Header() {
  const { data: session } = useSession();
  const profile = (session as any)?.spotifyProfile;
  const displayName = profile?.display_name ?? session?.user?.name;
  const avatarUrl = profile?.images?.[0]?.url ?? (session?.user as any)?.image;

  return (
    <header className="w-full border-b-2 border-gray-600">
      <div className="mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl flex items-center justify-between gap-4 p-4">
        <h1 className="font-bold text-2xl text-special-blue">Spoon</h1>

        {session ? (
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName ? `${displayName} avatar` : "User avatar"}
                className="w-9 h-9 rounded-full object-cover border border-gray-500/30"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : null}
            {displayName ? (
              <span className="text-sm text-foreground/80 max-w-40 truncate">
                {displayName}
              </span>
            ) : null}
            <Button
              variant="danger"
              // className="bg-transparent shadow-none text-special-blue hover:bg-special-blue hover:text-foreground"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </Button>
          </div>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
}
