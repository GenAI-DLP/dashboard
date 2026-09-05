import { Card, Toggle } from './ds'
import { WINDOWS } from '../lib/constants'
import type { Filters } from '../lib/filters'

function windowLabel(code: string): string {
  return Object.entries(WINDOWS).find(([, v]) => v === code)?.[0] ?? code
}

export function FiltersSummary({
  filters,
  onChange,
  total,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  total: number
}) {
  const directionLabel = filters.directions.length === 1 ? filters.directions[0] : '전체'
  const verdictLabel = filters.verdicts.length ? filters.verdicts.join(' · ') : '전체'

  return (
    <Card padding="sm">
      <div className="flex items-center gap-3.5">
        <span className="shrink-0 text-[13px] font-semibold text-muted">적용 필터</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-body">
          {windowLabel(filters.window)} · 방향 {directionLabel} · 판정 {verdictLabel}
        </span>
        <div className="flex shrink-0 items-center gap-2.5">
          <Toggle
            checked={filters.onlyFail}
            onChange={(v) => onChange({ ...filters, onlyFail: v })}
          />
          <span className="text-sm font-medium text-body">fail-closed 건만 보기</span>
        </div>
        <div className="h-4 w-px shrink-0 bg-border" />
        <span className="shrink-0 text-sm text-muted">
          총 <span className="text-[15px] font-bold text-strong">{total.toLocaleString()}</span>건
        </span>
      </div>
    </Card>
  )
}
