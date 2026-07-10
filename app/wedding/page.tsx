import type { Metadata } from "next";
import { WeddingSite } from "@/components/wedding/wedding-site";

export const metadata: Metadata = {
  title: "Ethan & Amanda | Wedding",
  description: "Join us as we celebrate our wedding",
};

export default function WeddingPage() {
  return <WeddingSite />;
}
