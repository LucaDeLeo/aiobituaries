import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('vitest is configured correctly', () => {
    expect(true).toBe(true)
  })

  it('can use testing-library matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello World'
    document.body.appendChild(element)
    expect(element).toBeInTheDocument()
    document.body.removeChild(element)
  })
})
