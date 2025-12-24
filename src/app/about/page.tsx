import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'

export const metadata: Metadata = {
  title: 'About',
  description: 'About AI Obituaries - A data-driven archive documenting AI skepticism and tracking declarations that AI is dead, overhyped, or doomed.',
  openGraph: {
    title: 'About | AI Obituaries',
    description: 'A data-driven archive documenting AI skepticism and tracking declarations that AI is dead, overhyped, or doomed.',
    type: 'website',
    url: `${BASE_URL}/about`,
    siteName: 'AI Obituaries',
    images: [
      {
        url: `${BASE_URL}/og/default.png`,
        width: 1200,
        height: 630,
        alt: 'AI Obituaries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | AI Obituaries',
    description: 'A data-driven archive documenting AI skepticism.',
    images: [`${BASE_URL}/og/default.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-[var(--accent-primary)] mb-8">
        About AI Obituaries
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)]">
        <p className="text-lg leading-relaxed">
          AI Obituaries is a curated archive tracking declarations that
          &quot;AI is dead,&quot; &quot;overhyped,&quot; or &quot;doomed to fail.&quot;
          We visualize these claims against real AI progress metrics to provide
          historical context for recurring skepticism.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            The Visualization
          </h2>
          <p>
            Each point on the timeline represents a published claim doubting AI capabilities,
            predicting market collapse, or dismissing progress. The background trend lines
            show actual AI progress data from{' '}
            <a
              href="https://epoch.ai/data"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-primary)] hover:underline"
            >
              Epoch AI
            </a>
            , including:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <strong className="text-[var(--text-primary)]">Training Compute</strong> &mdash;
              Maximum FLOP used to train frontier models (exponential growth)
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">MMLU Score</strong> &mdash;
              Benchmark accuracy tracking capability improvements
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Epoch Capability Index</strong> &mdash;
              Composite score tracking overall AI capability
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Categories
          </h2>
          <ul className="space-y-3">
            <li>
              <span className="inline-block w-3 h-3 rounded-full bg-[var(--category-capability)] mr-2" />
              <strong className="text-[var(--text-primary)]">Capability Doubt</strong> &mdash;
              Claims AI cannot do specific tasks
            </li>
            <li>
              <span className="inline-block w-3 h-3 rounded-full bg-[var(--category-market)] mr-2" />
              <strong className="text-[var(--text-primary)]">Market/Bubble</strong> &mdash;
              Predictions that AI is overhyped or a bubble
            </li>
            <li>
              <span className="inline-block w-3 h-3 rounded-full bg-[var(--category-agi)] mr-2" />
              <strong className="text-[var(--text-primary)]">AGI Skepticism</strong> &mdash;
              Claims AGI is impossible or very far away
            </li>
            <li>
              <span className="inline-block w-3 h-3 rounded-full bg-[var(--category-dismissive)] mr-2" />
              <strong className="text-[var(--text-primary)]">Dismissive Framing</strong> &mdash;
              Casual dismissal or mockery of AI progress
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Data Sources
          </h2>
          <p>
            Progress metrics are sourced from{' '}
            <a
              href="https://epoch.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-primary)] hover:underline"
            >
              Epoch AI
            </a>
            , a research organization tracking AI development. Obituary claims
            are manually curated from published articles, interviews, and social media.
          </p>
        </section>

        <section className="mt-12 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] italic">
            This project is not intended to mock individuals, but to provide
            historical perspective on the recurring nature of AI skepticism
            and the often-surprising pace of progress.
          </p>
        </section>
      </div>
    </div>
  )
}
