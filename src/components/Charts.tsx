import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CountRow, Stats } from '../api/types'
import { DistributionBar } from './ds'
import { VERDICT_COLORS } from '../lib/constants'
import { fmtTs } from '../lib/format'

function VerdictTimeline({ buckets }: { buckets: Stats['buckets'] }) {
  if (!buckets.length) return <p className="text-sm text-faint">데이터 없음</p>
  const data = buckets.map((b) => ({ ...b, ts: fmtTs(b.ts) }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="ts" tick={{ fontSize: 11, fill: 'var(--color-faint)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-faint)' }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="allow" stackId="v" fill={VERDICT_COLORS.allow} radius={[4, 4, 0, 0]} />
        <Bar dataKey="transform" stackId="v" fill={VERDICT_COLORS.transform} />
        <Bar dataKey="block" stackId="v" fill={VERDICT_COLORS.block} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function Distribution({
  rows,
  field,
  total,
}: {
  rows: CountRow[]
  field: string
  total: number
}) {
  if (!rows.length) return <p className="text-sm text-faint">데이터 없음</p>
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <DistributionBar
          key={String(r[field])}
          label={String(r[field])}
          value={r.count.toLocaleString()}
          share={total ? ((r.count / total) * 100).toFixed(1) : '0.0'}
          pct={Math.round((r.count / max) * 100)}
          highlight={r.count === max}
        />
      ))}
    </div>
  )
}

export function Charts({ stats }: { stats: Stats }) {
  const total = stats.totals.events
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <div className="rounded-xl bg-surface p-5">
        <p className="mb-3 text-sm font-bold text-strong">시간대별 판정</p>
        <VerdictTimeline buckets={stats.buckets} />
      </div>
      <div className="rounded-xl bg-surface p-5">
        <p className="mb-3 text-sm font-bold text-strong">조치 분포</p>
        <Distribution rows={stats.by_action} field="action" total={total} />
      </div>
      <div className="rounded-xl bg-surface p-5">
        <p className="mb-3 text-sm font-bold text-strong">목적 분포</p>
        <Distribution rows={stats.by_purpose} field="purpose" total={total} />
      </div>
      <div className="rounded-xl bg-surface p-5">
        <p className="mb-3 text-sm font-bold text-strong">엔티티 타입 Top-N</p>
        <Distribution rows={stats.by_entity_type} field="type" total={total} />
      </div>
    </div>
  )
}
