import type { Metadata } from "next";
import { weddingContent } from "@/lib/wedding-content";
import { WeddingRegistryPage } from "@/components/wedding/wedding-registry-page";

export const metadata: Metadata = {
  title: `Registry | ${weddingContent.couple.short}`,
  description: weddingContent.registry.pageIntro,
  openGraph: {
    title: `Registry | ${weddingContent.couple.short}`,
    description: weddingContent.registry.intro,
  },
};

export default function RegistryRoute() {
  return (
    <main id="main">
      <WeddingRegistryPage />
    </main>
  );
}
