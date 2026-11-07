import { weddingContent } from "@/lib/wedding-content";
import { Cta, ExternalArrowIcon } from "./cta";
import { RegistryRsvpGate } from "./registry-rsvp-gate";
import { Reveal } from "./reveal";

const { registry } = weddingContent;

function featuredHref(item: { label: string; detail: string; url?: string }) {
  return item.url ?? registry.url;
}

export function WeddingRegistryPage() {
  return (
    <article className="min-h-[100svh] bg-paper pt-20">
      <header className="px-6 pb-16 pt-20 md:pb-20 md:pt-28">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h1
            id="registry-page-heading"
            className="wedding-display text-[3.25rem] sm:text-6xl md:text-[4.5rem]"
          >
            {registry.title}
          </h1>
          <p className="mt-7 font-wedding-serif text-[1.5rem] italic leading-snug text-balance text-ink/70 md:text-[1.875rem]">
            {registry.pageIntro}
          </p>
        </Reveal>
      </header>

      <div className="bg-linen px-6 py-20 md:px-10 md:py-28">
        <RegistryRsvpGate>
          <div className="mx-auto max-w-6xl">
            <Reveal className="flex flex-col items-center text-center">
              <h2 className="wedding-display text-4xl md:text-5xl">
                A few things we&rsquo;d love
              </h2>
              <p className="mt-5 max-w-md text-[1.0625rem] leading-[1.7] text-ink/65">
                Each one opens Zola. The full list is there too, if you&rsquo;d
                rather browse.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-14">
              <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
                {registry.featured.map((item) => {
                  const href = featuredHref(item);
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={item.label}>
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="group/cta flex h-full flex-col rounded-[1.25rem] bg-paper p-8 shadow-[0_1px_2px_rgb(24_20_21/0.04),0_12px_32px_-12px_rgb(24_20_21/0.12)] outline-none transition-shadow duration-500 hover:shadow-[0_1px_2px_rgb(24_20_21/0.05),0_24px_48px_-16px_rgb(24_20_21/0.2)] focus-visible:ring-2 focus-visible:ring-blood md:p-10"
                      >
                        <span className="wedding-display text-[2rem] text-ink md:text-[2.375rem]">
                          {item.label}
                        </span>
                        <span className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink/60 md:text-base">
                          {item.detail}
                        </span>
                        <span className="mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-medium text-ink">
                          Open on Zola
                          <ExternalArrowIcon />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className="mt-14 flex justify-center md:mt-16">
              <Cta href={registry.url} variant="solid">
                {registry.cta}
                <ExternalArrowIcon />
              </Cta>
            </Reveal>
          </div>
        </RegistryRsvpGate>
      </div>
    </article>
  );
}
