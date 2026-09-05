import type { Stats } from '../api/types'

const LATENCY_BUDGET_MS = 600

function ratio(a: number, t: number, b: number, total: number): string {
  if (!total) return '데이터 없음'
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`
  return `allow ${pct(a)} · transform ${pct(t)} · block ${pct(b)}`
}

function Metric({
  label,
  value,
  help,
  delta,
  warn,
}: {
  label: string
  value: string | number
  help?: string
  delta?: number
  warn?: string
}) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {delta !== undefined && (
        <div className={delta > 0 ? 'text-xs text-red-600' : 'text-xs text-green-600'}>
          {delta > 0 ? '+' : ''}
          {delta}
        </div>
      )}
      {help && <div className="text-xs text-gray-400">{help}</div>}
      {warn && <div className="text-xs text-amber-600">{warn}</div>}
    </div>
  )
}

export function Kpi({ stats }: { stats: Stats }) {
  const { totals, verdict, latency_ms: lat } = stats
  const byAction = Object.fromEntries(
    stats.by_action.map((r) => [r.action as string, r.count]),
  )

  const total = totals.events || 0
  const { allow, transform, block } = verdict
  const fail = stats.fail_closed
  const p95 = lat.p95 || 0

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric
          label="총 판정"
          value={total.toLocaleString()}
          help={`input ${totals.input} · output ${totals.output}`}
        />
        <Metric
          label="allow / transform / block"
          value={`${allow} / ${transform} / ${block}`}
          help={ratio(allow, transform, block, total)}
        />
        <Metric
          label="토큰화 엔티티"
          value={byAction.tokenize ?? 0}
          help="가역 보호로 치환된 엔티티 수"
        />
        <Metric label="guardrail 적중" value={stats.guardrail_hits} />
        <Metric
          label="latency p95 (ms)"
          value={p95}
          delta={p95 ? Math.round((p95 - LATENCY_BUDGET_MS) * 10) / 10 : undefined}
          help={`평균 ${lat.avg} ms · 로컬 목표 ${LATENCY_BUDGET_MS} ms`}
        />
        <Metric
          label="fail-closed"
          value={fail}
          warn={fail ? '⚠ 장애로 강제 차단' : undefined}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">
        활성 세션 {totals.sessions} · 집계 기준 {stats.generated_at}
      </p>
    </div>
  )
}
