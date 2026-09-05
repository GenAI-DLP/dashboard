import type { Direction, VerdictAction } from '../api/types'
import { ENTITY_TYPES, PURPOSES, VERDICT_EMOJI, WINDOWS } from '../lib/constants'
import type { Filters } from '../lib/filters'
import { REFRESH_OPTIONS } from '../lib/filters'

const DIRECTIONS: Direction[] = ['input', 'output']
const VERDICTS: VerdictAction[] = ['allow', 'transform', 'block']

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function Sidebar({
  filters,
  onChange,
}: {
  filters: Filters
  onChange: (next: Filters) => void
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value })

  const refreshLabel =
    Object.entries(REFRESH_OPTIONS).find(([, v]) => v === filters.intervalMs)?.[0] ??
    '끄기'

  return (
    <aside className="w-64 shrink-0 space-y-4 border-r p-4 text-sm">
      <h2 className="font-semibold">필터</h2>

      <div>
        <label className="mb-1 block text-xs text-gray-500">기간</label>
        <select
          className="w-full border px-1 py-0.5"
          value={filters.window}
          onChange={(e) => set('window', e.target.value)}
        >
          {Object.entries(WINDOWS).map(([label, code]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="mb-1 text-xs text-gray-500">방향</legend>
        {DIRECTIONS.map((d) => (
          <label key={d} className="mr-3 inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={filters.directions.includes(d)}
              onChange={() => set('directions', toggle(filters.directions, d))}
            />
            {d}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-xs text-gray-500">판정</legend>
        {VERDICTS.map((v) => (
          <label key={v} className="block">
            <input
              type="checkbox"
              checked={filters.verdicts.includes(v)}
              onChange={() => set('verdicts', toggle(filters.verdicts, v))}
            />{' '}
            {VERDICT_EMOJI[v]} {v}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-xs text-gray-500">목적</legend>
        {PURPOSES.map((p) => (
          <label key={p} className="block">
            <input
              type="checkbox"
              checked={filters.purposes.includes(p)}
              onChange={() => set('purposes', toggle(filters.purposes, p))}
            />{' '}
            {p}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-xs text-gray-500">엔티티 타입</legend>
        {ENTITY_TYPES.map((t) => (
          <label key={t} className="block">
            <input
              type="checkbox"
              checked={filters.entities.includes(t)}
              onChange={() => set('entities', toggle(filters.entities, t))}
            />{' '}
            {t}
          </label>
        ))}
      </fieldset>

      <div>
        <label className="mb-1 block text-xs text-gray-500">
          세션 검색 (UUID 또는 원본 ID)
        </label>
        <input
          type="text"
          className="w-full border px-1 py-0.5"
          value={filters.sessionQ}
          onChange={(e) => set('sessionQ', e.target.value.trim())}
        />
      </div>

      <label className="block">
        <input
          type="checkbox"
          checked={filters.onlyFail}
          onChange={(e) => set('onlyFail', e.target.checked)}
        />{' '}
        fail-closed 만
      </label>

      <fieldset>
        <legend className="mb-1 text-xs text-gray-500">자동 새로고침</legend>
        {Object.keys(REFRESH_OPTIONS).map((label) => (
          <label key={label} className="mr-3 inline-flex items-center gap-1">
            <input
              type="radio"
              name="refresh"
              checked={refreshLabel === label}
              onChange={() => set('intervalMs', REFRESH_OPTIONS[label])}
            />
            {label}
          </label>
        ))}
      </fieldset>
    </aside>
  )
}
