import React from "react";

type CardVariant = "default" | "outline" | "elevated";

type CardProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;

  /** Optional cover image (album art / artist image). */
  imageSrc?: string;
  imageAlt?: string;

  /** Optional extra info (e.g., rank, popularity, duration, artist list). */
  meta?: React.ReactNode;

  /** Typically buttons/links. */
  footer?: React.ReactNode;

  /** Turn the whole card into a link. */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;

  /** Layout */
  orientation?: "vertical" | "horizontal";

  /** Style */
  variant?: CardVariant;
  className?: string;
  contentClassName?: string;
  imageClassName?: string;
  headerClassName?: string;
  footerClassName?: string;

  /** Render hook for injecting custom blocks (badges, icons, etc). */
  rightSlot?: React.ReactNode;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-special-black/40 border border-special-black/60",
  outline: "bg-transparent border border-special-blue/40",
  elevated:
    "bg-special-black/40 border border-special-black/60 shadow-lg shadow-black/30",
};

export default function Card({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  meta,
  footer,
  href,
  onClick,
  orientation = "vertical",
  variant = "default",
  className = "",
  contentClassName = "",
  imageClassName = "",
  headerClassName = "",
  footerClassName = "",
  rightSlot,
}: CardProps) {
  const isInteractive = Boolean(href || onClick);

  const base = "rounded-lg overflow-hidden text-foreground transition-colors";

  const layout =
    orientation === "horizontal" ? "flex flex-row gap-4" : "flex flex-col";

  const interactive = isInteractive
    ? "cursor-pointer hover:border-special-blue/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/60"
    : "";

  const rootClassName = `${base} ${variantClasses[variant]} ${layout} ${interactive} ${className}`;

  const body = (
    <>
      {imageSrc ? (
        <div
          className={
            orientation === "horizontal"
              ? "shrink-0 w-24 h-24 sm:w-28 sm:h-28"
              : "w-full aspect-square"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={imageAlt ?? ""}
            className={`w-full h-full object-cover ${imageClassName}`}
            loading="lazy"
          />
        </div>
      ) : null}

      <div className={`p-4 flex-1 min-w-0 ${contentClassName}`}>
        <div
          className={`flex items-start justify-between gap-3 ${headerClassName}`}
        >
          <div className="min-w-0">
            <div className="font-bold text-lg leading-snug truncate">
              {title}
            </div>
            {subtitle ? (
              <div className="text-sm text-foreground/80 truncate">
                {subtitle}
              </div>
            ) : null}
          </div>
          {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
        </div>

        {description ? (
          <div className="mt-2 text-sm text-foreground/80 line-clamp-3">
            {description}
          </div>
        ) : null}

        {meta ? (
          <div className="mt-3 text-xs text-foreground/70">{meta}</div>
        ) : null}

        {footer ? (
          <div className={`mt-4 flex items-center gap-2 ${footerClassName}`}>
            {footer}
          </div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={rootClassName}>
        {body}
      </a>
    );
  }

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        className={rootClassName}
      >
        {body}
      </div>
    );
  }

  return <div className={rootClassName}>{body}</div>;
}
