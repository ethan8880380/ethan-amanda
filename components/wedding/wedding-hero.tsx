import Image from "next/image";
import { weddingContent } from "@/lib/wedding-content";
import { weddingPhotos } from "./wedding-photos";

const { couple, date, hero, saveTheDate } = weddingContent;
const photo = weddingPhotos.embrace;

function riseDelay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

export function WeddingHero() {
  return (
    <section
      id="top"
      aria-label="Welcome"
      className="relative isolate min-h-[100svh] bg-ink md:grid md:h-[100svh] md:min-h-0 md:grid-cols-2 md:bg-paper md:pt-16"
    >
      {/* Photograph — full-bleed on mobile, right panel on desktop */}
      <div className="absolute inset-0 overflow-hidden md:relative md:col-start-2 md:row-start-1 md:inset-auto">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          fetchPriority="high"
          quality={72}
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ objectPosition: photo.focal }}
          className="animate-wedding-settle object-cover"
        />
        {/* Mobile legibility scrim */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/15 md:hidden"
        />
      </div>

      {/* Copy */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-24 text-paper md:col-start-1 md:row-start-1 md:min-h-0 md:justify-center md:px-12 md:pb-16 md:pt-8 md:text-ink lg:px-20">
        <p
          className="wedding-eyebrow animate-wedding-rise flex items-center gap-3 text-paper/75 md:text-blood"
          style={riseDelay(150)}
        >
          <span aria-hidden className="h-px w-6 bg-blood md:bg-blood" />
          {hero.eyebrow}
        </p>

        <h1
          className="animate-wedding-rise mt-6 font-wedding-serif text-[clamp(3.75rem,20vw,6.5rem)] leading-[0.88] tracking-[-0.02em] md:text-[clamp(4.5rem,8.2vw,9.5rem)]"
          style={riseDelay(300)}
        >
          <span className="block">{couple.partnerOne}</span>
          <span className="block">
            <span className="italic text-paper/80 md:text-blood">&amp;</span>{" "}
            {couple.partnerTwo}
          </span>
        </h1>

        <p
          className="animate-wedding-rise mt-7 max-w-[22rem] font-wedding-serif text-xl italic leading-snug text-paper/85 md:mt-9 md:max-w-md md:text-2xl md:text-ink/75 lg:text-[1.75rem]"
          style={riseDelay(450)}
        >
          {hero.subhead}
        </p>

        <div
          className="animate-wedding-rise mt-9 flex items-end justify-between gap-6 border-t border-paper/25 pt-5 md:mt-12 md:border-ink/15 md:pt-6"
          style={riseDelay(600)}
        >
          <dl className="text-[0.8125rem] leading-relaxed tracking-wide md:text-sm">
            <dt className="sr-only">Date</dt>
            <dd className="font-medium">{date.display}</dd>
            <dt className="sr-only">Location</dt>
            <dd className="text-paper/65 md:text-ink/55">
              {saveTheDate.cityHint}, Washington
            </dd>
          </dl>

          <a
            href="#rsvp"
            className="inline-flex h-12 shrink-0 items-center bg-blood px-6 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-blood-deep outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink md:h-12 md:focus-visible:ring-blood md:focus-visible:ring-offset-paper"
          >
            {hero.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
