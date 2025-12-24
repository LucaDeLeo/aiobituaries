/**
 * LLM Classification for Discovery Pipeline
 *
 * Uses Claude to classify discovery candidates:
 * - Determine if content is an AI doom/skepticism claim
 * - Extract the core claim
 * - Suggest category
 * - Assess notability
 */

import Anthropic from '@anthropic-ai/sdk'
import type { Category } from '@/types/obituary'
import type {
  DiscoveryCandidate,
  ClassificationResult,
  ClassifiedCandidate,
} from '@/types/discovery'

let _client: Anthropic | null = null

/**
 * Get the Anthropic client.
 * Returns null if ANTHROPIC_API_KEY is not configured.
 */
function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return null
  }

  if (!_client) {
    _client = new Anthropic({ apiKey })
  }

  return _client
}

/**
 * Check if Anthropic is configured
 */
export function isAnthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

/**
 * Classification prompt for Claude
 *
 * Enhanced with:
 * - New categories (capability-narrow, capability-reasoning)
 * - Quality scoring dimensions
 * - Anti-pattern detection
 * - Status determination
 */
const CLASSIFICATION_PROMPT = `You are an AI claim classifier for a project tracking "AI obituaries" - predictions that AI will fail, is overhyped, or has fundamental limitations.

## Your Task

Analyze the content and classify it according to our quality criteria.

## Categories

- "capability-narrow": Task-specific skepticism (e.g., "AI will never write production code", "Self-driving cars won't work")
- "capability-reasoning": Intelligence/reasoning skepticism (e.g., "LLMs are just stochastic parrots", "AI doesn't truly understand")
- "market": Financial/bubble claims (e.g., "AI bubble will burst", "AI stocks overvalued")
- "agi": AGI-specific skepticism (e.g., "AGI is impossible", "AGI won't happen for 100 years")
- "dismissive": General AI dismissal (e.g., "AI is just hype", "This AI stuff is ridiculous")

## Anti-Patterns (REJECT these)

1. **Reasonable caution**: "We should be careful about AI" - NOT a doom claim
2. **Risk warnings**: "AI poses existential risk" - This is the OPPOSITE thesis (AI worry, not AI dismissal)
3. **Vague sentiments**: "I'm skeptical of AI" without specific falsifiable prediction
4. **Satire/jokes**: Obviously humorous takes
5. **Self-serving**: Competitors trashing each other

## Quality Scoring (0-100, sum of 4 dimensions)

**Falsifiability (0-25)**: How testable is the prediction?
- 25: Specific timeline + capability ("won't do X by YYYY")
- 20: Specific capability ("will never X")
- 15: General timeline ("decades away")
- 10: Vague but testable ("can't do creative work")
- 5: Nearly unfalsifiable ("not real intelligence")

**Source Authority (0-25)**: How credible is the source?
- 25: Domain expert + tier 1 publication
- 20: Adjacent expert or tech journalist
- 15: Notable (10k+ followers)
- 10: Tier 2 publication
- 5: Minor source

**Claim Boldness (0-25)**: How confident is the prediction?
- 25: Absolute certainty ("will NEVER")
- 20: Strong conviction ("confident it won't")
- 15: Moderate conviction ("don't think it will")
- 10: Hedged ("probably won't")
- 5: Mild ("doubt it will")

**Historical Value (0-25)**: How significant is this claim?
- 25: Widely cited/influential
- 20: Viral reach
- 15: Notable person making specific claim
- 10: Relevant expert perspective
- 5: Historical artifact worth preserving

## Claim Status

Determine the claim's status:
- "falsified": AI demonstrably does what claim said it couldn't, or predicted failure timeline passed
- "aging": AI making progress toward claimed limitation, prediction looking increasingly unlikely
- "pending": Timeline not reached, capability not yet demonstrable, prediction still plausible

Content to analyze:
---
Title: {title}
Author: {author}
Source: {sourceType}
URL: {url}
Date: {date}

Text:
{text}
---

Respond in JSON format:
{
  "isAIDoomClaim": boolean,
  "claimConfidence": number,
  "isNotable": boolean,
  "notabilityReason": "string",
  "extractedClaim": "string",
  "suggestedCategory": "capability-narrow" | "capability-reasoning" | "market" | "agi" | "dismissive",
  "qualityScore": {
    "falsifiability": number,
    "sourceAuthority": number,
    "claimBoldness": number,
    "historicalValue": number,
    "total": number
  },
  "status": "falsified" | "aging" | "pending",
  "antiPatternDetected": "reasonable_caution" | "risk_warning" | "vague_sentiment" | "satire" | "self_serving" | null,
  "recommendation": "approve" | "review" | "reject"
}`

/**
 * Parse classification result from Claude's response
 */
function parseClassificationResult(content: string): ClassificationResult | null {
  try {
    // Extract JSON from response (handles markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])

    // Validate required fields
    if (
      typeof parsed.isAIDoomClaim !== 'boolean' ||
      typeof parsed.claimConfidence !== 'number' ||
      typeof parsed.extractedClaim !== 'string' ||
      typeof parsed.suggestedCategory !== 'string'
    ) {
      return null
    }

    // Validate category - now includes new capability subcategories
    const validCategories: Category[] = [
      'capability-narrow',
      'capability-reasoning',
      'market',
      'capability', // Legacy fallback
      'agi',
      'dismissive',
    ]
    if (!validCategories.includes(parsed.suggestedCategory)) {
      parsed.suggestedCategory = 'dismissive' // default fallback
    }

    // Validate recommendation
    const validRecommendations = ['approve', 'review', 'reject']
    if (!validRecommendations.includes(parsed.recommendation)) {
      parsed.recommendation = 'review' // default fallback
    }

    // Validate status
    const validStatuses = ['falsified', 'aging', 'pending']
    const status = validStatuses.includes(parsed.status) ? parsed.status : 'pending'

    // Validate anti-pattern
    const validAntiPatterns = [
      'reasonable_caution',
      'risk_warning',
      'vague_sentiment',
      'satire',
      'self_serving',
    ]
    const antiPatternDetected = validAntiPatterns.includes(parsed.antiPatternDetected)
      ? parsed.antiPatternDetected
      : null

    // Parse quality score if present
    let qualityScore = undefined
    if (parsed.qualityScore && typeof parsed.qualityScore === 'object') {
      const qs = parsed.qualityScore
      qualityScore = {
        falsifiability: Math.max(0, Math.min(25, qs.falsifiability || 0)),
        sourceAuthority: Math.max(0, Math.min(25, qs.sourceAuthority || 0)),
        claimBoldness: Math.max(0, Math.min(25, qs.claimBoldness || 0)),
        historicalValue: Math.max(0, Math.min(25, qs.historicalValue || 0)),
        total: Math.max(0, Math.min(100, qs.total || 0)),
      }
    }

    return {
      isAIDoomClaim: parsed.isAIDoomClaim,
      claimConfidence: Math.max(0, Math.min(1, parsed.claimConfidence)),
      isNotable: parsed.isNotable ?? true,
      notabilityReason: parsed.notabilityReason || 'Unknown',
      extractedClaim: parsed.extractedClaim.slice(0, 200),
      suggestedCategory: parsed.suggestedCategory as Category,
      qualityScore,
      status,
      antiPatternDetected,
      recommendation: parsed.recommendation as 'approve' | 'review' | 'reject',
    }
  } catch {
    return null
  }
}

/**
 * Build the prompt for a candidate
 */
function buildPrompt(candidate: DiscoveryCandidate): string {
  return CLASSIFICATION_PROMPT.replace('{title}', candidate.title)
    .replace('{author}', candidate.author?.name || 'Unknown')
    .replace('{sourceType}', candidate.sourceType)
    .replace('{url}', candidate.url)
    .replace('{date}', candidate.publishedDate)
    .replace('{text}', candidate.text.slice(0, 2000)) // Limit text length
}

/**
 * Classify a single candidate using Claude
 *
 * @param candidate - The candidate to classify
 * @returns Classification result or null on failure
 */
export async function classifyCandidate(
  candidate: DiscoveryCandidate
): Promise<ClassificationResult | null> {
  const client = getAnthropicClient()

  if (!client) {
    console.warn('[classifier] Anthropic client not configured')
    return null
  }

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: buildPrompt(candidate),
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return null
    }

    return parseClassificationResult(content.text)
  } catch (error) {
    console.error('[classifier] Classification failed:', error)
    return null
  }
}

/**
 * Classify multiple candidates
 * Processes sequentially to respect rate limits
 *
 * @param candidates - Array of candidates to classify
 * @returns Array of classified candidates (excluding failures)
 */
export async function classifyCandidates(
  candidates: DiscoveryCandidate[]
): Promise<ClassifiedCandidate[]> {
  const results: ClassifiedCandidate[] = []

  for (const candidate of candidates) {
    const result = await classifyCandidate(candidate)
    if (result) {
      results.push({ candidate, result })
    }
    // Small delay between requests to be nice to the API
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

/**
 * Filter classified candidates to only approved/review (not rejected)
 *
 * @param classified - Array of classified candidates
 * @returns Filtered array excluding rejections
 */
export function filterClassified(
  classified: ClassifiedCandidate[]
): ClassifiedCandidate[] {
  return classified.filter((c) => c.result.recommendation !== 'reject')
}
