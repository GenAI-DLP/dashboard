import type { Stats } from '../api/types'
import { Card, MetricCard } from './ds'

export function Kpi({ stats }: { stats: Stats }) {
  const { totals, verdict, latency_ms: lat } = stats
  const byAction = Object.fromEntries(stats.by_action.map((r) => [r.action as string, r.count]))

  const total = totals.events || 0
  const { allow, transform, block } = verdict
  const fail = stats.fail_closed
  const p95 = lat.p95 || 0
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0)
  const allowPct = pct(allow)
  const transformPct = pct(transform)
  const blockPct = pct(block)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="총 판정 수"
          value={total.toLocaleString()}
          unit="건"
          caption={`input ${totals.input} · output ${totals.output}`}
        />

        <Card padding="md">
          <div className="text-sm font-semibold text-muted">판정 비율</div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[34px] font-bold tracking-[-0.03em] text-allow-text">
              {allowPct}
            </span>
            <span className="text-xl text-faint">/</span>
            <span className="text-[34px] font-bold tracking-[-0.03em] text-transform-text">
              {transformPct}
            </span>
            <span className="text-xl text-faint">/</span>
            <span className="text-[34px] font-bold tracking-[-0.03em] text-block-text">
              {blockPct}
            </span>
            <span className="text-base font-semibold text-muted">%</span>
          </div>
          <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full">
            <div className="bg-allow" style={{ width: `${allowPct}%` }} />
            <div className="bg-transform" style={{ width: `${transformPct}%` }} />
            <div className="bg-block" style={{ width: `${blockPct}%` }} />
          </div>
          <div className="mt-2 text-[13px] text-muted">allow / transform / block</div>
        </Card>

        <MetricCard
          label="p95 지연시간"
          value={p95}
          unit="ms"
          caption={`평균 ${lat.avg} ms`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          size="md"
          label="토큰화 엔티티"
          value={byAction.tokenize ?? 0}
          unit="건"
          caption="토큰으로 치환된 엔티티 수"
        />
        <MetricCard size="md" label="guardrail 적중" value={stats.guardrail_hits} unit="건" />
        <MetricCard
          size="md"
          label="fail-closed 차단"
          value={fail}
          unit="건"
          valueTone={fail ? 'block' : undefined}
          caption={fail ? '⚠ 장애로 강제 차단' : undefined}
        />
      </div>

      <p className="text-[13px] text-muted">
        활성 세션 {totals.sessions} · 집계 기준 {stats.generated_at}
      </p>
    </div>
  )
}
