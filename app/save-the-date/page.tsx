import type { Metadata } from "next";
import { SaveTheDateSite } from "@/components/save-the-date/save-the-date-site";
import { weddingContent } from "@/lib/wedding-content";

export const metadata: Metadata = {
  title: `Save the Date | ${weddingContent.couple.short}`,
  description: `${weddingContent.couple.short} are getting married — ${weddingContent.date.display}. Save the date.`,
};

export default function SaveTheDatePage() {
  return <SaveTheDateSite />;
}
