export type Tone = 'allow' | 'transform' | 'block' | 'primary' | 'neutral'

const DOT_CLASSES: Record<Tone, string> = {
  allow: 'bg-allow',
  transform: 'bg-transform',
  block: 'bg-block',
  primary: 'bg-primary',
  neutral: 'bg-faint',
}

export function StatusDot({
  tone = 'neutral',
  className = '',
}: {
  tone?: Tone
  className?: string
}) {
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_CLASSES[tone]} ${className}`} />
}
