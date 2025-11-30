import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen p-8 space-y-8">
      {/* Typography Test */}
      <section className="space-y-4">
        <h1 className="font-serif text-4xl text-[--text-primary]">
          AI Obituaries - Deep Archive Theme
        </h1>
        <p className="text-[--text-secondary]">
          Testing Deep Archive theme with Instrument Serif headlines
        </p>
        <p className="text-[--text-muted] text-sm">
          Muted text for captions and timestamps
        </p>
      </section>

      {/* Font Showcase */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-[--text-primary]">
          Typography Showcase
        </h2>
        <div className="space-y-2 p-4 bg-[--bg-card] rounded-lg border border-[--border]">
          <p className="font-sans">Geist Sans (Body text)</p>
          <p className="font-serif">Instrument Serif (Headlines)</p>
          <p className="font-mono text-[--accent-primary]">
            Geist Mono: Count 247
          </p>
        </div>
      </section>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-[--text-primary]">
          Button Components
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Color Palette */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-[--text-primary]">
          Color Palette
        </h2>

        {/* Background Colors */}
        <div className="space-y-2">
          <h3 className="text-[--text-secondary]">Background Colors</h3>
          <div className="flex gap-2">
            <div className="w-16 h-16 bg-[--bg-primary] border border-[--border] rounded flex items-center justify-center text-xs text-[--text-muted]">
              Primary
            </div>
            <div className="w-16 h-16 bg-[--bg-secondary] border border-[--border] rounded flex items-center justify-center text-xs text-[--text-muted]">
              Secondary
            </div>
            <div className="w-16 h-16 bg-[--bg-card] border border-[--border] rounded flex items-center justify-center text-xs text-[--text-muted]">
              Card
            </div>
            <div className="w-16 h-16 bg-[--bg-tertiary] border border-[--border] rounded flex items-center justify-center text-xs text-[--text-muted]">
              Tertiary
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="space-y-2">
          <h3 className="text-[--text-secondary]">Text Colors</h3>
          <div className="flex gap-4 p-4 bg-[--bg-card] rounded-lg">
            <span className="text-[--text-primary]">Primary</span>
            <span className="text-[--text-secondary]">Secondary</span>
            <span className="text-[--text-muted]">Muted</span>
          </div>
        </div>

        {/* Category Colors (Timeline Dots) */}
        <div className="space-y-2">
          <h3 className="text-[--text-secondary]">Category Colors</h3>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[--category-capability]"></span>
              <span className="text-sm text-[--text-muted]">Capability</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[--category-market]"></span>
              <span className="text-sm text-[--text-muted]">Market</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[--category-agi]"></span>
              <span className="text-sm text-[--text-muted]">AGI</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[--category-dismissive]"></span>
              <span className="text-sm text-[--text-muted]">Dismissive</span>
            </div>
          </div>
        </div>

        {/* Semantic Colors */}
        <div className="space-y-2">
          <h3 className="text-[--text-secondary]">Semantic Colors</h3>
          <div className="flex gap-4">
            <span className="px-3 py-1 rounded bg-[--success] text-[--bg-primary] text-sm">
              Success
            </span>
            <span className="px-3 py-1 rounded bg-[--warning] text-[--bg-primary] text-sm">
              Warning
            </span>
            <span className="px-3 py-1 rounded bg-[--error] text-[--text-primary] text-sm">
              Error
            </span>
            <span className="px-3 py-1 rounded bg-[--info] text-[--text-primary] text-sm">
              Info
            </span>
          </div>
        </div>

        {/* Accent */}
        <div className="space-y-2">
          <h3 className="text-[--text-secondary]">Accent Color</h3>
          <div className="flex items-center gap-4">
            <span className="text-[--accent-primary] font-mono text-2xl">
              #C9A962
            </span>
            <div className="w-8 h-8 rounded-full bg-[--accent-primary]"></div>
          </div>
        </div>
      </section>

      {/* CSS Variables Reference */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl text-[--text-primary]">
          CSS Variables Reference
        </h2>
        <div className="grid grid-cols-2 gap-4 p-4 bg-[--bg-card] rounded-lg border border-[--border] font-mono text-sm">
          <div className="space-y-1">
            <p className="text-[--text-secondary]">--bg-primary: #0C0C0F</p>
            <p className="text-[--text-secondary]">--bg-secondary: #14141A</p>
            <p className="text-[--text-secondary]">--bg-card: #18181F</p>
            <p className="text-[--text-secondary]">--bg-tertiary: #1C1C24</p>
            <p className="text-[--text-secondary]">--border: #2A2A35</p>
          </div>
          <div className="space-y-1">
            <p className="text-[--text-secondary]">--text-primary: #E8E6E3</p>
            <p className="text-[--text-secondary]">--text-secondary: #A8A5A0</p>
            <p className="text-[--text-secondary]">--text-muted: #6B6860</p>
            <p className="text-[--accent-primary]">--accent-primary: #C9A962</p>
          </div>
        </div>
      </section>
    </main>
  );
}
