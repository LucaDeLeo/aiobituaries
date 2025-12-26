import { Suspense } from "react";
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

  // P0.4 fix: Separate mobile and tablet content to prevent double-mounting
  // Only ONE branch is mounted at a time via ClientLayoutRouter

  // Mobile: < 768px - Timeline-centric view
  // Note: No ControlSheet on mobile - MobileTimeline has integrated CategoryFilter
  const mobileContent = (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <MobileTimeline obituaries={obituaries} />
        </Suspense>
      </div>
    </div>
  );

  // Tablet: 768px - 1024px - Full chart with list below
  const tabletContent = (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <Suspense fallback={null}>
          <HomeClient obituaries={obituaries} />
        </Suspense>
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <ObituaryList obituaries={obituaries} />
        </section>
      </div>
      <ControlSheet totalCount={obituaries.length} obituaries={obituaries} />
    </div>
  );

  // Desktop: >= 1024px - Full dashboard layout
  // Single grid with explicit height - no nested flex wrappers for reliable height inheritance
  const desktopContent = (
    <div className="grid grid-cols-[1fr_320px] h-[calc(100dvh-var(--header-height))]">
      <Suspense fallback={null}>
        <HomePageClient obituaries={obituaries} />
      </Suspense>
    </div>
  );

  return (
    <>
      <JsonLd type="website" />
      {/* Visually-hidden h1 for accessibility - screen readers need a page heading */}
      <h1 className="sr-only">AI Obituaries: A memorial to the ever-dying predictions of AI doom</h1>
      <ClientLayoutRouter
        mobile={mobileContent}
        tablet={tabletContent}
        desktop={desktopContent}
        fallback={desktopContent}
      />
    </>
  );
}
