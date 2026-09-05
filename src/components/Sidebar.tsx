import type { Stats, VerdictAction } from '../api/types'
import { Card, FilterRow, SearchInput, SegmentedControl } from './ds'
import { ENTITY_TYPES, PURPOSES, WINDOWS } from '../lib/constants'
import type { Filters } from '../lib/filters'

const VERDICTS: VerdictAction[] = ['allow', 'transform', 'block']

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function purposeCount(stats: Stats | null, purpose: string): number {
  return stats?.by_purpose.find((r) => r.purpose === purpose)?.count ?? 0
}

function entityCount(stats: Stats | null, type: string): number {
  return stats?.by_entity_type.find((r) => r.type === type)?.count ?? 0
}

export function Sidebar({
  filters,
  onChange,
  stats,
}: {
  filters: Filters
  onChange: (next: Filters) => void
  stats: Stats | null
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  const directionValue = filters.directions.length === 1 ? filters.directions[0] : 'all'

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-3 p-4">
      <Card padding="md">
        <SearchInput
          value={filters.sessionQ}
          onChange={(v) => set('sessionQ', v.trim())}
          placeholder="세션 검색 (UUID 또는 원본 ID)"
        />

        <div className="mt-5 flex flex-col gap-2.5">
          <div className="text-[13px] font-semibold text-muted">조회 기간</div>
          <SegmentedControl
            columns={2}
            value={filters.window}
            onChange={(v) => set('window', v)}
            options={Object.entries(WINDOWS).map(([label, code]) => ({
              value: code,
              label,
            }))}
          />
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          <div className="text-[13px] font-semibold text-muted">방향</div>
          <SegmentedControl
            columns={3}
            value={directionValue}
            onChange={(v) => set('directions', v === 'all' ? [] : [v])}
            options={[
              { value: 'all', label: '전체' },
              { value: 'input', label: 'input' },
              { value: 'output', label: 'output' },
            ]}
          />
        </div>
      </Card>

      <Card padding="md">
        <div className="text-[13px] font-semibold text-muted">판정</div>
        <div className="mt-1 flex flex-col">
          {VERDICTS.map((v) => (
            <FilterRow
              key={v}
              label={v}
              dotTone={v}
              count={stats?.verdict[v]}
              checked={filters.verdicts.includes(v)}
              onChange={() => set('verdicts', toggle(filters.verdicts, v))}
            />
          ))}
        </div>
      </Card>

      <Card padding="md">
        <div className="text-[13px] font-semibold text-muted">목적</div>
        <div className="mt-1 flex flex-col">
          {PURPOSES.map((p) => (
            <FilterRow
              key={p}
              label={p}
              count={purposeCount(stats, p)}
              checked={filters.purposes.includes(p)}
              onChange={() => set('purposes', toggle(filters.purposes, p))}
            />
          ))}
        </div>
      </Card>

      <Card padding="md">
        <div className="text-[13px] font-semibold text-muted">엔티티 타입</div>
        <div className="mt-1 flex flex-col">
          {ENTITY_TYPES.map((t) => (
            <FilterRow
              key={t}
              label={t}
              count={entityCount(stats, t)}
              checked={filters.entities.includes(t)}
              onChange={() => set('entities', toggle(filters.entities, t))}
            />
          ))}
        </div>
      </Card>
    </aside>
  )
}
