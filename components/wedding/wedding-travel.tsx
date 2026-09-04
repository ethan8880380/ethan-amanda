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
      className="wedding-hairline scroll-mt-16 border-t px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:gap-x-16">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionHeading
              id="travel-heading"
              eyebrow={travel.eyebrow}
              title={travel.title}
            />
            <p className="mt-7 max-w-md text-[1.0625rem] leading-[1.7] text-ink/75 md:text-lg">
              {travel.intro}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 lg:col-span-7 lg:mt-0">
          <Reveal delay={0.1}>
            <ul className="wedding-hairline divide-y border-y divide-ink/14">
              {travel.hotels.map((hotel, index) => (
                <li key={hotel.name}>
                  <a
                    href={hotel.url}
                    target={hotel.url.startsWith("http") ? "_blank" : undefined}
                    rel={
                      hotel.url.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="group/cta -mx-3 flex items-start gap-5 px-3 py-6 transition-colors hover:bg-ink/[0.03] outline-none focus-visible:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blood md:gap-8 md:py-7"
                  >
                    <span
                      aria-hidden
                      className="wedding-eyebrow mt-2 w-6 shrink-0 text-blood"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="font-wedding-serif text-2xl leading-tight text-ink md:text-3xl">
                        {hotel.name}
                      </span>
                      <span className="text-[0.9375rem] leading-relaxed text-ink/60 md:text-base">
                        {hotel.detail}
                      </span>
                    </span>
                    <span className="mt-1.5 flex size-11 shrink-0 items-center justify-center border border-ink/20 text-ink transition-colors group-hover/cta:border-ink group-hover/cta:bg-ink group-hover/cta:text-paper">
                      <ExternalArrowIcon className="size-4" />
                      <span className="sr-only">Open {hotel.name} website</span>
                    </span>
                  </a>
                </li>
              ))}

              <li className="flex items-start gap-5 py-6 md:gap-8 md:py-7">
                <span
                  aria-hidden
                  className="wedding-eyebrow mt-2 w-6 shrink-0 text-blood"
                >
                  {String(travel.hotels.length + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-wedding-serif text-2xl leading-tight text-ink md:text-3xl">
                    Parking
                  </h3>
                  <p className="text-[0.9375rem] leading-relaxed text-ink/60 md:text-base">
                    {travel.parking}
                  </p>
                </div>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
