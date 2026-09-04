import Image from "next/image";
import { weddingContent } from "@/lib/wedding-content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { weddingPhotos } from "./wedding-photos";

const { schedule } = weddingContent;
const photo = weddingPhotos.arches;

export function WeddingSchedule() {
  return (
    <section
      id="day"
      aria-labelledby="schedule-heading"
      className="scroll-mt-16 bg-blood text-paper"
    >
      {/* Red duotone: black-and-white photograph multiplied onto blood red */}
      <div className="relative h-[70svh] max-h-[640px] min-h-[320px] overflow-hidden md:h-[60vh]">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          quality={65}
          sizes="100vw"
          style={{ objectPosition: photo.focal }}
          className="object-cover opacity-95 mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-blood to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-blood/60 to-transparent"
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-28 pt-4 md:pb-36 md:pt-10">
        <Reveal>
          <SectionHeading
            id="schedule-heading"
            eyebrow={schedule.eyebrow}
            title={schedule.title}
            tone="paper"
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14 md:mt-20">
          <ol className="divide-y divide-paper/20 border-y border-paper/20">
            {schedule.items.map((item) => {
              const [clock, meridiem] = splitTime(item.time);
              return (
                <li
                  key={item.time}
                  className="grid grid-cols-[5.5rem_1fr] gap-x-5 py-7 sm:grid-cols-[8rem_1fr] md:grid-cols-[12rem_1fr] md:gap-x-10 md:py-9"
                >
                  <time
                    dateTime={toIsoTime(item.time)}
                    className="font-wedding-serif text-[1.75rem] leading-none tracking-tight md:text-4xl"
                  >
                    {clock}
                    {meridiem && (
                      <span className="ml-1 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-paper/70 md:ml-1.5 md:text-xs">
                        {meridiem}
                      </span>
                    )}
                  </time>
                  <div>
                    <h3 className="font-wedding-serif text-2xl leading-tight md:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-paper/70 md:text-base">
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

/** "3:30 PM" → ["3:30", "PM"] */
function splitTime(time: string): [string, string | undefined] {
  const [clock, meridiem] = time.split(" ");
  return [clock, meridiem];
}

/** "3:30 PM" → "15:30" for <time dateTime>. */
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
