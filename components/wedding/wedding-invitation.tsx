import { weddingContent } from "@/lib/wedding-content";
import { Reveal } from "./reveal";

const { date } = weddingContent;

/**
 * The date, immediately after the hero. Venue names and addresses
 * live in the venue section so the location is stated once.
 */
export function WeddingInvitation() {
  const [weekday, monthDay, year] = splitDate(date.display);

  return (
    <section
      aria-labelledby="invitation-heading"
      className="relative overflow-hidden px-6 py-24 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 id="invitation-heading" className="sr-only">
            {date.display}
          </h2>
          <p
            aria-hidden
            className="font-wedding-serif leading-[0.86] tracking-[-0.025em] text-ink"
          >
            <span className="block text-[clamp(1.25rem,5vw,2rem)] italic text-ink/60">
              {weekday}
            </span>
            <span className="mt-2 block text-[clamp(3.5rem,17vw,7rem)] md:text-[clamp(5rem,11vw,12rem)]">
              {monthDay}
            </span>
            <span className="block text-[clamp(3.5rem,17vw,7rem)] text-blood md:text-[clamp(5rem,11vw,12rem)]">
              {year}
            </span>
          </p>
          <p className="mt-6 flex items-center gap-3 text-sm tracking-wide text-ink/55 md:mt-8 md:text-base">
            <span aria-hidden className="h-px w-6 bg-ink/30" />
            {date.time}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 md:mt-14">
          <a
            href="/wedding/calendar"
            className="group/cta inline-flex min-h-11 items-center gap-3 text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-ink underline-offset-[6px] transition-colors md:hover:text-blood md:hover:underline outline-none focus-visible:ring-2 focus-visible:ring-blood focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5 transition-transform duration-300 md:group-hover/cta:translate-y-0.5"
            >
              <path d="M8 2v9M4 7.5 8 11.5l4-4M2.5 13.5h11" />
            </svg>
            Add to calendar
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/** "Saturday, January 23, 2027" → ["Saturday", "January 23", "2027"] */
function splitDate(display: string): [string, string, string] {
  const match = display.match(/^(\w+),\s+(.+?),\s+(\d{4})$/);
  if (!match) return ["", display, ""];
  return [match[1], match[2], match[3]];
}
