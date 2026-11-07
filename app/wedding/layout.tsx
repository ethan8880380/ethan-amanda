import { WeddingNav } from "@/components/wedding/wedding-nav";
import { WeddingFooter } from "@/components/wedding/wedding-footer";
import { weddingFontVariables } from "@/lib/wedding-fonts";

export default function WeddingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`wedding-root ${weddingFontVariables} font-wedding-sans bg-paper text-ink antialiased`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-paper"
      >
        Skip to content
      </a>

      <WeddingNav />
      {children}
      <WeddingFooter />
    </div>
  );
}
