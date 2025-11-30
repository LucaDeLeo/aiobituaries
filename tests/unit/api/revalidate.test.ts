import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock next/cache before importing route handler
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { POST } from '@/app/api/revalidate/route'
import { revalidatePath } from 'next/cache'

const VALID_SECRET = 'test-secret-12345'

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set the environment variable for tests
    process.env.SANITY_WEBHOOK_SECRET = VALID_SECRET
  })

  afterEach(() => {
    delete process.env.SANITY_WEBHOOK_SECRET
  })

  describe('Authentication', () => {
    it('returns 401 when x-sanity-webhook-secret header is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body).toEqual({ error: 'Invalid secret' })
    })

    it('returns 401 when secret is incorrect', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': 'wrong-secret',
        },
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body).toEqual({ error: 'Invalid secret' })
    })

    it('returns 401 when secret is empty string', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': '',
        },
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(401)
      expect(body).toEqual({ error: 'Invalid secret' })
    })
  })

  describe('Successful Revalidation', () => {
    it('returns 200 with { revalidated: true } when secret is valid', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': VALID_SECRET,
        },
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({ revalidated: true })
    })

    it('calls revalidatePath for homepage', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': VALID_SECRET,
        },
      })

      await POST(request)

      expect(revalidatePath).toHaveBeenCalledWith('/')
    })

    it('calls revalidatePath for claims page', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': VALID_SECRET,
        },
      })

      await POST(request)

      expect(revalidatePath).toHaveBeenCalledWith('/claims')
    })

    it('calls revalidatePath for obituary dynamic routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': VALID_SECRET,
        },
      })

      await POST(request)

      expect(revalidatePath).toHaveBeenCalledWith('/obituary/[slug]', 'page')
    })

    it('calls revalidatePath exactly 3 times', async () => {
      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': VALID_SECRET,
        },
      })

      await POST(request)

      expect(revalidatePath).toHaveBeenCalledTimes(3)
    })
  })

  describe('Environment Variable Usage', () => {
    it('validates against SANITY_WEBHOOK_SECRET env var', async () => {
      // Change the env var to a different value
      process.env.SANITY_WEBHOOK_SECRET = 'different-secret'

      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': 'different-secret',
        },
      })

      const response = await POST(request)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toEqual({ revalidated: true })
    })

    it('fails when env var is not set', async () => {
      delete process.env.SANITY_WEBHOOK_SECRET

      const request = new NextRequest('http://localhost:3000/api/revalidate', {
        method: 'POST',
        headers: {
          'x-sanity-webhook-secret': 'any-secret',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })
  })
})
