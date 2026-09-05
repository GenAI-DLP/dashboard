import type { ReactNode } from 'react'
import type { Tone } from './StatusDot'

const TONE_CLASSES: Record<Tone, string> = {
  allow: 'bg-allow-bg text-allow-text',
  transform: 'bg-transform-bg text-transform-text',
  block: 'bg-block-bg text-block-text',
  primary: 'bg-primary-bg text-primary',
  neutral: 'bg-surface-muted text-secondary',
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-bold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
