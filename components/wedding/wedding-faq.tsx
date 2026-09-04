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
      className="scroll-mt-16 px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="faq-heading"
            eyebrow={faq.eyebrow}
            title={faq.title}
            align="center"
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14 md:mt-16">
          <div className="wedding-hairline border-t">
            {faq.items.map((item) => (
              <details
                key={item.question}
                className="wedding-details wedding-hairline group border-b"
              >
                <summary className="flex min-h-16 cursor-pointer select-none items-center justify-between gap-6 py-5 text-left font-wedding-serif text-[1.375rem] leading-snug text-ink transition-colors hover:text-blood outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blood md:min-h-20 md:text-2xl [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span
                    aria-hidden
                    className="relative size-5 shrink-0 text-blood transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45"
                  >
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  </span>
                </summary>
                <div className="pb-7 pr-11 md:pb-8">
                  <p className="max-w-prose text-[1.0625rem] leading-[1.7] text-ink/70 md:text-lg">
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
