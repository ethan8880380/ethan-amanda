import Image from "next/image";
import { weddingContent } from "@/lib/wedding-content";
import { weddingPhotos } from "./wedding-photos";

const { couple, date, hero } = weddingContent;
const photo = weddingPhotos.embrace;

function riseDelay(ms: number) {
  return { animationDelay: `${ms}ms` };
}

export function WeddingHero() {
  return (
    <section
      id="top"
      aria-label="Welcome"
      className="relative isolate -mt-[env(safe-area-inset-top)] min-h-[calc(100lvh+env(safe-area-inset-top))] bg-ink pt-[env(safe-area-inset-top)] md:mt-0 md:grid md:h-[100svh] md:min-h-[44rem] md:grid-cols-[minmax(0,36rem)_minmax(0,36rem)] md:items-center md:justify-center md:bg-paper md:px-10 md:pt-20"
    >
      {/* Photograph — full-bleed on mobile, arched portrait on desktop */}
      <div className="absolute inset-0 md:relative md:inset-auto md:col-start-2 md:row-start-1 md:flex md:h-full md:items-center md:justify-end md:py-12">
        <div className="relative size-full overflow-hidden md:aspect-[4/5] md:max-h-[52rem] md:w-auto md:max-w-full md:rounded-t-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            fetchPriority="high"
            quality={75}
            sizes="(min-width: 768px) 45vw, 100vw"
            style={{ objectPosition: photo.focal }}
            className="animate-wedding-settle object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10 md:hidden"
          />
        </div>
      </div>

      {/* Copy */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-end px-6 pb-[calc(env(safe-area-inset-bottom)+3rem)] pt-24 text-center text-paper md:col-start-1 md:row-start-1 md:min-h-0 md:justify-center md:p-0 md:text-ink">
        <h1
          className="animate-wedding-rise wedding-display text-[clamp(3.75rem,17vw,5.5rem)] font-light leading-[0.92] md:text-[clamp(4.5rem,7.5vw,8rem)]"
          style={riseDelay(150)}
        >
          <span className="block">{couple.partnerOne}</span>
          <span className="block">
            <span className="italic text-paper/70 md:text-blood">&amp;</span>{" "}
            {couple.partnerTwo}
          </span>
        </h1>

        <p
          className="animate-wedding-rise mt-6 max-w-xs text-base leading-relaxed text-paper/75 md:mt-8 md:max-w-sm md:text-[1.0625rem] md:text-ink/60"
          style={riseDelay(450)}
        >
          {`${hero.eyebrow} ${hero.subhead.charAt(0).toLowerCase()}${hero.subhead.slice(1)}`}
        </p>

        <div
          className="animate-wedding-rise mt-8 flex flex-col items-center gap-6 md:mt-10"
          style={riseDelay(600)}
        >
          <p className="flex items-center gap-4 text-sm tracking-[0.04em] text-paper/90 md:text-[0.9375rem] md:text-ink/80">
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
            {date.display}
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
          </p>
          <a
            href="#rsvp"
            className="inline-flex h-12 items-center rounded-full bg-paper px-9 text-[0.9375rem] font-medium tracking-[0.01em] text-ink transition-colors md:hover:bg-linen outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink md:bg-blood md:text-paper md:hover:bg-blood-deep md:focus-visible:ring-blood md:focus-visible:ring-offset-paper"
          >
            {hero.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
