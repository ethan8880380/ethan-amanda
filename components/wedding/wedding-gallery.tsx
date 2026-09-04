import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";
import { weddingPhotos, type WeddingPhotoKey } from "./wedding-photos";

interface GalleryFrame {
  photo: WeddingPhotoKey;
  /** Grid placement + vertical offset on tablet/desktop. */
  cell: string;
  /** Aspect ratio on tablet/desktop (mobile is always 5:7). */
  frame: string;
}

/**
 * Editorial sequence on a 12-column grid — varied crops and staggered
 * offsets keep it from reading as a uniform grid, while the index
 * numbers still run left-to-right.
 */
const frames: GalleryFrame[] = [
  { photo: "handOnFace", cell: "md:col-span-5", frame: "md:aspect-[4/5]" },
  { photo: "library", cell: "md:col-span-3 md:mt-24", frame: "md:aspect-[3/4]" },
  { photo: "ring", cell: "md:col-span-4 md:mt-10", frame: "md:aspect-square" },
  { photo: "stairsPortrait", cell: "md:col-span-4 md:mt-4", frame: "md:aspect-[4/5]" },
  { photo: "embrace", cell: "md:col-span-4 md:mt-20", frame: "md:aspect-[5/7]" },
  { photo: "arches", cell: "md:col-span-4", frame: "md:aspect-[4/5]" },
  {
    photo: "stairsWide",
    cell: "md:col-span-8 md:col-start-3 md:mt-8",
    frame: "md:aspect-[4/3]",
  },
];

export function WeddingGallery() {
  return (
    <section
      aria-label="Photographs"
      className="wedding-hairline overflow-hidden border-t py-24 md:py-32"
    >
      <Reveal className="mx-auto flex max-w-6xl items-end justify-between px-6">
        <p className="wedding-eyebrow flex items-center gap-3 text-blood">
          <span aria-hidden className="h-px w-6 bg-blood" />
          Gallery
        </p>
        <p
          aria-hidden
          className="wedding-eyebrow text-ink/40 md:hidden"
        >
          Swipe
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <ul
          className={cn(
            // Mobile: edge-to-edge snap strip, one-handed swipe
            "no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-6 px-6 pb-2",
            // Tablet & up: staggered editorial grid
            "md:mx-auto md:mt-12 md:grid md:max-w-6xl md:grid-cols-12 md:items-start md:gap-x-6 md:gap-y-12 md:overflow-visible md:pb-0 lg:gap-x-8"
          )}
        >
          {frames.map(({ photo, cell, frame }, index) => {
            const { src, alt, focal } = weddingPhotos[photo];
            return (
              <li
                key={photo}
                className={cn(
                  "w-[78vw] max-w-[24rem] shrink-0 snap-center md:w-auto md:max-w-none",
                  cell
                )}
              >
                <figure className="group relative">
                  <div
                    className={cn(
                      "relative aspect-[5/7] overflow-hidden bg-ink/5",
                      frame
                    )}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      quality={70}
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 78vw"
                      style={{ objectPosition: focal }}
                      className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption
                    aria-hidden
                    className="mt-3 flex items-center justify-between text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink/40"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span className="h-px w-8 bg-ink/15" />
                    <span>{String(frames.length).padStart(2, "0")}</span>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}
