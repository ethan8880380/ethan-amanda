import { weddingContent } from "@/lib/wedding-content";
import { Cta, ExternalArrowIcon } from "./cta";
import { Reveal } from "./reveal";

const { venue } = weddingContent;

interface VenueBlockProps {
  label: string;
  name: string;
  address: string;
  city: string;
  mapUrl: string;
  notes: string;
  delay?: number;
}

function VenueBlock({
  label,
  name,
  address,
  city,
  mapUrl,
  notes,
  delay = 0,
}: VenueBlockProps) {
  return (
    <Reveal delay={delay} className="flex flex-col">
      <p className="wedding-eyebrow flex items-center gap-3 text-blood">
        <span aria-hidden className="h-px w-6 bg-blood" />
        {label}
      </p>
      <h3 className="mt-5 font-wedding-serif text-[2.25rem] leading-[0.95] tracking-[-0.01em] text-ink md:text-5xl">
        {name}
      </h3>
      <address className="mt-4 text-base not-italic leading-relaxed text-ink/60">
        {address && <span className="block">{address}</span>}
        <span className="block">{city}</span>
      </address>
      <p className="mt-5 max-w-prose text-[0.9375rem] leading-relaxed text-ink/75 md:text-base">
        {notes}
      </p>
      <div className="mt-8">
        <Cta href={mapUrl} variant="outline">
          View map
          <ExternalArrowIcon />
        </Cta>
      </div>
    </Reveal>
  );
}

export function WeddingVenues() {
  return (
    <section
      aria-label="Ceremony and reception venues"
      className="px-6 py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-5xl gap-16 md:grid-cols-2 md:gap-12 lg:gap-20">
        <VenueBlock label="Ceremony" {...venue.ceremony} />
        <VenueBlock label="Reception" {...venue.reception} delay={0.1} />
      </div>
    </section>
  );
}
