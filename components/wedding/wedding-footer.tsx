import Link from "next/link";
import { weddingContent } from "@/lib/wedding-content";
import { ArrowIcon } from "./cta";

const { couple, date, footer, saveTheDate } = weddingContent;

export function WeddingFooter() {
  return (
    <footer className="bg-blood px-6 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-20 text-paper md:pb-16 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <p className="wedding-eyebrow text-paper/70">{footer.note}</p>
        <p className="mt-5 font-wedding-serif text-[clamp(3.25rem,15vw,6rem)] leading-[0.88] tracking-[-0.02em] md:text-[clamp(5rem,9vw,10rem)]">
          {couple.partnerOne} <span className="italic text-paper/70">&amp;</span>{" "}
          {couple.partnerTwo}
        </p>

        <div className="mt-14 flex flex-col gap-6 border-t border-paper/25 pt-6 text-[0.8125rem] tracking-wide text-paper/80 md:mt-20 md:flex-row md:items-center md:justify-between">
          <p>
            {date.display}
            <span className="mx-2 text-paper/40">·</span>
            {saveTheDate.cityHint}
          </p>
          <Link
            href="/engagement-party"
            className="group/cta inline-flex min-h-11 items-center gap-2 self-start font-medium uppercase tracking-[0.18em] text-paper underline-offset-[6px] hover:underline outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-blood md:self-auto"
          >
            Engagement party
            <ArrowIcon />
          </Link>
          <p className="font-wedding-serif text-base italic text-paper/70">
            {footer.year}
          </p>
        </div>
      </div>
    </footer>
  );
}
