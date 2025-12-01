import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { SkipLink } from "@/components/accessibility/skip-link";
import { LiveRegionProvider } from "@/components/accessibility/live-region";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'),
  title: {
    default: "AI Obituaries",
    template: "%s",
  },
  description: "A memorial to the ever-dying predictions of AI doom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <LiveRegionProvider>
          <SkipLink />
          <NuqsAdapter>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main id="main-content" role="main" tabIndex={-1} className="flex-1 outline-none">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </NuqsAdapter>
        </LiveRegionProvider>
      </body>
    </html>
  );
}
