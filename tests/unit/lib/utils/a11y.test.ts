import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  handleKeyboardNavigation,
  generateId,
  isFocusable,
  getFocusableElements,
} from '@/lib/utils/a11y'

describe('a11y utilities', () => {
  describe('handleKeyboardNavigation', () => {
    it('calls onEnter handler for Enter key', () => {
      const onEnter = vi.fn()
      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(event, { onEnter })

      expect(onEnter).toHaveBeenCalledOnce()
      expect(event.preventDefault).toHaveBeenCalledOnce()
    })

    it('calls onSpace handler for Space key', () => {
      const onSpace = vi.fn()
      const event = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(event, { onSpace })

      expect(onSpace).toHaveBeenCalledOnce()
      expect(event.preventDefault).toHaveBeenCalledOnce()
    })

    it('calls onEscape handler for Escape key', () => {
      const onEscape = vi.fn()
      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(event, { onEscape })

      expect(onEscape).toHaveBeenCalledOnce()
      expect(event.preventDefault).toHaveBeenCalledOnce()
    })

    it('calls arrow handlers for arrow keys', () => {
      const onArrowUp = vi.fn()
      const onArrowDown = vi.fn()
      const onArrowLeft = vi.fn()
      const onArrowRight = vi.fn()

      const handlers = { onArrowUp, onArrowDown, onArrowLeft, onArrowRight }

      const upEvent = { key: 'ArrowUp', preventDefault: vi.fn() } as unknown as React.KeyboardEvent
      const downEvent = { key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent
      const leftEvent = { key: 'ArrowLeft', preventDefault: vi.fn() } as unknown as React.KeyboardEvent
      const rightEvent = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(upEvent, handlers)
      handleKeyboardNavigation(downEvent, handlers)
      handleKeyboardNavigation(leftEvent, handlers)
      handleKeyboardNavigation(rightEvent, handlers)

      expect(onArrowUp).toHaveBeenCalledOnce()
      expect(onArrowDown).toHaveBeenCalledOnce()
      expect(onArrowLeft).toHaveBeenCalledOnce()
      expect(onArrowRight).toHaveBeenCalledOnce()
    })

    it('calls onHome and onEnd handlers', () => {
      const onHome = vi.fn()
      const onEnd = vi.fn()

      const homeEvent = { key: 'Home', preventDefault: vi.fn() } as unknown as React.KeyboardEvent
      const endEvent = { key: 'End', preventDefault: vi.fn() } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(homeEvent, { onHome })
      handleKeyboardNavigation(endEvent, { onEnd })

      expect(onHome).toHaveBeenCalledOnce()
      expect(onEnd).toHaveBeenCalledOnce()
    })

    it('calls onTab handler without preventDefault', () => {
      const onTab = vi.fn()
      const event = {
        key: 'Tab',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(event, { onTab })

      expect(onTab).toHaveBeenCalledOnce()
      expect(event.preventDefault).not.toHaveBeenCalled()
    })

    it('does not call preventDefault when handler is undefined', () => {
      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent

      handleKeyboardNavigation(event, {})

      expect(event.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('generateId', () => {
    it('generates unique IDs with default prefix', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).toMatch(/^a11y-\d+$/)
      expect(id2).toMatch(/^a11y-\d+$/)
      expect(id1).not.toBe(id2)
    })

    it('generates unique IDs with custom prefix', () => {
      const id1 = generateId('label')
      const id2 = generateId('desc')

      expect(id1).toMatch(/^label-\d+$/)
      expect(id2).toMatch(/^desc-\d+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('isFocusable', () => {
    beforeEach(() => {
      // Clear DOM before each test
      document.body.innerHTML = ''
    })

    it('returns false for non-HTMLElement', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      expect(isFocusable(svg)).toBe(false)
    })

    it('returns false for hidden elements', () => {
      const button = document.createElement('button')
      button.hidden = true
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(false)
    })

    it('returns false for aria-hidden elements', () => {
      const button = document.createElement('button')
      button.setAttribute('aria-hidden', 'true')
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(false)
    })

    it('returns false for display:none elements', () => {
      const button = document.createElement('button')
      button.style.display = 'none'
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(false)
    })

    it('returns false for visibility:hidden elements', () => {
      const button = document.createElement('button')
      button.style.visibility = 'hidden'
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(false)
    })

    it('returns false for negative tabindex', () => {
      const button = document.createElement('button')
      button.setAttribute('tabindex', '-1')
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(false)
    })

    it('returns false for disabled elements', () => {
      const button = document.createElement('button')
      button.disabled = true
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(false)
    })

    it('returns true for visible button', () => {
      const button = document.createElement('button')
      document.body.appendChild(button)

      expect(isFocusable(button)).toBe(true)
    })

    it('returns true for link with href', () => {
      const link = document.createElement('a')
      link.href = '#'
      document.body.appendChild(link)

      expect(isFocusable(link)).toBe(true)
    })

    it('returns true for element with positive tabindex', () => {
      const div = document.createElement('div')
      div.setAttribute('tabindex', '0')
      document.body.appendChild(div)

      expect(isFocusable(div)).toBe(true)
    })

    it('returns true for input element', () => {
      const input = document.createElement('input')
      document.body.appendChild(input)

      expect(isFocusable(input)).toBe(true)
    })
  })

  describe('getFocusableElements', () => {
    beforeEach(() => {
      // Clear DOM before each test
      document.body.innerHTML = ''
    })

    it('returns empty array for container with no focusable elements', () => {
      const container = document.createElement('div')
      container.innerHTML = '<span>Not focusable</span>'
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toEqual([])
    })

    it('returns all focusable elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="btn1">Button 1</button>
        <a href="#" id="link1">Link</a>
        <input id="input1" />
        <span>Not focusable</span>
        <button id="btn2">Button 2</button>
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(4)
      expect(focusable.map((el) => el.id)).toEqual(['btn1', 'link1', 'input1', 'btn2'])
    })

    it('excludes disabled elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="btn1">Enabled</button>
        <button id="btn2" disabled>Disabled</button>
        <input id="input1" />
        <input id="input2" disabled />
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(2)
      expect(focusable.map((el) => el.id)).toEqual(['btn1', 'input1'])
    })

    it('excludes negative tabindex elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="btn1">Normal</button>
        <button id="btn2" tabindex="-1">Negative tabindex</button>
        <div id="div1" tabindex="0">Positive tabindex</div>
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(2)
      expect(focusable.map((el) => el.id)).toEqual(['btn1', 'div1'])
    })

    it('excludes hidden elements', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <button id="btn1">Visible</button>
        <button id="btn2" style="display: none">Hidden</button>
        <button id="btn3" style="visibility: hidden">Hidden</button>
        <button id="btn4" aria-hidden="true">ARIA hidden</button>
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(1)
      expect(focusable.map((el) => el.id)).toEqual(['btn1'])
    })

    it('includes various focusable element types', () => {
      const container = document.createElement('div')
      container.innerHTML = `
        <a href="#" id="link">Link</a>
        <button id="button">Button</button>
        <input id="input" />
        <select id="select"><option>Option</option></select>
        <textarea id="textarea"></textarea>
        <div tabindex="0" id="div">Custom focusable</div>
      `
      document.body.appendChild(container)

      const focusable = getFocusableElements(container)
      expect(focusable).toHaveLength(6)
      expect(focusable.map((el) => el.id)).toEqual([
        'link',
        'button',
        'input',
        'select',
        'textarea',
        'div',
      ])
    })
  })
})
