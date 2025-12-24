import type { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://aiobituaries.com'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for AI Obituaries - How we handle your data and protect your privacy.',
  openGraph: {
    title: 'Privacy Policy | AI Obituaries',
    description: 'Privacy Policy for AI Obituaries - How we handle your data.',
    type: 'website',
    url: `${BASE_URL}/privacy`,
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
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl md:text-4xl font-serif text-[var(--accent-primary)] mb-8">
        Privacy Policy
      </h1>

      <div className="prose prose-invert max-w-none space-y-8 text-[var(--text-secondary)]">
        <p className="text-sm text-[var(--text-muted)]">
          Last updated: December 2024
        </p>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Overview
          </h2>
          <p>
            AI Obituaries is committed to protecting your privacy. This policy explains
            what information we collect and how we use it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Information We Collect
          </h2>
          <p>
            <strong className="text-[var(--text-primary)]">Server Logs:</strong> Like most websites,
            our servers automatically collect standard log information including your IP address,
            browser type, referring pages, and pages visited. This data is used for security,
            debugging, and aggregate analytics purposes.
          </p>
          <p className="mt-4">
            <strong className="text-[var(--text-primary)]">No Personal Data Collection:</strong> We
            do not require account creation, collect email addresses, or use tracking cookies
            for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Third-Party Services
          </h2>
          <p>
            This site is hosted on Vercel and uses Sanity.io as a content management system.
            These services may collect their own operational data according to their respective
            privacy policies:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-primary)] hover:underline"
              >
                Vercel Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://www.sanity.io/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-primary)] hover:underline"
              >
                Sanity Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Cookies
          </h2>
          <p>
            We use only essential cookies required for the website to function properly.
            We do not use tracking cookies, advertising cookies, or third-party analytics
            that track individual users.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Data Retention
          </h2>
          <p>
            Server logs are retained for a limited period for security and operational purposes,
            after which they are automatically deleted.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Your Rights
          </h2>
          <p>
            Depending on your jurisdiction, you may have rights regarding your personal data,
            including the right to access, correct, or delete information we hold about you.
            Since we collect minimal data, there is typically little to no personal information
            associated with your visit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted
            on this page with an updated revision date.
          </p>
        </section>

        <section className="pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] italic">
            If you have questions about this privacy policy, you can reach out via the
            contact information provided on the site.
          </p>
        </section>
      </div>
    </div>
  )
}
