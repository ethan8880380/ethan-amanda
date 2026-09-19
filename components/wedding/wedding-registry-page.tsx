import { weddingContent } from "@/lib/wedding-content";
import { Cta, ExternalArrowIcon } from "./cta";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const { registry } = weddingContent;

function featuredHref(item: { label: string; detail: string; url?: string }) {
  return item.url ?? registry.url;
}

export function WeddingRegistryPage() {
  return (
    <article className="min-h-[100svh] bg-paper pt-16">
      <header className="bg-ink px-6 py-20 text-paper md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              id="registry-page-heading"
              eyebrow={registry.eyebrow}
              title={registry.title}
              tone="paper"
            />
            <p className="mt-8 max-w-xl font-wedding-serif text-xl italic leading-snug text-paper/75 md:text-2xl">
              {registry.pageIntro}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="wedding-eyebrow text-blood">Where to start</p>
              <h2 className="mt-4 font-wedding-serif text-3xl leading-tight text-ink md:text-4xl">
                A few things we&rsquo;d love
              </h2>
              <p className="mt-6 max-w-md text-[1.0625rem] leading-[1.7] text-ink/70 md:text-lg">
                Each one opens Zola. The full list is there too, if you&rsquo;d
                rather browse.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 lg:col-span-7 lg:mt-0">
            <Reveal delay={0.1}>
              <ul className="wedding-hairline divide-y divide-ink/14 border-y">
                {registry.featured.map((item, index) => {
                  const href = featuredHref(item);
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={item.label}>
                      <a
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="group/cta -mx-3 flex items-start gap-5 px-3 py-6 outline-none transition-colors hover:bg-ink/[0.03] focus-visible:bg-ink/[0.03] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blood md:gap-8 md:py-7"
                      >
                        <span
                          aria-hidden
                          className="wedding-eyebrow mt-2 w-6 shrink-0 text-blood"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                          <span className="font-wedding-serif text-2xl leading-tight text-ink md:text-3xl">
                            {item.label}
                          </span>
                          <span className="text-[0.9375rem] leading-relaxed text-ink/60 md:text-base">
                            {item.detail}
                          </span>
                        </span>
                        <span className="mt-1.5 flex size-11 shrink-0 items-center justify-center border border-ink/20 text-ink transition-colors group-hover/cta:border-ink group-hover/cta:bg-ink group-hover/cta:text-paper">
                          <ExternalArrowIcon className="size-4" />
                          <span className="sr-only">
                            Open {item.label} on Zola
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.15} className="mx-auto mt-16 max-w-6xl md:mt-20">
          <Cta href={registry.url} variant="solid" className="min-h-14 px-8">
            {registry.cta}
            <ExternalArrowIcon />
          </Cta>
        </Reveal>
      </div>
    </article>
  );
}
