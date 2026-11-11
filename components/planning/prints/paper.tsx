import type { ReactNode, CSSProperties } from "react";
import { weddingContent } from "@/lib/wedding-content";
import { cn } from "@/lib/utils";

export function Paper({
  width,
  height,
  children,
  className,
  style,
}: {
  width: string;
  height: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <article
      className={cn(
        "print-sheet relative box-border overflow-hidden bg-paper text-ink shadow-[0_18px_50px_rgba(24,20,21,0.12)]",
        className,
      )}
      style={{ width, height, ...style }}
    >
      {children}
    </article>
  );
}

export function Monogram({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const { partnerOne, partnerTwo } = weddingContent.couple;

  return (
    <p
      className={cn(
        "font-wedding-serif leading-none tracking-[-0.04em] text-ink",
        className,
      )}
      style={style}
    >
      {partnerOne.slice(0, 1)}
      <span className="mx-[0.28em] text-[0.62em] text-blood">&</span>
      {partnerTwo.slice(0, 1)}
    </p>
  );
}

export function CropMarks() {
  const arm = "absolute h-3 w-3 border-ink/35";
  return (
    <>
      <span className={cn(arm, "-left-[7px] -top-[7px] border-l border-t")} />
      <span className={cn(arm, "-right-[7px] -top-[7px] border-r border-t")} />
      <span className={cn(arm, "-bottom-[7px] -left-[7px] border-b border-l")} />
      <span className={cn(arm, "-bottom-[7px] -right-[7px] border-r border-b")} />
    </>
  );
}

export function MountedCard({
  mode,
  children,
}: {
  mode: "letter" | "card";
  children: ReactNode;
}) {
  if (mode === "card") {
    return (
      <Paper width="5in" height="7in">
        {children}
      </Paper>
    );
  }

  return (
    <Paper
      width="8.5in"
      height="11in"
      className="flex items-center justify-center"
    >
      <div className="relative border border-ink/15" style={{ width: "5in", height: "7in" }}>
        <CropMarks />
        {children}
      </div>
    </Paper>
  );
}
