import { type SchemaTypeDefinition } from 'sanity'

/**
 * Schema types for embedded Sanity Studio.
 *
 * NOTE: Content types (obituary, skeptic, source, etc.) are managed via
 * Sanity's cloud dashboard at https://sanity.io/manage, not locally.
 *
 * This embedded studio configuration is kept for potential future local
 * schema management. The actual schema is defined in the Sanity project
 * dashboard for project ID specified in NEXT_PUBLIC_SANITY_PROJECT_ID.
 *
 * To add local schema types:
 * 1. Create type definitions in this directory (e.g., obituary.ts)
 * 2. Import and add them to the types array below
 * 3. Run `npx sanity schema deploy` to sync with cloud
 */
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [],
}
