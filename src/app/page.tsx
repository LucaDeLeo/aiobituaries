import { CountDisplay } from "@/components/obituary/count-display";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Count */}
      <section className="flex flex-col items-center justify-center py-24 px-4">
        <CountDisplay />
      </section>
    </main>
  );
}
