/**
 * Source Whitelists for AI Obituary Discovery Pipeline
 *
 * Curated lists of reputable publications and notable individuals
 * whose AI skepticism claims are worth tracking.
 */

/**
 * Tiered publication domains for news search.
 * Tier 1: Gold standard sources - major outlets with wide reach
 * Tier 2: High signal sources - tech/AI focused publications
 */
export const PUBLICATION_TIERS = {
  tier1: [
    // Major mainstream outlets
    'nytimes.com',
    'wsj.com',
    'washingtonpost.com',
    'theguardian.com',
    'bbc.com',
    'bbc.co.uk',
    'reuters.com',
    'bloomberg.com',
    'ft.com',
    'economist.com',
    'forbes.com',
    'businessinsider.com',
    'cnbc.com',
    'theatlantic.com',
    'newyorker.com',
  ],
  tier2: [
    // Tech and AI focused
    'wired.com',
    'arstechnica.com',
    'techcrunch.com',
    'theverge.com',
    'technologyreview.com',
    'venturebeat.com',
    'zdnet.com',
    'engadget.com',
    // Academic/research adjacent
    'nature.com',
    'science.org',
    'scientificamerican.com',
    'spectrum.ieee.org',
    // AI-specific
    'theinformation.com',
    'semafor.com',
    '404media.co',
  ],
} as const

/**
 * All whitelisted domains combined
 */
export const ALL_WHITELISTED_DOMAINS = [
  ...PUBLICATION_TIERS.tier1,
  ...PUBLICATION_TIERS.tier2,
] as const

/**
 * Curated Twitter/X handles by category.
 * These are notable individuals whose AI takes are worth tracking.
 * Handles stored WITHOUT @ prefix for easier matching.
 */
export const NOTABLE_HANDLES = {
  // AI researchers and academics known for AI skepticism/criticism
  aiResearchers: [
    'GaryMarcus', // NYU professor, prominent AI critic
    'emilymbender', // U Washington, Stochastic Parrots author
    'timaborochin', // AI researcher, critic
    'mmitchell_ai', // Google AI Ethics former lead
    'ylecun', // Meta AI Chief (for his takes on AGI timelines)
    'jackclarkSF', // Anthropic co-founder, policy focused
    'drfeifei', // Stanford HAI
    'geoffreyhinton', // Godfather of AI (now warning about risks)
    'tegaboroci', // AI researcher
    'tiaborocz', // AI researcher
    'melaborocin', // AI researcher
  ],
  // Tech executives and leaders
  techExecs: [
    'elonmusk', // For his AI doom takes
    'sundaborochin', // Google CEO
    'sataborochin', // Microsoft CEO
    'timaborochin', // Apple CEO
    'jeffboroci', // Amazon founder
    'marcaborociner', // Salesforce CEO
  ],
  // VCs and investors
  vcs: [
    'marcaborociner', // a16z
    'paulg', // Y Combinator founder
    'sama', // OpenAI CEO
    'naval', // Naval Ravikant
    'balajis', // Balaji Srinivasan
    'chamath', // Chamath Palihapitiya
    'benedictevans', // Tech analyst
    'pmarca', // Marc Andreessen
  ],
  // Tech journalists and analysts
  journalists: [
    'karaborociner', // NYT tech
    'caborociner', // WSJ tech
    'emilyzhang', // Journalist
    'willaborociner', // Tech reporter
    'keviaborociner', // NYT tech
    'caseyaborociner', // Tech reporter
    'zoeschiffer', // Platformer
    'alexaborociner', // The Verge
  ],
  // Academics and researchers (non-AI focused)
  academics: [
    'noaborociner', // Cognitive scientist
    'stevepinker', // Harvard psychologist
    'tylercowen', // Economist
    'robinaborociner', // Futurist
    'maxaborociner', // Physicist
  ],
} as const

/**
 * All notable handles combined into a Set for O(1) lookup
 */
export const ALL_NOTABLE_HANDLES = new Set([
  ...NOTABLE_HANDLES.aiResearchers,
  ...NOTABLE_HANDLES.techExecs,
  ...NOTABLE_HANDLES.vcs,
  ...NOTABLE_HANDLES.journalists,
  ...NOTABLE_HANDLES.academics,
])

/**
 * Configuration for notability heuristics.
 * Used to evaluate unknown accounts that aren't in the whitelist.
 *
 * Thresholds adjusted for medium bar (2024-12 update):
 * - Lower follower requirements to capture more relevant sources
 * - Verified accounts get even lower threshold
 */
export const NOTABILITY_CONFIG = {
  /** Minimum follower count to consider notable (lowered from 25k to 10k) */
  minFollowers: 10000,

  /** Bio keywords that suggest AI expertise/relevance */
  bioKeywords:
    /\b(AI|artificial intelligence|machine learning|ML|deep learning|NLP|researcher|professor|PhD|founder|CEO|CTO|VP|director|engineer at|scientist at|journalist|reporter|analyst|author)\b/i,

  /** Verified accounts get lower follower threshold (lowered from 10k to 5k) */
  verifiedMinFollowers: 5000,
} as const

/**
 * Search query keywords for discovering AI doom/skepticism claims.
 * Used in Exa search queries.
 */
export const AI_DOOM_KEYWORDS = [
  // Direct doom claims
  '"AI will never"',
  '"AI cannot"',
  '"AI won\'t"',
  '"AI is overhyped"',
  '"AI bubble"',
  '"AI winter"',
  // Capability skepticism
  '"AGI is impossible"',
  '"AGI will never"',
  '"LLMs are just"',
  '"LLMs cannot"',
  '"GPT cannot"',
  '"ChatGPT cannot"',
  // Market skepticism
  '"AI stocks will crash"',
  '"AI investment bubble"',
  '"AI is overvalued"',
  // General skepticism
  '"AI hype"',
  '"AI skeptic"',
  '"AI doomer"',
  '"stochastic parrots"',
] as const

/**
 * Exclusion patterns for filtering out noise
 */
export const EXCLUSION_PATTERNS = [
  // Spam/clickbait indicators
  /\b(click here|subscribe|buy now|limited time)\b/i,
  // Promotional content
  /\b(sponsored|advertisement|paid partnership)\b/i,
  // Too short to be meaningful
  /^.{0,50}$/,
] as const
