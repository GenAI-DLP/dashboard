import { useCallback, useState } from 'react'
import { getEvents, getStats } from './api/client'
import type { Event, Stats } from './api/types'
import { AppHeader } from './components/AppHeader'
import { Charts } from './components/Charts'
import { EventTable } from './components/EventTable'
import { ConnectionError } from './components/Header'
import { Kpi } from './components/Kpi'
import { SessionDetail } from './components/SessionDetail'
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
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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
        setLastUpdated(new Date())
      })
      .catch((exc) => setError(String(exc)))
  }, [filters])

  usePolling(refresh, filters.intervalMs, health.status === 'ok')

  if (health.status === 'loading') return null

  const connected = health.status === 'ok'
  const filteredEvents = clientFilter(events, filters)

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        connected={connected}
        lastUpdated={lastUpdated}
        intervalMs={filters.intervalMs}
        onIntervalChange={(intervalMs) => setFilters((f) => ({ ...f, intervalMs }))}
      />
      <div className="flex flex-1">
        <Sidebar filters={filters} onChange={setFilters} />
        <main className="flex-1 p-4">
          {!connected && (
            <ConnectionError error={health.status === 'error' ? health.error : undefined} />
          )}
          {connected && error && <p className="text-block-text">조회 실패: {error}</p>}
          {stats && (
            <div className="mt-4 space-y-4">
              <Kpi stats={stats} />
              <Charts stats={stats} />
            </div>
          )}
          <div className="mt-4">
            <EventTable
              rows={filteredEvents}
              selectedSessionId={selectedSessionId}
              onSelect={setSelectedSessionId}
            />
          </div>
          {selectedSessionId && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">세션 상세</h2>
                <button
                  type="button"
                  className="rounded border px-2 py-1 text-sm"
                  onClick={() => setSelectedSessionId(null)}
                >
                  닫기
                </button>
              </div>
              <SessionDetail key={selectedSessionId} sessionId={selectedSessionId} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
