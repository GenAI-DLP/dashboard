import type { ReactNode } from 'react'

export type CardVariant = 'surface' | 'subtle' | 'dangerSubtle'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: 'bg-surface rounded-xl',
  subtle: 'bg-surface-subtle rounded-lg',
  dangerSubtle: 'bg-surface-danger-subtle rounded-lg',
}

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({
  variant = 'surface',
  padding = 'md',
  className = '',
  children,
}: {
  variant?: CardVariant
  padding?: CardPadding
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`${VARIANT_CLASSES[variant]} ${PADDING_CLASSES[padding]} ${className}`}>
      {children}
    </div>
  )
}
