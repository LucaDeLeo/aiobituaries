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
  const count = obituaries.length;

  // P0.4 fix: Separate mobile and tablet content to prevent double-mounting
  // Only ONE branch is mounted at a time via ClientLayoutRouter

  // Fallback for count displays during SSR/static generation
  const countFallback = (
    <div className="flex flex-col items-center gap-4">
      <span className="text-7xl font-bold text-[var(--text-primary)] tabular-nums">{count}</span>
      <span className="text-lg text-[var(--text-secondary)]">obituaries archived</span>
    </div>
  );

  const countCompactFallback = (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{count}</span>
      <span className="text-sm text-[var(--text-muted)]">obituaries</span>
    </div>
  );

  // Mobile: < 768px - Timeline-centric view
  const mobileContent = (
    <div className="min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center py-12 px-4">
        <Suspense fallback={countFallback}>
          <CountDisplay count={count} obituaries={obituaries} />
        </Suspense>
      </section>
      <div className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
          <MobileTimeline obituaries={obituaries} />
        </Suspense>
      </div>
      <ControlSheet totalCount={obituaries.length} />
    </div>
  );

  // Tablet: 768px - 1024px - Full chart with list below
  const tabletContent = (
    <div className="min-h-screen flex flex-col">
      <section className="flex flex-col items-center justify-center py-24 px-4">
        <Suspense fallback={countFallback}>
          <CountDisplay count={count} obituaries={obituaries} />
        </Suspense>
      </section>
      <div className="flex-1">
        <Suspense fallback={null}>
          <HomeClient obituaries={obituaries} />
        </Suspense>
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <ObituaryList obituaries={obituaries} />
        </section>
      </div>
      <ControlSheet totalCount={obituaries.length} />
    </div>
  );

  // Desktop: >= 1024px - Full dashboard layout
  const desktopContent = (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-6 py-4 border-b border-border" aria-label="Dashboard header">
        <Suspense fallback={countCompactFallback}>
          <CountDisplayCompact count={count} obituaries={obituaries} />
        </Suspense>
      </header>
      <div className="grid grid-cols-[1fr_320px] flex-1 min-h-[500px] gap-0">
        <Suspense fallback={null}>
          <HomePageClient obituaries={obituaries} />
        </Suspense>
      </div>
    </div>
  );

  return (
    <>
      <JsonLd type="website" />
      <ClientLayoutRouter
        mobile={mobileContent}
        tablet={tabletContent}
        desktop={desktopContent}
        fallback={desktopContent}
      />
    </>
  );
}
