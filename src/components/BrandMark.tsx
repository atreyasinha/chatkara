"use client";

import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  size = "md",
  href,
}: {
  size?: "sm" | "md" | "lg";
  href?: string;
}) {
  const dims = { sm: 48, md: 72, lg: 112 }[size];
  const content = (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="ChatKara"
        width={dims}
        height={dims}
        className="rounded-full object-cover"
        priority
      />
      {size !== "sm" && (
        <div className="leading-tight">
          <p className="font-display text-2xl tracking-wide text-gold">
            चट<span className="flame-text">Kara</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold-soft">
            Flavours of India
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }
  return content;
}
