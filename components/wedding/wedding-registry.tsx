import { weddingContent } from "@/lib/wedding-content";
import { ArrowIcon, Cta } from "./cta";
import { Reveal } from "./reveal";

const { registry } = weddingContent;

export function WeddingRegistry() {
  return (
    <section
      id="registry"
      aria-labelledby="registry-heading"
      className="scroll-mt-16 bg-ink px-6 py-24 text-paper md:py-36"
    >
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="wedding-eyebrow inline-flex items-center gap-3 text-paper/60">
            <span aria-hidden className="h-px w-6 bg-blood" />
            {registry.eyebrow}
            <span aria-hidden className="h-px w-6 bg-blood" />
          </p>
          <h2
            id="registry-heading"
            className="mt-6 font-wedding-serif text-[2.75rem] leading-[0.95] sm:text-5xl md:text-6xl"
          >
            {registry.title}
          </h2>
          <p className="mx-auto mt-8 max-w-xl font-wedding-serif text-xl italic leading-snug text-paper/75 md:text-2xl">
            {registry.intro}
          </p>
          <p className="mx-auto mt-6 max-w-md text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-paper/45">
            {registry.featured.map((item) => item.label).join(" · ")}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Cta
            href="/wedding/registry"
            variant="outline-paper"
            className="min-h-14 px-8"
          >
            {registry.teaserCta}
            <ArrowIcon />
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
