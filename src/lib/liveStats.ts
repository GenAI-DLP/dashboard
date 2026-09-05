import type { Event, Stats } from '../api/types'

/**
 * SSE로 새 이벤트가 올 때마다 KPI 카드 상단의 단순 누적값만 즉시 반영한다.
 * by_purpose/by_entity_type/by_action/buckets/latency 는 sliding window 재계산이 필요해
 * 여기서 건드리지 않고, 다음 /stats 폴링(주기 보정)에서 서버 값으로 덮어써 드리프트를 없앤다.
 */
export function incrementStats(stats: Stats, ev: Event): Stats {
  return {
    ...stats,
    totals: {
      ...stats.totals,
      events: stats.totals.events + 1,
      input: stats.totals.input + (ev.direction === 'input' ? 1 : 0),
      output: stats.totals.output + (ev.direction === 'output' ? 1 : 0),
    },
    verdict: {
      ...stats.verdict,
      [ev.verdict_action]: stats.verdict[ev.verdict_action] + 1,
    },
    guardrail_hits: stats.guardrail_hits + (ev.guardrail_hits.length > 0 ? 1 : 0),
    fail_closed: stats.fail_closed + (ev.fail_policy_applied ? 1 : 0),
  }
}
