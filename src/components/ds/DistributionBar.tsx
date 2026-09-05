export function DistributionBar({
  label,
  value,
  share,
  pct,
  highlight = false,
}: {
  label: string
  value: string | number
  share: string | number
  pct: number
  highlight?: boolean
}) {
  return (
    <div className="relative h-[38px] overflow-hidden rounded-md bg-surface-muted">
      <div
        className={`absolute inset-y-0 left-0 rounded-md ${highlight ? 'bg-primary-bg-strong' : 'bg-border'}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
      <div className="relative flex h-full items-center justify-between gap-3 px-3.5 text-sm">
        <span className="font-medium text-strong">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-strong">{value}</span>
          <span className="w-[42px] text-right text-[13px] font-medium text-secondary">
            {share}%
          </span>
        </div>
      </div>
    </div>
  )
}
