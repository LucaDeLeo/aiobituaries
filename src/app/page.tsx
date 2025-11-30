import { CountDisplay } from "@/components/obituary/count-display";
import { ObituaryList } from "@/components/obituary/obituary-list";
import { homepageMetadata } from "@/lib/utils/seo";

export const metadata = homepageMetadata;

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Count */}
      <section className="flex flex-col items-center justify-center py-24 px-4">
        <CountDisplay />
      </section>

      {/* Obituary List Section */}
      <section className="px-4 pb-24 max-w-7xl mx-auto">
        <ObituaryList />
      </section>
    </main>
  );
}
