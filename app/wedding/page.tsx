import type { Metadata } from "next";
import { weddingContent } from "@/lib/wedding-content";
import { WeddingHero } from "@/components/wedding/wedding-hero";
import { WeddingSchedule } from "@/components/wedding/wedding-schedule";
import { WeddingMenu } from "@/components/wedding/wedding-menu";
import { WeddingVenues } from "@/components/wedding/wedding-venues";
import { WeddingGallery } from "@/components/wedding/wedding-gallery";
import { WeddingTravel } from "@/components/wedding/wedding-travel";
import { WeddingRegistry } from "@/components/wedding/wedding-registry";
import { WeddingFaq } from "@/components/wedding/wedding-faq";
import { getWebsiteRsvp } from "@/app/wedding/actions";
import { WeddingRsvp } from "@/components/wedding/wedding-rsvp";

export const metadata: Metadata = {
  title: `${weddingContent.couple.short} | Wedding`,
  description: `${weddingContent.hero.subhead} ${weddingContent.date.display} — ${weddingContent.saveTheDate.cityHint}, Washington.`,
  openGraph: {
    title: `${weddingContent.couple.short} | Wedding`,
    description: weddingContent.hero.subhead,
    images: [{ url: weddingContent.hero.image, width: 1500, height: 2100 }],
  },
};

export default async function WeddingPage() {
  const existingRsvp = await getWebsiteRsvp();

  return (
    <main id="main">
      <WeddingHero />
      <WeddingVenues />
      <WeddingSchedule />
      <WeddingMenu />
      <WeddingGallery />
      <WeddingTravel />
      <WeddingRegistry />
      <WeddingFaq />
      <WeddingRsvp initialRsvp={existingRsvp} />
    </main>
  );
}
