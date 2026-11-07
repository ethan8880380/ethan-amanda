import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  id?: string;
  /** Optional supporting line set beneath the title. */
  lead?: ReactNode;
  align?: "left" | "center";
  tone?: "ink" | "paper";
  className?: string;
}

export function SectionHeading({
  title,
  id,
  lead,
  align = "left",
  tone = "ink",
  className,
}: SectionHeadingProps) {
  const isPaper = tone === "paper";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <h2
        id={id}
        className={cn(
          "wedding-display text-[2.75rem] leading-[1.02] text-balance sm:text-5xl md:text-[3.75rem]",
          isPaper ? "text-paper" : "text-ink"
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "max-w-lg text-[1.0625rem] leading-[1.7] text-pretty",
            isPaper ? "text-paper/70" : "text-ink/65"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
