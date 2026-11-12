import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CtaVariant = "solid" | "ink" | "outline" | "outline-paper" | "paper" | "text";

interface CtaProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  variant?: CtaVariant;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

const baseClass =
  "group/cta inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 text-[0.9375rem] font-medium tracking-[0.01em] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const variantClass: Record<CtaVariant, string> = {
  solid: "bg-blood text-paper md:hover:bg-blood-deep",
  ink: "bg-ink text-paper md:hover:bg-ink/85",
  outline: "border border-ink/20 text-ink md:hover:border-ink md:hover:bg-ink md:hover:text-paper",
  "outline-paper":
    "border border-paper/40 text-paper md:hover:border-paper md:hover:bg-paper md:hover:text-ink focus-visible:ring-paper focus-visible:ring-offset-ink",
  paper:
    "bg-paper text-ink md:hover:bg-linen focus-visible:ring-paper focus-visible:ring-offset-ink",
  text: "min-h-11 rounded-none px-0 text-ink underline decoration-ink/25 underline-offset-[6px] md:hover:decoration-ink",
};

export function Cta({
  href,
  variant = "solid",
  children,
  className,
  external,
  ...props
}: CtaProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const isAnchor = href.startsWith("#");

  const classes = cn(baseClass, variantClass[variant], className);

  if (isExternal || isAnchor) {
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...(props as ComponentProps<"a">)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "size-3.5 transition-transform duration-300 md:group-hover/cta:translate-x-0.5",
        className
      )}
    >
      <path d="M2 8h11.5M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export function ExternalArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "size-3.5 transition-transform duration-300 md:group-hover/cta:-translate-y-0.5 md:group-hover/cta:translate-x-0.5",
        className
      )}
    >
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  );
}
