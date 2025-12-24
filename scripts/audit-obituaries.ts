#!/usr/bin/env bun
/**
 * Obituary Quality Audit Script
 *
 * Fetches all obituaries from Sanity and scores them against quality criteria.
 * Outputs a JSON report with recommendations: keep, review, flag, or recategorize.
 *
 * Usage:
 *   bun scripts/audit-obituaries.ts
 *   bun scripts/audit-obituaries.ts --output audit-report.json
 *
 * Environment:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID - Sanity project ID
 *   NEXT_PUBLIC_SANITY_DATASET - Sanity dataset (default: production)
 *   ANTHROPIC_API_KEY - Optional, for LLM-assisted scoring
 */

import { createClient } from '@sanity/client'
import Anthropic from '@anthropic-ai/sdk'

// Types
interface AuditObituary {
  _id: string
  slug: string
  claim: string
  source: string
  sourceUrl: string
  date: string
  categories: string[]
  status?: string
  discoveryMetadata?: {
    confidence?: number
    qualityScore?: number
  }
}

interface QualityScore {
  falsifiability: number // 0-25
  sourceAuthority: number // 0-25
  claimBoldness: number // 0-25
  historicalValue: number // 0-25
  total: number // 0-100
}

interface AuditResult {
  _id: string
  slug: string
  claim: string
  source: string
  date: string
  currentCategories: string[]
  qualityScore: QualityScore
  recommendation: 'keep' | 'review' | 'flag' | 'recategorize'
  suggestedCategory?: string
  issues: string[]
  status?: string
}

interface AuditReport {
  timestamp: string
  totalObituaries: number
  summary: {
    keep: number
    review: number
    flag: number
    recategorize: number
  }
  results: AuditResult[]
}

// Configuration
const QUALITY_THRESHOLDS = {
  keep: 50, // Score >= 50: keep
  review: 35, // Score 35-49: review
  // Score < 35: flag
}

// Anti-pattern keywords for heuristic detection
const ANTI_PATTERNS = {
  reasonableCaution: [
    'should be careful',
    'need to be cautious',
    'important to consider',
    'we must ensure',
    'responsible development',
  ],
  riskWarning: [
    'existential risk',
    'poses a threat',
    'dangerous',
    'could harm',
    'safety concerns',
    'alignment problem',
  ],
  vagueSentiment: [
    "i'm skeptical",
    'not convinced',
    'have doubts',
    'remains to be seen',
  ],
}

// Category keywords for suggestion
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'capability-narrow': [
    'will never',
    "can't do",
    'unable to',
    'won\'t be able',
    'limited to',
    'self-driving',
    'autonomous',
    'coding',
    'programming',
  ],
  'capability-reasoning': [
    'stochastic parrot',
    'pattern matching',
    'doesn\'t understand',
    'no comprehension',
    'autocomplete',
    'just predicting',
    'not intelligent',
    'no reasoning',
  ],
  market: [
    'bubble',
    'overvalued',
    'crash',
    'overhyped',
    'investment',
    'stock',
    'valuation',
    'dot-com',
  ],
  agi: ['agi', 'general intelligence', 'superintelligence', 'singularity', 'consciousness'],
  dismissive: ['just hype', 'ridiculous', 'nonsense', 'fad', 'snake oil'],
}

// Initialize Sanity client
function getSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

  if (!projectId) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID environment variable required')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: false,
  })
}

// Fetch all obituaries
async function fetchObituaries(): Promise<AuditObituary[]> {
  const client = getSanityClient()

  const query = `*[_type == "obituary"] | order(date desc) {
    _id,
    "slug": slug.current,
    claim,
    source,
    sourceUrl,
    date,
    categories,
    status,
    discoveryMetadata
  }`

  return client.fetch(query)
}

// Heuristic scoring (no LLM needed)
function scoreHeuristically(obituary: AuditObituary): QualityScore {
  const claim = obituary.claim.toLowerCase()
  const source = obituary.source.toLowerCase()

  // Falsifiability (0-25)
  let falsifiability = 10 // Default: vague but testable
  if (/by \d{4}|before \d{4}|within \d+ years/.test(claim)) {
    falsifiability = 25 // Specific timeline
  } else if (/will never|can't|cannot|impossible/.test(claim)) {
    falsifiability = 20 // Specific capability
  } else if (/decades|years away|far off/.test(claim)) {
    falsifiability = 15 // General timeline
  }

  // Source Authority (0-25)
  let sourceAuthority = 10 // Default: tier 2
  const tier1Sources = [
    'nytimes',
    'wsj',
    'washingtonpost',
    'guardian',
    'bbc',
    'reuters',
    'bloomberg',
    'ft.com',
    'economist',
  ]
  const tier2Sources = [
    'wired',
    'arstechnica',
    'techcrunch',
    'theverge',
    'technologyreview',
  ]
  const expertIndicators = ['professor', 'phd', 'researcher', 'scientist', 'ceo', 'cto']

  if (tier1Sources.some((s) => obituary.sourceUrl?.includes(s))) {
    sourceAuthority = 25
  } else if (tier2Sources.some((s) => obituary.sourceUrl?.includes(s))) {
    sourceAuthority = 15
  }
  if (expertIndicators.some((e) => source.includes(e))) {
    sourceAuthority = Math.min(25, sourceAuthority + 5)
  }

  // Claim Boldness (0-25)
  let claimBoldness = 15 // Default: moderate
  if (/never|impossible|absolutely|definitely/.test(claim)) {
    claimBoldness = 25 // Absolute certainty
  } else if (/won't|confident|certain|surely/.test(claim)) {
    claimBoldness = 20 // Strong conviction
  } else if (/probably|likely|don't think/.test(claim)) {
    claimBoldness = 10 // Hedged
  } else if (/might|maybe|could|doubt/.test(claim)) {
    claimBoldness = 5 // Mild
  }

  // Historical Value (0-25)
  let historicalValue = 10 // Default: relevant expert
  const claimDate = new Date(obituary.date)
  const now = new Date()
  const ageInYears = (now.getTime() - claimDate.getTime()) / (1000 * 60 * 60 * 24 * 365)

  // Older claims have more historical value
  if (ageInYears > 5) {
    historicalValue = 20 // Historical artifact
  } else if (ageInYears > 2) {
    historicalValue = 15 // Notable
  }

  const total = falsifiability + sourceAuthority + claimBoldness + historicalValue

  return {
    falsifiability,
    sourceAuthority,
    claimBoldness,
    historicalValue,
    total,
  }
}

// Detect anti-patterns
function detectAntiPatterns(claim: string): string[] {
  const issues: string[] = []
  const lowerClaim = claim.toLowerCase()

  for (const keyword of ANTI_PATTERNS.reasonableCaution) {
    if (lowerClaim.includes(keyword)) {
      issues.push('Possible reasonable caution (not a doom claim)')
      break
    }
  }

  for (const keyword of ANTI_PATTERNS.riskWarning) {
    if (lowerClaim.includes(keyword)) {
      issues.push('Possible risk warning (opposite thesis)')
      break
    }
  }

  for (const keyword of ANTI_PATTERNS.vagueSentiment) {
    if (lowerClaim.includes(keyword)) {
      issues.push('Vague sentiment without specific prediction')
      break
    }
  }

  return issues
}

// Suggest category based on keywords
function suggestCategory(claim: string, currentCategories: string[]): string | undefined {
  const lowerClaim = claim.toLowerCase()
  let bestMatch: string | undefined
  let bestScore = 0

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchCount = keywords.filter((k) => lowerClaim.includes(k)).length
    if (matchCount > bestScore) {
      bestScore = matchCount
      bestMatch = category
    }
  }

  // Only suggest if different from current
  if (bestMatch && !currentCategories.includes(bestMatch)) {
    // Map legacy 'capability' to check both new categories
    if (currentCategories.includes('capability')) {
      if (bestMatch === 'capability-narrow' || bestMatch === 'capability-reasoning') {
        return bestMatch // Suggest the more specific category
      }
    }
    return bestMatch
  }

  return undefined
}

// Audit a single obituary
function auditObituary(obituary: AuditObituary): AuditResult {
  const qualityScore = scoreHeuristically(obituary)
  const issues = detectAntiPatterns(obituary.claim)
  const suggestedCategory = suggestCategory(obituary.claim, obituary.categories)

  // Determine recommendation
  let recommendation: AuditResult['recommendation'] = 'keep'

  if (issues.length > 0 || qualityScore.total < QUALITY_THRESHOLDS.review) {
    recommendation = 'flag'
  } else if (qualityScore.total < QUALITY_THRESHOLDS.keep) {
    recommendation = 'review'
  }

  if (suggestedCategory) {
    recommendation = 'recategorize'
  }

  return {
    _id: obituary._id,
    slug: obituary.slug,
    claim: obituary.claim,
    source: obituary.source,
    date: obituary.date,
    currentCategories: obituary.categories,
    qualityScore,
    recommendation,
    suggestedCategory,
    issues,
    status: obituary.status,
  }
}

// LLM-assisted scoring (optional, for higher accuracy)
let anthropicClient: Anthropic | null = null

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropicClient
}

async function scorewithLLM(obituary: AuditObituary): Promise<QualityScore | null> {
  const client = getAnthropicClient()
  if (!client) return null

  const prompt = `Score this AI skepticism claim on 4 dimensions (0-25 each):

Claim: "${obituary.claim}"
Source: ${obituary.source}
Date: ${obituary.date}
URL: ${obituary.sourceUrl}

Dimensions:
1. Falsifiability (0-25): How testable? 25=specific timeline+capability, 20=specific capability, 15=general timeline, 10=vague but testable, 5=unfalsifiable
2. Source Authority (0-25): How credible? 25=domain expert+tier1, 20=adjacent expert, 15=notable (10k+), 10=tier2 pub, 5=minor
3. Claim Boldness (0-25): How confident? 25=absolute certainty, 20=strong conviction, 15=moderate, 10=hedged, 5=mild
4. Historical Value (0-25): How significant? 25=widely cited, 20=viral, 15=notable person, 10=relevant expert, 5=artifact

Respond ONLY with JSON: {"falsifiability":N,"sourceAuthority":N,"claimBoldness":N,"historicalValue":N,"total":N}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content.type !== 'text') return null

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    return {
      falsifiability: Math.max(0, Math.min(25, parsed.falsifiability || 0)),
      sourceAuthority: Math.max(0, Math.min(25, parsed.sourceAuthority || 0)),
      claimBoldness: Math.max(0, Math.min(25, parsed.claimBoldness || 0)),
      historicalValue: Math.max(0, Math.min(25, parsed.historicalValue || 0)),
      total: Math.max(0, Math.min(100, parsed.total || 0)),
    }
  } catch (error) {
    console.error('LLM scoring failed:', error)
    return null
  }
}

// Main audit function
async function runAudit(useLLM = false): Promise<AuditReport> {
  console.log('Fetching obituaries from Sanity...')
  const obituaries = await fetchObituaries()
  console.log(`Found ${obituaries.length} obituaries`)

  const results: AuditResult[] = []

  for (let i = 0; i < obituaries.length; i++) {
    const obituary = obituaries[i]
    console.log(`Auditing ${i + 1}/${obituaries.length}: ${obituary.slug}`)

    const result = auditObituary(obituary)

    // Optionally enhance with LLM scoring
    if (useLLM && getAnthropicClient()) {
      const llmScore = await scorewithLLM(obituary)
      if (llmScore) {
        result.qualityScore = llmScore
        // Re-evaluate recommendation with LLM score
        if (result.issues.length > 0 || llmScore.total < QUALITY_THRESHOLDS.review) {
          result.recommendation = 'flag'
        } else if (llmScore.total < QUALITY_THRESHOLDS.keep) {
          result.recommendation = 'review'
        } else {
          result.recommendation = 'keep'
        }
      }
      // Rate limit
      await new Promise((r) => setTimeout(r, 100))
    }

    results.push(result)
  }

  // Calculate summary
  const summary = {
    keep: results.filter((r) => r.recommendation === 'keep').length,
    review: results.filter((r) => r.recommendation === 'review').length,
    flag: results.filter((r) => r.recommendation === 'flag').length,
    recategorize: results.filter((r) => r.recommendation === 'recategorize').length,
  }

  return {
    timestamp: new Date().toISOString(),
    totalObituaries: obituaries.length,
    summary,
    results,
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2)
  const outputArg = args.indexOf('--output')
  const outputFile = outputArg !== -1 ? args[outputArg + 1] : 'audit-report.json'
  const useLLM = args.includes('--llm')

  console.log('=== AI Obituaries Quality Audit ===')
  console.log(`Output: ${outputFile}`)
  console.log(`LLM scoring: ${useLLM ? 'enabled' : 'disabled'}`)
  console.log('')

  try {
    const report = await runAudit(useLLM)

    // Write report
    const fs = await import('fs')
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2))

    // Print summary
    console.log('')
    console.log('=== Audit Complete ===')
    console.log(`Total: ${report.totalObituaries}`)
    console.log(`Keep: ${report.summary.keep}`)
    console.log(`Review: ${report.summary.review}`)
    console.log(`Flag: ${report.summary.flag}`)
    console.log(`Recategorize: ${report.summary.recategorize}`)
    console.log('')
    console.log(`Report saved to: ${outputFile}`)

    // Print flagged items
    const flagged = report.results.filter((r) => r.recommendation === 'flag')
    if (flagged.length > 0) {
      console.log('')
      console.log('=== Flagged Items ===')
      for (const item of flagged.slice(0, 10)) {
        console.log(`- ${item.slug}: ${item.issues.join(', ') || `Score: ${item.qualityScore.total}`}`)
      }
      if (flagged.length > 10) {
        console.log(`... and ${flagged.length - 10} more`)
      }
    }

    // Print recategorize suggestions
    const recategorize = report.results.filter((r) => r.recommendation === 'recategorize')
    if (recategorize.length > 0) {
      console.log('')
      console.log('=== Recategorization Suggestions ===')
      for (const item of recategorize.slice(0, 10)) {
        console.log(
          `- ${item.slug}: ${item.currentCategories.join(',')} → ${item.suggestedCategory}`
        )
      }
      if (recategorize.length > 10) {
        console.log(`... and ${recategorize.length - 10} more`)
      }
    }
  } catch (error) {
    console.error('Audit failed:', error)
    process.exit(1)
  }
}

main()
