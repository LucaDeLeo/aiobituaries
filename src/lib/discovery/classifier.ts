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
 */
const CLASSIFICATION_PROMPT = `You are an AI claim classifier for a project tracking "AI obituaries" - predictions that AI will fail, is overhyped, or has fundamental limitations.

Analyze the following content and determine:
1. Is this an AI doom/skepticism claim? (predictions AI will fail, is overhyped, bubble will burst, has fundamental limits)
2. Extract the core claim as a concise quote or paraphrase (max 200 chars)
3. What category best fits this claim?
   - "market": AI stocks/investment will crash, AI is overvalued, bubble predictions
   - "capability": AI can't do X, fundamental limitations, "AI will never..."
   - "agi": AGI is impossible, won't happen, is decades away
   - "dismissive": AI is just hype, not real intelligence, "just" pattern matching
4. How confident are you this is a valid AI doom claim (0.0-1.0)?
5. Is the author notable enough to track? Why?
6. Recommendation: "approve" (high confidence + notable), "review" (medium confidence), or "reject" (not a doom claim or not notable)

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
  "suggestedCategory": "market" | "capability" | "agi" | "dismissive",
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

    // Validate category
    const validCategories: Category[] = ['market', 'capability', 'agi', 'dismissive']
    if (!validCategories.includes(parsed.suggestedCategory)) {
      parsed.suggestedCategory = 'dismissive' // default fallback
    }

    // Validate recommendation
    const validRecommendations = ['approve', 'review', 'reject']
    if (!validRecommendations.includes(parsed.recommendation)) {
      parsed.recommendation = 'review' // default fallback
    }

    return {
      isAIDoomClaim: parsed.isAIDoomClaim,
      claimConfidence: Math.max(0, Math.min(1, parsed.claimConfidence)),
      isNotable: parsed.isNotable ?? true,
      notabilityReason: parsed.notabilityReason || 'Unknown',
      extractedClaim: parsed.extractedClaim.slice(0, 200),
      suggestedCategory: parsed.suggestedCategory as Category,
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
      model: 'claude-haiku-4-5-latest',
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
