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
  intervalMs: number | null
}

// 사이드바 "자동 새로고침" 라디오 → 폴링 주기(ms). 끄기 = null.
export const REFRESH_OPTIONS: Record<string, number | null> = {
  끄기: null,
  '3초': 3000,
  '5초': 5000,
}

export const defaultFilters: Filters = {
  window: WINDOWS['최근 1시간'],
  directions: [],
  verdicts: [],
  purposes: [],
  entities: [],
  sessionQ: '',
  onlyFail: false,
  intervalMs: REFRESH_OPTIONS['5초'],
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
