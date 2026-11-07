import Image from "next/image";
import { weddingContent } from "@/lib/wedding-content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const { faq } = weddingContent;

/**
 * Native <details> accordion — zero JS, keyboard accessible,
 * and works before hydration on slow connections.
 */
export function WeddingFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading id="faq-heading" title={faq.title} align="center" />
        </Reveal>

        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <div className="border-t border-ink/10">
            {faq.items.map((item) => (
              <details
                key={item.question}
                className="wedding-details group border-b border-ink/10"
              >
                <summary className="flex min-h-20 cursor-pointer select-none items-center justify-between gap-6 py-6 text-left font-wedding-serif text-[1.5rem] leading-snug text-ink transition-colors hover:text-blood outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blood md:text-[1.75rem]">
                  <span>{item.question}</span>
                  <span
                    aria-hidden
                    className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-[transform,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45 group-open:border-ink/40"
                  >
                    <span className="absolute h-3 w-px bg-current" />
                    <span className="absolute h-px w-3 bg-current" />
                  </span>
                </summary>
                <div className="pb-8 pr-14">
                  <p className="max-w-prose text-[1.0625rem] leading-[1.7] text-ink/65">
                    {item.answer}
                  </p>
                  {"images" in item ? (
                    <ul className="mt-8 grid gap-10">
                      {item.images.map((image) => (
                        <li key={image.src}>
                          <figure>
                            <figcaption className="text-sm tracking-[0.04em] text-ink/55">
                              {image.label}
                            </figcaption>
                            <div className="-ml-6 -mr-20 mt-3 md:mx-0">
                              <Image
                                src={image.src}
                                alt={image.alt}
                                width={1024}
                                height={682}
                                // The image optimizer fetches without the site-gate cookie.
                                unoptimized
                                sizes="(min-width: 768px) 42rem, 100vw"
                                className="h-auto w-full"
                              />
                            </div>
                          </figure>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
