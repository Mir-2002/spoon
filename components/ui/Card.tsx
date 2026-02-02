import { Url } from "next/dist/shared/lib/router/router";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  href: Url;
  imageUrl?: string;
  imageAlt?: string;
  orientation?: "vertical" | "horizontal";
};

export default function Card({
  children,
  className,
  href,
  imageUrl,
  imageAlt,
  orientation,
}: CardProps) {
  return (
    <Link
      className={`${
        orientation === "vertical" ? "w-30 h-64" : "w-48 h-28"
      } rounded-lg border-2 border-gray-500 ${className}`}
      href={href}
    >
      {/*Image*/}
      <div className="relative w-full h-1/2">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || "Card image"}
            fill
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 rounded-t-lg">
            <p>No image found.</p>
          </div>
        )}
      </div>
      {/*Content*/}
      <div className="w-full h-1/2 p-2 flex flex-col justify-center">
        {children}
      </div>
    </Link>
  );
}
