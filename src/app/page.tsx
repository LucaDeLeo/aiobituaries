import { Suspense } from "react";
import { CountDisplay } from "@/components/obituary/count-display";
import { ObituaryList } from "@/components/obituary/obituary-list";
import { JsonLd } from "@/components/seo/json-ld";
import { homepageMetadata } from "@/lib/utils/seo";
import { getObituaries } from "@/lib/sanity/queries";
import { HomeClient } from "./home-client";
import { MobileTimeline } from "@/components/mobile/mobile-timeline";

export const metadata = homepageMetadata;

export default async function Home() {
  const obituaries = await getObituaries();

  return (
    <>
      <JsonLd type="website" />
      <main className="min-h-screen flex flex-col">
        {/* Hero Section with Count - visible on all breakpoints */}
        <section className="flex flex-col items-center justify-center py-12 md:py-24 px-4">
          <CountDisplay />
        </section>

        {/* Desktop/Tablet: Full Timeline Visualization (>= 768px) */}
        <div className="hidden md:block flex-1">
          <Suspense fallback={null}>
            <HomeClient obituaries={obituaries} />
          </Suspense>

          {/* Obituary List Section - desktop only */}
          <section className="px-4 pb-24 max-w-7xl mx-auto">
            <ObituaryList />
          </section>
        </div>

        {/* Mobile: Hybrid View with Density Bar + Card List (< 768px) */}
        <div className="md:hidden flex-1 flex flex-col min-h-0">
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <MobileTimeline obituaries={obituaries} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
