import { CountDisplay } from "@/components/obituary/count-display";
import { ObituaryList } from "@/components/obituary/obituary-list";
import { ScatterPlot } from "@/components/visualization/scatter-plot";
import { JsonLd } from "@/components/seo/json-ld";
import { homepageMetadata } from "@/lib/utils/seo";
import { getObituaries } from "@/lib/sanity/queries";

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

        {/* Timeline Visualization */}
        <section className="container mx-auto px-4 py-8">
          <ScatterPlot data={obituaries} />
        </section>

        {/* Obituary List Section */}
        <section className="px-4 pb-24 max-w-7xl mx-auto">
          <ObituaryList />
        </section>
      </main>
    </>
  );
}
