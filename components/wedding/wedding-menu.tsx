import { weddingContent } from "@/lib/wedding-content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const { menu } = weddingContent;

export function WeddingMenu() {
  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="scroll-mt-20 px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="menu-heading"
            title={menu.title}
            lead={menu.lead}
            align="center"
          />
        </Reveal>

        <div className="mt-14 flex flex-col gap-16 md:mt-20 md:gap-20">
          {menu.courses.map((course, index) => (
            <Reveal key={course.title} delay={0.08 * (index + 1)}>
              <h3 className="wedding-display text-center text-[2rem] text-ink md:text-[2.5rem]">
                {course.title}
              </h3>
              <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {course.items.map((item) => (
                  <li key={item.name} className="py-6 md:py-7">
                    <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-10">
                      <div className="min-w-0">
                        <p className="text-[1.0625rem] leading-snug text-ink">
                          {item.name}
                        </p>
                        {"detail" in item ? (
                          <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/60">
                            {item.detail}
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm text-ink/45 md:text-right">
                        {item.note}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
