/**
 * Seed Skeptics Script
 *
 * Adds verified AI skeptic profiles to Sanity CMS.
 * Run with: bun scripts/seed-skeptics.ts
 *
 * Requires SANITY_WRITE_TOKEN environment variable.
 */

import { createSkeptics, filterNewSkeptics, type SkepticDraft } from '../src/lib/sanity/mutations'

const skeptics: SkepticDraft[] = [
  {
    _type: 'skeptic',
    name: 'Gary Marcus',
    slug: { _type: 'slug', current: 'gary-marcus' },
    bio: 'Professor Emeritus of Psychology and Neural Science at NYU, cognitive scientist, author of "Rebooting AI", and founder of Geometric Intelligence (acquired by Uber). Known for challenging deep learning limitations and AI hype.',
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com/GaryMarcus' },
      { platform: 'substack', url: 'https://garymarcus.substack.com' },
      { platform: 'website', url: 'http://garymarcus.com' },
      { platform: 'wikipedia', url: 'https://en.wikipedia.org/wiki/Gary_Marcus' },
    ],
  },
  {
    _type: 'skeptic',
    name: 'Yann LeCun',
    slug: { _type: 'slug', current: 'yann-lecun' },
    bio: 'Chief AI Scientist at Meta, Silver Professor at NYU, and 2018 Turing Award laureate. Pioneer of convolutional neural networks who argues current LLMs are a "dead end" for AGI.',
    profiles: [
      { platform: 'twitter', url: 'https://x.com/ylecun' },
      { platform: 'website', url: 'https://yann.lecun.org/' },
      { platform: 'wikipedia', url: 'https://en.wikipedia.org/wiki/Yann_LeCun' },
    ],
  },
  {
    _type: 'skeptic',
    name: 'Emily M. Bender',
    slug: { _type: 'slug', current: 'emily-bender' },
    bio: 'Professor of Linguistics at University of Washington and co-author of the influential "Stochastic Parrots" paper critiquing the risks and limitations of large language models.',
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com/emilymbender' },
      { platform: 'website', url: 'https://faculty.washington.edu/ebender/' },
    ],
  },
  {
    _type: 'skeptic',
    name: 'Timnit Gebru',
    slug: { _type: 'slug', current: 'timnit-gebru' },
    bio: 'Founder of DAIR Institute and co-author of "Stochastic Parrots". Known for research on algorithmic bias and the "Gender Shades" study exposing facial recognition bias.',
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com/timnitGebru' },
      { platform: 'website', url: 'https://www.dair-institute.org/' },
      { platform: 'wikipedia', url: 'https://en.wikipedia.org/wiki/Timnit_Gebru' },
    ],
  },
  {
    _type: 'skeptic',
    name: 'François Chollet',
    slug: { _type: 'slug', current: 'francois-chollet' },
    bio: 'Creator of Keras deep learning library and the ARC-AGI benchmark. Co-founder of ARC Prize arguing that LLMs confuse skill with intelligence and won\'t lead to AGI.',
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com/fchollet' },
      { platform: 'website', url: 'https://fchollet.com/' },
      { platform: 'linkedin', url: 'https://www.linkedin.com/in/fchollet' },
      { platform: 'wikipedia', url: 'https://en.wikipedia.org/wiki/Fran%C3%A7ois_Chollet' },
    ],
  },
  {
    _type: 'skeptic',
    name: 'Melanie Mitchell',
    slug: { _type: 'slug', current: 'melanie-mitchell' },
    bio: 'Professor at Santa Fe Institute and author of "Artificial Intelligence: A Guide for Thinking Humans". Known for questioning AI\'s understanding capabilities through complexity science lens.',
    profiles: [
      { platform: 'twitter', url: 'https://twitter.com/MelMitchell1' },
      { platform: 'website', url: 'https://melaniemitchell.me/' },
      { platform: 'wikipedia', url: 'https://en.wikipedia.org/wiki/Melanie_Mitchell' },
    ],
  },
]

async function main() {
  console.log('🔍 Checking for existing skeptics...')

  // Filter out skeptics that already exist
  const newSkeptics = await filterNewSkeptics(skeptics)

  if (newSkeptics.length === 0) {
    console.log('✅ All skeptics already exist in Sanity. Nothing to add.')
    return
  }

  console.log(`📝 Adding ${newSkeptics.length} new skeptics...`)
  newSkeptics.forEach((s) => console.log(`   - ${s.name}`))

  const { createdIds, failedNames } = await createSkeptics(newSkeptics)

  console.log('\n📊 Results:')
  console.log(`   ✅ Created: ${createdIds.length}`)
  if (failedNames.length > 0) {
    console.log(`   ❌ Failed: ${failedNames.join(', ')}`)
  }

  if (createdIds.length > 0) {
    console.log('\n🎉 Successfully added skeptics to Sanity!')
    console.log('   Run `bun dev` and visit /skeptics to see them.')
  }
}

main().catch(console.error)
