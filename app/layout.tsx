import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistSerif } from "geist/font/serif";
import { Manrope, Syne } from "next/font/google";
import { hasWeddingRsvpCookie } from "@/app/wedding/actions";
import { WeddingRsvpCookieProvider } from "@/hooks/use-wedding-rsvp-session";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Ethan & Amanda | Wedding",
  description: "Join us as we celebrate our wedding",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasRsvp = await hasWeddingRsvpCookie();

  return (
    <html
      lang="en"
      className={`${syne.variable} ${manrope.variable} ${GeistSans.variable} ${GeistSerif.variable}`}
    >
      <body className="antialiased font-sans">
        <WeddingRsvpCookieProvider hasRsvp={hasRsvp}>
          {children}
        </WeddingRsvpCookieProvider>
      </body>
    </html>
  );
}
