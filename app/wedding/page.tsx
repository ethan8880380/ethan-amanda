import type { Metadata } from "next";
import { weddingContent } from "@/lib/wedding-content";
import { WeddingNav } from "@/components/wedding/wedding-nav";
import { WeddingHero } from "@/components/wedding/wedding-hero";
import { WeddingInvitation } from "@/components/wedding/wedding-invitation";
import { WeddingStory } from "@/components/wedding/wedding-story";
import { WeddingSchedule } from "@/components/wedding/wedding-schedule";
import { WeddingVenues } from "@/components/wedding/wedding-venues";
import { WeddingGallery } from "@/components/wedding/wedding-gallery";
import { WeddingTravel } from "@/components/wedding/wedding-travel";
import { WeddingRegistry } from "@/components/wedding/wedding-registry";
import { WeddingFaq } from "@/components/wedding/wedding-faq";
import { WeddingRsvp } from "@/components/wedding/wedding-rsvp";
import { WeddingFooter } from "@/components/wedding/wedding-footer";

export const metadata: Metadata = {
  title: `${weddingContent.couple.short} | Wedding`,
  description: `${weddingContent.hero.subhead} ${weddingContent.date.display} — ${weddingContent.saveTheDate.cityHint}, Washington.`,
  openGraph: {
    title: `${weddingContent.couple.short} | Wedding`,
    description: weddingContent.hero.subhead,
    images: [{ url: weddingContent.hero.image, width: 1500, height: 2100 }],
  },
};

export default function WeddingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-blood focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:uppercase focus:tracking-[0.18em] focus:text-paper"
      >
        Skip to content
      </a>

      <WeddingNav />

      <main id="main">
        <WeddingHero />
        <WeddingInvitation />
        <WeddingStory />
        <WeddingSchedule />
        <WeddingVenues />
        <WeddingGallery />
        <WeddingTravel />
        <WeddingRegistry />
        <WeddingFaq />
        <WeddingRsvp />
      </main>

      <WeddingFooter />
    </>
  );
}
