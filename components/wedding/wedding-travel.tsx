import { weddingContent } from "@/lib/wedding-content";
import { ExternalArrowIcon } from "./cta";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const { travel } = weddingContent;

export function WeddingTravel() {
  return (
    <section
      id="travel"
      aria-labelledby="travel-heading"
      className="scroll-mt-20 bg-linen px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="travel-heading"
            title={travel.title}
            lead={travel.intro}
            align="center"
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <ul className="grid gap-4">
            {travel.hotels.map((hotel) => (
              <li key={hotel.name}>
                <a
                  href={hotel.url}
                  target={hotel.url.startsWith("http") ? "_blank" : undefined}
                  rel={
                    hotel.url.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="group/cta flex items-center gap-6 rounded-[1.25rem] bg-paper p-7 shadow-[0_1px_2px_rgb(24_20_21/0.04),0_12px_32px_-12px_rgb(24_20_21/0.12)] transition-shadow duration-500 hover:shadow-[0_1px_2px_rgb(24_20_21/0.05),0_24px_48px_-16px_rgb(24_20_21/0.2)] outline-none focus-visible:ring-2 focus-visible:ring-blood md:p-10"
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="wedding-display text-[1.75rem] leading-tight text-ink md:text-[2.125rem]">
                      {hotel.name}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-ink/60 md:text-base">
                      {hotel.detail}
                    </span>
                  </span>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors duration-300 group-hover/cta:border-ink group-hover/cta:bg-ink group-hover/cta:text-paper">
                    <ExternalArrowIcon className="size-4" />
                    <span className="sr-only">Open {hotel.name} website</span>
                  </span>
                </a>
              </li>
            ))}

            {travel.parking ? (
              <li className="rounded-[1.25rem] bg-paper p-7 md:p-10">
                <h3 className="wedding-display text-[1.75rem] leading-tight text-ink md:text-[2.125rem]">
                  Parking
                </h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink/60 md:text-base">
                  {travel.parking}
                </p>
              </li>
            ) : null}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
