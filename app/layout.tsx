import type { Metadata } from "next";
import { TASA_Orbiter, Zalando_Sans_Expanded } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthSessionProvider from "@/components/SessionProvider";

const zalandoSans = Zalando_Sans_Expanded({
  variable: "--font-zalando-sans-expanded",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const tasaOrbiter = TASA_Orbiter({
  variable: "--font-tasa-orbiter",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Spoon",
  description: "Get insights on your music listening habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${zalandoSans.variable} ${tasaOrbiter.variable} antialiased`}
      >
        <AuthSessionProvider>
          <div className="mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
            <Header />
            {children}
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
