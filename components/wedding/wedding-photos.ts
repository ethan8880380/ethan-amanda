/**
 * Presentation metadata for the black-and-white photography.
 * All source files are 1500 × 2100 (5:7 portrait).
 */

export interface WeddingPhoto {
  src: string;
  alt: string;
  /** CSS object-position used when the frame crops the image. */
  focal: string;
}

export const weddingPhotos = {
  stairsPortrait: {
    src: "/wedding/wedding-01.png",
    alt: "A close portrait of Amanda and Ethan seated on stone steps, her hand resting in his.",
    focal: "50% 30%",
  },
  stairsWide: {
    src: "/wedding/wedding-02.png",
    alt: "Ethan and Amanda sitting together on the steps, turned toward one another in a shaft of light.",
    focal: "50% 40%",
  },
  handOnFace: {
    src: "/wedding/wedding-03.png",
    alt: "Amanda smiling as she holds Ethan's face in her hands, soft lights glowing behind them.",
    focal: "50% 35%",
  },
  arches: {
    src: "/wedding/wedding-04.png",
    alt: "The stained-glass arches of the church glowing softly, seen from below.",
    focal: "50% 45%",
  },
  library: {
    src: "/wedding/wedding-05.png",
    alt: "Amanda laughing between the shelves of a library.",
    focal: "50% 60%",
  },
  embrace: {
    src: "/wedding/wedding-06.png",
    alt: "Ethan and Amanda embracing beneath an arched church window, lit from behind.",
    focal: "50% 30%",
  },
  ring: {
    src: "/wedding/wedding-07.png",
    alt: "Amanda's hand, wearing her engagement ring, resting on Ethan's wrist.",
    focal: "50% 40%",
  },
} as const satisfies Record<string, WeddingPhoto>;

export type WeddingPhotoKey = keyof typeof weddingPhotos;
