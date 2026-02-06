import type { Metadata } from "next";
import { Manrope, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const adelia = localFont({
  src: "../fonts/adelia.otf",
  display: "swap",
  variable: "--font-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const pinyonScript = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "Ethan & Amanda | Engagement Party",
  description: "Join us in celebrating our engagement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${adelia.variable} ${manrope.variable} ${pinyonScript.variable}`}>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
