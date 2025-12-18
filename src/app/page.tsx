import { Suspense } from "react";
import { CountDisplay } from "@/components/obituary/count-display";
import { CountDisplayCompact } from "@/components/obituary/count-display-compact";
import { ObituaryList } from "@/components/obituary/obituary-list";
import { JsonLd } from "@/components/seo/json-ld";
import { homepageMetadata } from "@/lib/utils/seo";
import { getObituaries } from "@/lib/sanity/queries";
import { HomeClient } from "./home-client";
import { HomePageClient } from "./home-page-client";
import { MobileTimeline } from "@/components/mobile/mobile-timeline";
import { ControlSheet } from "@/components/controls";
import { ClientLayoutRouter } from "@/components/layout/client-layout-router";

export const metadata = homepageMetadata;

export default async function Home() {
  const obituaries = await getObituaries();

  const mobileContent = (
    <main className="min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center py-12 md:py-24 px-4">
        <CountDisplay />
      </section>

      {/* Tablet: Full-width chart */}
      <div className="hidden md:block flex-1">
        <Suspense fallback={null}>
          <HomeClient obituaries={obituaries} />
        </Suspense>
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <ObituaryList />
        </section>
      </div>

      {/* Mobile: Hybrid view */}
      <div className="md:hidden flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <MobileTimeline obituaries={obituaries} />
        </Suspense>
      </div>

      {/* Control sheet for tablet/mobile */}
      <ControlSheet totalCount={obituaries.length} />
    </main>
  );

  const desktopContent = (
    <main className="flex flex-col min-h-screen">
      <header className="flex items-center px-6 py-4 border-b border-border" aria-label="Dashboard header">
        <CountDisplayCompact />
      </header>

      <div className="grid grid-cols-[1fr_320px] flex-1 min-h-[500px] gap-0">
        <Suspense fallback={null}>
          <HomePageClient obituaries={obituaries} />
        </Suspense>
      </div>
    </main>
  );

  return (
    <>
      <JsonLd type="website" />
      <ClientLayoutRouter
        mobile={mobileContent}
        desktop={desktopContent}
        fallback={desktopContent}
      />
    </>
  );
}
