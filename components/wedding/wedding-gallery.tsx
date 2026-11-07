import Image from "next/image";
import { Reveal } from "./reveal";
import { weddingPhotos, type WeddingPhotoKey } from "./wedding-photos";

/** The hero already shows the embrace, so the grid holds the other six. */
const photos: WeddingPhotoKey[] = [
  "handOnFace",
  "library",
  "ring",
  "stairsPortrait",
  "arches",
  "stairsWide",
];

export function WeddingGallery() {
  return (
    <section
      aria-label="Photographs"
      className="overflow-hidden py-24 md:px-10 md:py-32"
    >
      <Reveal>
        <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 md:mx-auto md:grid md:max-w-6xl md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {photos.map((key) => {
            const { src, alt, focal } = weddingPhotos[key];
            return (
              <li
                key={key}
                className="w-[72vw] max-w-[22rem] shrink-0 snap-center md:w-auto md:max-w-none"
              >
                <figure className="group relative aspect-[4/5] overflow-hidden bg-ink/5">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    quality={75}
                    sizes="(min-width: 768px) 33vw, 72vw"
                    style={{ objectPosition: focal }}
                    className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.03]"
                  />
                </figure>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
