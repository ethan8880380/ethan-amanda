import { Allura, Cormorant_Garamond } from "next/font/google";

export const seatingScript = Allura({
  weight: "400",
  subsets: ["latin"],
});

export const seatingSerif = Cormorant_Garamond({
  weight: ["500", "600"],
  subsets: ["latin"],
});
