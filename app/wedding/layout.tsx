import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { WeddingNav } from "@/components/wedding/wedding-nav";
import { WeddingFooter } from "@/components/wedding/wedding-footer";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-wedding-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-wedding-sans",
  display: "swap",
});

export default function WeddingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`wedding-root ${instrumentSerif.variable} ${instrumentSans.variable} font-wedding-sans bg-paper text-ink antialiased`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-blood focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:uppercase focus:tracking-[0.18em] focus:text-paper"
      >
        Skip to content
      </a>

      <WeddingNav />
      {children}
      <WeddingFooter />
    </div>
  );
}
