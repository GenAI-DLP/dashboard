import type { ReactNode } from 'react'

export type ChipTone = 'neutral' | 'transform' | 'block'

const TONE_CLASSES: Record<ChipTone, string> = {
  neutral: 'bg-surface-muted text-secondary',
  transform: 'bg-transform-bg text-transform-text',
  block: 'bg-block-bg text-block-text',
}

export function Chip({
  tone = 'neutral',
  children,
}: {
  tone?: ChipTone
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2.5 py-1 text-[13px] font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
