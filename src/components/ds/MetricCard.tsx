import { Card } from './Card'

export function MetricCard({
  label,
  value,
  unit,
  delta,
  caption,
  progress,
}: {
  label: string
  value: string | number
  unit?: string
  delta?: string
  caption?: string
  progress?: number
}) {
  return (
    <Card padding="md">
      <div className="text-sm font-semibold text-muted">{label}</div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[34px] font-bold tracking-[-0.03em] text-strong">{value}</span>
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
