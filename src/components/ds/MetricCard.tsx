import { Card } from './Card'

export function MetricCard({
  label,
  value,
  unit,
  delta,
  caption,
  progress,
  valueTone,
  size = 'lg',
}: {
  label: string
  value: string | number
  unit?: string
  delta?: string
  caption?: string
  progress?: number
  valueTone?: 'block'
  size?: 'lg' | 'md'
}) {
  const valueSize = size === 'lg' ? 'text-[34px] tracking-[-0.03em]' : 'text-[26px] tracking-[-0.02em]'
  const valueColor = valueTone === 'block' ? 'text-block-text' : 'text-strong'
  const topGap = size === 'lg' ? 'mt-3' : 'mt-2.5'

  return (
    <Card padding={size === 'lg' ? 'md' : 'sm'}>
      <div className="text-sm font-semibold text-muted">{label}</div>
      <div className={`${topGap} flex items-baseline gap-1`}>
        <span className={`font-bold ${valueSize} ${valueColor}`}>{value}</span>
        {unit && <span className="text-base font-semibold text-muted">{unit}</span>}
      </div>
      {(delta || caption) && (
        <div className="mt-2.5 flex items-center gap-1.5">
          {delta && (
            <span className="rounded-full bg-primary-bg px-2.5 py-0.5 text-[13px] font-bold text-primary">
              {delta}
            </span>
          )}
          {caption && <span className="text-[13px] text-muted">{caption}</span>}
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </Card>
  )
}
