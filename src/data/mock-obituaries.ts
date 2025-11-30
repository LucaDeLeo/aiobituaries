import type { ObituarySummary } from '@/types/obituary'

/**
 * Local mock data used for development when Sanity env vars are missing
 * or the CMS is unavailable. Dates span 2012-2024 so the scatter plot
 * has a visible horizontal spread.
 */
export const mockObituaries: ObituarySummary[] = [
  {
    _id: 'mock-agi-impossible-2020',
    slug: 'agi-impossible-2020',
    claim: 'AGI is impossible with current deep learning approaches',
    source: 'Oxford Debate Series',
    date: '2020-02-20',
    categories: ['agi'],
  },
  {
    _id: 'mock-ai-winter-2018',
    slug: 'ai-winter-is-here',
    claim: 'Another AI winter is around the corner',
    source: 'MIT Technology Review',
    date: '2018-07-01',
    categories: ['capability'],
  },
  {
    _id: 'mock-self-driving-2015',
    slug: 'self-driving-cars-are-a-fantasy',
    claim: 'Self-driving cars are a fantasy that will never ship at scale',
    source: 'The New York Times',
    date: '2015-12-15',
    categories: ['capability'],
  },
  {
    _id: 'mock-bubble-2023',
    slug: 'ai-bubble-will-burst-2024',
    claim: 'The AI bubble will burst by 2024 as revenues disappoint',
    source: 'Financial Times',
    date: '2023-01-10',
    categories: ['market'],
  },
  {
    _id: 'mock-nvda-peak-2022',
    slug: 'nvidia-peak-ai',
    claim: 'NVIDIA has peaked; AI demand will collapse next year',
    source: 'MarketWatch',
    date: '2022-11-05',
    categories: ['market'],
  },
  {
    _id: 'mock-chatbots-2016',
    slug: 'chatbots-are-a-fad',
    claim: 'Chatbots are a fad that consumers will abandon',
    source: 'Recode',
    date: '2016-04-01',
    categories: ['dismissive'],
  },
  {
    _id: 'mock-deeplearning-2014',
    slug: 'deep-learning-is-dead',
    claim: 'Deep learning is dead; symbolic AI will replace it',
    source: 'Hacker News commenter',
    date: '2014-09-14',
    categories: ['capability'],
  },
  {
    _id: 'mock-code-2019',
    slug: 'ai-cant-write-code',
    claim: 'AI will never write production-quality code',
    source: 'Software Engineering Daily',
    date: '2019-06-09',
    categories: ['capability'],
  },
  {
    _id: 'mock-plateau-2024',
    slug: 'llms-have-plateaued',
    claim: 'Large language models have already plateaued',
    source: 'AI Skeptics Forum',
    date: '2024-06-01',
    categories: ['capability'],
  },
  {
    _id: 'mock-robots-2012',
    slug: 'robots-wont-replace-workers',
    claim: 'Robots will never replace most human workers',
    source: 'The Economist',
    date: '2012-03-02',
    categories: ['dismissive'],
  },
  {
    _id: 'mock-search-2021',
    slug: 'search-wont-be-disrupted-by-ai',
    claim: 'AI will not meaningfully change web search economics',
    source: 'Search Engine Land',
    date: '2021-08-18',
    categories: ['market'],
  },
  {
    _id: 'mock-hype-2025',
    slug: 'ai-hype-will-fade-2025',
    claim: 'AI hype will fade in 2025 as regulation slows progress',
    source: 'Policy Weekly',
    date: '2025-01-15',
    categories: ['market'],
  },
]
