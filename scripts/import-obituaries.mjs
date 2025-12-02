// Import obituaries from markdown research output to Sanity
// Usage:
//   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx \
//   NEXT_PUBLIC_SANITY_DATASET=production \
//   SANITY_WRITE_TOKEN=xxxx \
//   node scripts/import-obituaries.mjs

import { createClient } from 'next-sanity'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !token) {
  console.error(
    'Missing env vars: set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN'
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

// Generate URL-safe slug from claim text
function generateSlug(claim, index) {
  const base = claim
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
    .replace(/-+$/, '')
  return `${base}-${index}`
}

// Parse date string to ISO format (YYYY-MM-DD)
function parseDate(dateStr) {
  // Handle formats like "February 23, 2017", "May 2014", "2016", "November 2018–January 2019"
  const str = dateStr.split('–')[0].split('(')[0].trim() // Take first date if range

  const monthNames = {
    january: '01', february: '02', march: '03', april: '04',
    may: '05', june: '06', july: '07', august: '08',
    september: '09', october: '10', november: '11', december: '12'
  }

  // Try "Month DD, YYYY" or "Month YYYY"
  const fullMatch = str.match(/(\w+)\s+(\d{1,2})?,?\s*(\d{4})/i)
  if (fullMatch) {
    const month = monthNames[fullMatch[1].toLowerCase()] || '01'
    const day = fullMatch[2] ? fullMatch[2].padStart(2, '0') : '01'
    const year = fullMatch[3]
    return `${year}-${month}-${day}`
  }

  // Try just year
  const yearMatch = str.match(/(\d{4})/)
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`
  }

  return '2020-01-01' // fallback
}

// Parse the markdown file
function parseMarkdown(content) {
  const entries = []

  // Split by ### headers (each entry starts with ### followed by number)
  const sections = content.split(/^### \d+\./gm).slice(1) // Skip first empty split

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const entry = {}

    // Extract title (first line)
    const titleMatch = section.match(/^(.+?)(?:\n|$)/)
    entry.title = titleMatch ? titleMatch[1].trim() : `Entry ${i + 1}`

    // Extract claim
    const claimMatch = section.match(/\*\*Claim:\*\*\s*(.+?)(?=\n\n|\n\*\*Source)/s)
    entry.claim = claimMatch ? claimMatch[1].replace(/\n/g, ' ').trim().replace(/^[""]|[""]$/g, '') : entry.title

    // Extract source
    const sourceMatch = section.match(/\*\*Source:\*\*\s*(.+?)(?=\n\n|\n\*\*Date)/s)
    entry.source = sourceMatch ? sourceMatch[1].replace(/\n/g, ' ').trim() : 'Unknown'

    // Extract date
    const dateMatch = section.match(/\*\*Date:\*\*\s*(.+?)(?=\n\n|\n\*\*URL)/s)
    entry.date = dateMatch ? parseDate(dateMatch[1].trim()) : '2020-01-01'

    // Extract URL
    const urlMatch = section.match(/\*\*URL:\*\*\s*(https?:\/\/[^\s\n]+)/)
    entry.sourceUrl = urlMatch ? urlMatch[1].trim() : 'https://example.com'

    // Extract category
    const categoryMatch = section.match(/\*\*Category:\*\*\s*(\w+)/)
    entry.categories = categoryMatch ? [categoryMatch[1].toLowerCase()] : ['dismissive']

    // Extract "why it aged poorly" as note
    const agedMatch = section.match(/\*\*Why it aged poorly:\*\*\s*(.+?)(?=\n---|\n###|$)/s)
    entry.note = agedMatch ? agedMatch[1].replace(/\n/g, ' ').trim() : ''

    // Generate slug
    entry.slug = generateSlug(entry.claim, i + 1)

    // Generate stable _id
    entry._id = `obituary-${entry.slug}`

    if (entry.claim && entry.claim.length > 10) {
      entries.push(entry)
    }
  }

  return entries
}

async function run() {
  const mdPath = resolve(process.cwd(), 'AI Skepticism Claims Archive.md')
  console.log(`Reading: ${mdPath}`)

  const content = readFileSync(mdPath, 'utf-8')
  const entries = parseMarkdown(content)

  console.log(`\nParsed ${entries.length} entries. Uploading to Sanity...\n`)

  let success = 0
  let failed = 0

  for (const entry of entries) {
    const doc = {
      _id: entry._id,
      _type: 'obituary',
      claim: entry.claim,
      source: entry.source,
      sourceUrl: entry.sourceUrl,
      date: entry.date,
      categories: entry.categories,
      slug: { _type: 'slug', current: entry.slug },
      context: entry.note ? { note: entry.note } : {},
    }

    try {
      await client.createOrReplace(doc)
      console.log(`  ✔ [${entry.categories[0]}] ${entry.claim.substring(0, 60)}...`)
      success++
    } catch (err) {
      console.error(`  ✘ Failed: ${entry.claim.substring(0, 40)}... - ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Done: ${success} imported, ${failed} failed`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
