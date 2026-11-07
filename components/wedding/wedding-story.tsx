import Image from "next/image";
import { weddingContent } from "@/lib/wedding-content";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { weddingPhotos } from "./wedding-photos";

const { story } = weddingContent;
const mainPhoto = weddingPhotos.stairsWide;
const detailPhoto = weddingPhotos.stairsPortrait;

export function WeddingStory() {
  const [firstParagraph, ...restParagraphs] = story.paragraphs;

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="wedding-hairline scroll-mt-16 border-t py-24 md:py-36"
    >
      <div className="mx-auto max-w-6xl px-6 lg:grid lg:grid-cols-12 lg:gap-x-16">
        {/* Heading appears above the image on mobile, beside it on desktop */}
        <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:self-end">
          <Reveal>
            <SectionHeading
              id="story-heading"
              title={story.title}
            />
          </Reveal>
        </div>

        {/* Photographs */}
        <div className="relative mt-12 lg:col-span-7 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <Reveal>
            <figure className="relative -mx-6 aspect-[4/5] overflow-hidden bg-ink/5 md:mx-0 lg:aspect-[5/6]">
              <Image
                src={mainPhoto.src}
                alt={mainPhoto.alt}
                fill
                quality={72}
                sizes="(min-width: 1024px) 55vw, 100vw"
                style={{ objectPosition: mainPhoto.focal }}
                className="object-cover"
              />
            </figure>
          </Reveal>

          <Reveal
            delay={0.15}
            className="absolute -bottom-10 right-0 hidden w-[42%] lg:block"
          >
            <figure className="relative aspect-[4/5] overflow-hidden border-[10px] border-paper bg-ink/5 shadow-[0_30px_60px_-30px_rgba(20,17,18,0.45)]">
              <Image
                src={detailPhoto.src}
                alt={detailPhoto.alt}
                fill
                quality={70}
                sizes="22vw"
                style={{ objectPosition: detailPhoto.focal }}
                className="object-cover"
              />
            </figure>
          </Reveal>
        </div>

        {/* Copy */}
        <div className="mt-12 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-10">
          <Reveal>
            <div className="space-y-6 text-[1.0625rem] leading-[1.7] text-ink/80 md:text-lg">
              <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-wedding-serif first-letter:text-[4.25rem] first-letter:leading-[0.75] first-letter:text-blood">
                {firstParagraph}
              </p>
              {restParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-12 lg:hidden">
            <figure className="relative ml-auto aspect-[4/5] w-[70%] overflow-hidden bg-ink/5 sm:w-[55%]">
              <Image
                src={detailPhoto.src}
                alt={detailPhoto.alt}
                fill
                quality={70}
                sizes="(min-width: 640px) 45vw, 70vw"
                style={{ objectPosition: detailPhoto.focal }}
                className="object-cover"
              />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
