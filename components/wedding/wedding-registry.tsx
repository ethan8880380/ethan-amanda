import { weddingContent } from "@/lib/wedding-content";
import { ArrowIcon, Cta } from "./cta";
import { RegistryRsvpGate } from "./registry-rsvp-gate";
import { Reveal } from "./reveal";

const { registry } = weddingContent;

export function WeddingRegistry() {
  return (
    <section
      id="registry"
      aria-labelledby="registry-heading"
      className="scroll-mt-20 bg-blood px-6 py-24 text-paper md:px-10 md:py-32"
    >
      <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2
          id="registry-heading"
          className="wedding-display text-[2.75rem] sm:text-5xl md:text-[3.75rem]"
        >
          {registry.title}
        </h2>
        <p className="mt-7 font-wedding-serif text-[1.5rem] italic leading-snug text-balance text-paper/85 md:text-[1.875rem]">
          {registry.intro}
        </p>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {registry.featured.map((item) => (
            <li
              key={item.label}
              className="rounded-full border border-paper/25 px-4 py-1.5 text-sm text-paper/80"
            >
              {item.label}
            </li>
          ))}
        </ul>
        <RegistryRsvpGate>
          <Cta
            href="/wedding/registry"
            variant="paper"
            className="mt-12 focus-visible:ring-offset-blood"
          >
            {registry.teaserCta}
            <ArrowIcon />
          </Cta>
        </RegistryRsvpGate>
      </Reveal>
    </section>
  );
}
