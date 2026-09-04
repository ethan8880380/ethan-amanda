import { weddingContent } from "@/lib/wedding-content";
import { ExternalArrowIcon } from "./cta";
import { Reveal } from "./reveal";

const { registry } = weddingContent;

export function WeddingRegistry() {
  return (
    <section
      id="registry"
      aria-labelledby="registry-heading"
      className="scroll-mt-16 bg-ink px-6 py-24 text-paper md:py-36"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
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
        </Reveal>

        <Reveal delay={0.1} className="mt-14 md:mt-16">
          <ul className="divide-y divide-paper/15 border-y border-paper/15">
            {registry.links.map((link) => {
              const isExternal = link.url.startsWith("http");
              return (
                <li key={link.label}>
                  <a
                    href={link.url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="group/cta flex min-h-16 items-center justify-between gap-6 py-5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-paper md:min-h-20"
                  >
                    <span className="font-wedding-serif text-2xl leading-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:translate-x-2 md:text-4xl">
                      {link.label}
                    </span>
                    <span className="flex size-11 shrink-0 items-center justify-center border border-paper/25 transition-colors group-hover/cta:border-blood group-hover/cta:bg-blood">
                      <ExternalArrowIcon className="size-4" />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
