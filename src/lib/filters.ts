import type { Event } from '../api/types'
import { WINDOWS } from './constants'

export interface Filters {
  window: string
  directions: string[]
  verdicts: string[]
  purposes: string[]
  entities: string[]
  sessionQ: string
  onlyFail: boolean
  intervalMs: number
}

// 헤더 "통계 갱신 주기" 옵션 → /stats 폴링 주기(ms).
export const STATS_REFRESH_OPTIONS: Record<string, number> = {
  '5초': 5000,
  '30초': 30000,
  '1분': 60000,
  '5분': 300000,
}

export const defaultFilters: Filters = {
  window: WINDOWS['최근 1시간'],
  directions: [],
  verdicts: [],
  purposes: [],
  entities: [],
  sessionQ: '',
  onlyFail: false,
  intervalMs: STATS_REFRESH_OPTIONS['5초'],
}

/** /events 파라미터에 없는 축(목적·엔티티) + 다중 선택 값은 여기서 거른다. */
export function clientFilter(rows: Event[], filters: Filters): Event[] {
  return rows.filter((ev) => {
    if (filters.directions.length && !filters.directions.includes(ev.direction)) {
      return false
    }
    if (filters.verdicts.length && !filters.verdicts.includes(ev.verdict_action)) {
      return false
    }
    if (
      filters.purposes.length &&
      !filters.purposes.includes(ev.purpose ?? 'unknown')
    ) {
      return false
    }
    if (filters.entities.length) {
      const types = new Set(ev.entities_summary.map((e) => e.type))
      if (!filters.entities.some((t) => types.has(t))) return false
    }
    if (filters.onlyFail && !ev.fail_policy_applied) return false
    return true
  })
}
