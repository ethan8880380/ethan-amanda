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

export function WeddingVenues() {
  return (
    <section
      aria-label="Ceremony and reception venues"
      className="px-6 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[1fr_auto_1fr] md:gap-0">
        <VenueBlock label="Ceremony" {...venue.ceremony} />
        <div aria-hidden className="hidden w-px bg-ink/10 md:block" />
        <VenueBlock label="Reception" {...venue.reception} delay={0.1} />
      </div>
    </section>
  );
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
    <Reveal
      delay={delay}
      className="flex flex-col items-center text-center md:px-10 lg:px-16"
    >
      <h3 className="font-wedding-serif text-xl text-blood md:text-2xl">
        {label}
      </h3>
      <p className="wedding-display mt-3 text-[2.375rem] leading-[1.05] text-balance text-ink md:text-5xl">
        {name}
      </p>
      <address className="mt-5 text-[0.9375rem] not-italic leading-relaxed text-ink/55">
        {address && <span className="block">{address}</span>}
        <span className="block">{city}</span>
      </address>
      <p className="mt-5 max-w-xs flex-1 text-[0.9375rem] leading-relaxed text-ink/70 md:text-base">
        {notes}
      </p>
      <Cta href={mapUrl} variant="text" className="mt-6">
        View map
        <ExternalArrowIcon />
      </Cta>
    </Reveal>
  );
}
