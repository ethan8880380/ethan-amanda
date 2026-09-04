import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CtaVariant = "solid" | "outline" | "outline-paper" | "text";

interface CtaProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  variant?: CtaVariant;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

const baseClass =
  "group/cta inline-flex min-h-12 items-center justify-center gap-3 px-6 text-[0.8125rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const variantClass: Record<CtaVariant, string> = {
  solid: "bg-blood text-paper hover:bg-blood-deep",
  outline:
    "border border-ink/80 text-ink hover:bg-ink hover:text-paper",
  "outline-paper":
    "border border-paper/70 text-paper hover:bg-paper hover:text-ink focus-visible:ring-paper focus-visible:ring-offset-ink",
  text: "min-h-11 px-0 text-blood underline-offset-[6px] hover:underline",
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
        "size-3.5 transition-transform duration-300 group-hover/cta:translate-x-0.5",
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
        "size-3.5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5",
        className
      )}
    >
      <path d="M4 12 12 4M5.5 4H12v6.5" />
    </svg>
  );
}
