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
import { VERDICT_COLORS } from '../lib/constants'
import { fmtTs } from '../lib/format'

function VerdictTimeline({ buckets }: { buckets: Stats['buckets'] }) {
  if (!buckets.length) return <p className="text-sm text-gray-400">데이터 없음</p>
  const data = buckets.map((b) => ({ ...b, ts: fmtTs(b.ts) }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ts" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="allow" stackId="v" fill={VERDICT_COLORS.allow} />
        <Bar dataKey="transform" stackId="v" fill={VERDICT_COLORS.transform} />
        <Bar dataKey="block" stackId="v" fill={VERDICT_COLORS.block} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function CountBar({ rows, field }: { rows: CountRow[]; field: string }) {
  if (!rows.length) return <p className="text-sm text-gray-400">데이터 없음</p>
  const height = Math.min(30 * rows.length + 20, 220)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ left: 24 }}>
        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis type="category" dataKey={field} tick={{ fontSize: 11 }} width={100} />
        <Tooltip />
        <Bar dataKey="count" fill="#4C55C7" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Charts({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-1 text-xs text-gray-500">시간대별 판정</p>
        <VerdictTimeline buckets={stats.buckets} />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-500">조치 분포</p>
        <CountBar rows={stats.by_action} field="action" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-500">목적 분포</p>
        <CountBar rows={stats.by_purpose} field="purpose" />
      </div>
      <div>
        <p className="mb-1 text-xs text-gray-500">엔티티 타입 Top-N</p>
        <CountBar rows={stats.by_entity_type} field="type" />
      </div>
    </div>
  )
}
