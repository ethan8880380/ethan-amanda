import { weddingContent } from "@/lib/wedding-content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const { schedule, date } = weddingContent;

export function WeddingSchedule() {
  return (
    <section
      id="day"
      aria-labelledby="schedule-heading"
      className="scroll-mt-20 bg-ink px-6 py-24 text-paper md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="schedule-heading"
            title={schedule.title}
            lead={date.display}
            tone="paper"
            align="center"
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-12 md:mt-16">
          <ol className="divide-y divide-paper/10 border-y border-paper/10">
            {schedule.items.map((item) => {
              const isoTime = toIsoTime(item.time);
              return (
                <li
                  key={item.title}
                  className="grid grid-cols-[5.5rem_1fr] items-baseline gap-x-6 py-7 md:grid-cols-[9rem_1fr] md:gap-x-10 md:py-8"
                >
                  {isoTime ? (
                    <time
                      dateTime={isoTime}
                      className="font-wedding-serif text-xl italic text-paper/55 md:text-2xl"
                    >
                      {item.time.toLowerCase()}
                    </time>
                  ) : (
                    <p className="font-wedding-serif text-xl italic text-paper/55 md:text-2xl">
                      {item.time}
                    </p>
                  )}
                  <div>
                    <h3 className="wedding-display text-2xl md:text-[1.875rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-paper/60 md:text-base">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/** "3:30 PM" → "15:30" for <time dateTime>. Words like "After" return undefined. */
function toIsoTime(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}
