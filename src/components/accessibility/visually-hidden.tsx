/**
 * VisuallyHidden component for screen reader-only content.
 * Wraps content with sr-only class to hide visually but keep accessible.
 *
 * @example
 * ```tsx
 * <VisuallyHidden>47 AI obituaries documented</VisuallyHidden>
 * <VisuallyHidden as="h2">Screen reader heading</VisuallyHidden>
 * ```
 */
export interface VisuallyHiddenProps {
  children: React.ReactNode
  /** Render as a specific element (default: 'span') */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function VisuallyHidden({
  children,
  as: Component = 'span',
}: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>
}
