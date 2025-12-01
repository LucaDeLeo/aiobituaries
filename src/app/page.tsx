import { CountDisplay } from "@/components/obituary/count-display";
import { ObituaryList } from "@/components/obituary/obituary-list";
import { JsonLd } from "@/components/seo/json-ld";
import { homepageMetadata } from "@/lib/utils/seo";
import { getObituaries } from "@/lib/sanity/queries";
import { HomeClient } from "./home-client";

export const metadata = homepageMetadata;

export default async function Home() {
  const obituaries = await getObituaries();

  return (
    <>
      <JsonLd type="website" />
      <main className="min-h-screen">
        {/* Hero Section with Count */}
        <section className="flex flex-col items-center justify-center py-24 px-4">
          <CountDisplay />
        </section>

        {/* Timeline Visualization and Category Filter */}
        <HomeClient obituaries={obituaries} />

        {/* Obituary List Section */}
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <ObituaryList />
        </section>
      </main>
    </>
  );
}
