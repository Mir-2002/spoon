import NextAuth, { type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

type SpotifyToken = {
  accessToken?: string;
  accessTokenExpires?: number; // epoch ms
  refreshToken?: string;
  user?: unknown;
  error?: "RefreshAccessTokenError";
};

async function refreshAccessToken(token: SpotifyToken): Promise<SpotifyToken> {
  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken ?? "",
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken, // sometimes not returned
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-top-read",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, user, profile }) {
      // Initial sign-in: persist tokens
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          user,
          spotifyProfile: profile
            ? {
                id: (profile as any).id,
                display_name:
                  (profile as any).display_name ?? (profile as any).username,
                images: (profile as any).images,
              }
            : undefined,
        } satisfies SpotifyToken & { spotifyProfile?: any };
      }

      // Return previous token if still valid
      const t = token as SpotifyToken;
      if (
        t.accessToken &&
        t.accessTokenExpires &&
        Date.now() < t.accessTokenExpires
      ) {
        return token;
      }

      // Refresh when expired
      return refreshAccessToken(t);
    },
    async session({ session, token }) {
      const t = token as SpotifyToken & { spotifyProfile?: any };
      // expose accessToken + profile on the session
      (session as any).accessToken = t.accessToken;
      (session as any).error = t.error;
      if (t.spotifyProfile) {
        (session as any).spotifyProfile = t.spotifyProfile;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
