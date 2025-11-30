import { createClient } from 'next-sanity'

/**
 * Sanity CMS client configured for read operations.
 * Uses CDN for faster reads in production.
 */
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})
