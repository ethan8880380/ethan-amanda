import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  id?: string;
  align?: "left" | "center";
  tone?: "ink" | "paper";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  id,
  align = "left",
  tone = "ink",
  className,
}: SectionHeadingProps) {
  const isPaper = tone === "paper";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <p
        className={cn(
          "wedding-eyebrow flex items-center gap-3",
          isPaper ? "text-paper/70" : "text-blood"
        )}
      >
        <span
          aria-hidden
          className={cn("h-px w-6", isPaper ? "bg-paper/50" : "bg-blood")}
        />
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cn(
          "font-wedding-serif text-[2.75rem] leading-[0.95] tracking-[-0.01em] text-balance sm:text-5xl md:text-6xl",
          isPaper ? "text-paper" : "text-ink"
        )}
      >
        {title}
      </h2>
    </div>
  );
}
