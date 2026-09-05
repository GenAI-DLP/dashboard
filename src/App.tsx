import { useCallback, useState } from 'react'
import { getEvents, getStats } from './api/client'
import type { Event, Stats } from './api/types'
import { Charts } from './components/Charts'
import { HealthCaption, HealthError } from './components/Header'
import { Kpi } from './components/Kpi'
import { Sidebar } from './components/Sidebar'
import { useHealth } from './hooks/useHealth'
import { usePolling } from './hooks/usePolling'
import { clientFilter, defaultFilters, type Filters } from './lib/filters'
import { windowSince } from './lib/format'

function App() {
  const health = useHealth()
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [stats, setStats] = useState<Stats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    Promise.all([
      getStats(filters.window),
      getEvents({
        limit: 300,
        direction: filters.directions.length === 1 ? filters.directions[0] : null,
        verdict: filters.verdicts.length === 1 ? filters.verdicts[0] : null,
        sessionId: filters.sessionQ || null,
        since: windowSince(filters.window),
      }),
    ])
      .then(([s, rows]) => {
        setStats(s)
        setEvents(rows)
        setError(null)
      })
      .catch((exc) => setError(String(exc)))
  }, [filters])

  usePolling(refresh, filters.intervalMs, health.status === 'ok')

  if (health.status === 'loading') return null
  if (health.status === 'error') return <HealthError error={health.error} />

  const filteredEvents = clientFilter(events, filters)

  return (
    <div className="flex min-h-screen">
      <Sidebar filters={filters} onChange={setFilters} />
      <main className="flex-1 p-4">
        <HealthCaption data={health.data} />
        {error && <p className="text-red-600">조회 실패: {error}</p>}
        {stats && (
          <div className="mt-4 space-y-4">
            <Kpi stats={stats} />
            <Charts stats={stats} />
          </div>
        )}
        {/* 이벤트 테이블 · 세션 드릴다운은 다음 커밋에서 이어붙임 */}
        <p className="mt-4 text-sm text-gray-500">
          이벤트 {filteredEvents.length}건
        </p>
      </main>
    </div>
  )
}

export default App
