import { Instrument_Sans, Instrument_Serif } from "next/font/google";

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
      {children}
    </div>
  );
}
