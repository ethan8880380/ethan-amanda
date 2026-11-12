import Link from "next/link";
import { weddingContent } from "@/lib/wedding-content";
import { ArrowIcon } from "./cta";

const { couple, date, footer } = weddingContent;

export function WeddingFooter() {
  return (
    <footer className="bg-ink px-6 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-24 text-paper md:px-10 md:pb-12 md:pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <p className="font-wedding-serif text-xl text-paper/60 md:text-2xl">
          {footer.note}
        </p>
        <p className="wedding-display mt-4 text-[clamp(3.25rem,14vw,5.5rem)] font-light leading-[0.95] md:text-[clamp(5rem,8vw,8.5rem)]">
          {couple.partnerOne}{" "}
          <span className="italic text-paper/50">&amp;</span>{" "}
          {couple.partnerTwo}
        </p>
        <p className="mt-6 text-sm tracking-[0.04em] text-paper/60 md:text-[0.9375rem]">
          {date.display}
        </p>

        <div className="mt-20 flex w-full flex-col items-center gap-4 border-t border-paper/10 pt-8 text-sm text-paper/50 md:mt-28 md:flex-row md:justify-between">
          <p className="font-wedding-serif text-base italic">{footer.year}</p>
          <Link
            href="/engagement-party"
            className="group/cta inline-flex min-h-11 items-center gap-2 text-paper/80 underline decoration-paper/25 underline-offset-[6px] transition-colors md:hover:text-paper md:hover:decoration-paper outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Engagement party
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </footer>
  );
}
