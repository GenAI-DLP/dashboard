import { useCallback, useState } from 'react'
import { getEvents, getStats } from './api/client'
import type { Event, Stats } from './api/types'
import { AppHeader } from './components/AppHeader'
import { Charts } from './components/Charts'
import { PillTabs } from './components/ds'
import { EventTable } from './components/EventTable'
import { FiltersSummary } from './components/FiltersSummary'
import { ConnectionError } from './components/Header'
import { Kpi } from './components/Kpi'
import { SessionDetail } from './components/SessionDetail'
import { Sidebar } from './components/Sidebar'
import { useHealth } from './hooks/useHealth'
import { usePolling } from './hooks/usePolling'
import { clientFilter, defaultFilters, type Filters } from './lib/filters'
import { windowSince } from './lib/format'

type Tab = 'overview' | 'events'

function App() {
  const health = useHealth()
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [stats, setStats] = useState<Stats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [tab, setTab] = useState<Tab>('overview')

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

  const filteredEvents = clientFilter(events, filters)
  const selectedVisible =
    !!selectedSessionId && filteredEvents.some((e) => e.session_id === selectedSessionId)
  const visibleSessionId = selectedVisible ? selectedSessionId : null

  if (health.status === 'loading') return null

  const connected = health.status === 'ok'

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader
        connected={connected}
        lastUpdated={lastUpdated}
        intervalMs={filters.intervalMs}
        onIntervalChange={(intervalMs) => setFilters((f) => ({ ...f, intervalMs }))}
      />
      <div className="flex flex-1">
        <Sidebar filters={filters} onChange={setFilters} stats={stats} />
        <main className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          {!connected && (
            <ConnectionError error={health.status === 'error' ? health.error : undefined} />
          )}
          {connected && error && <p className="text-block-text">조회 실패: {error}</p>}

          <PillTabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'overview', label: '개요' },
              { value: 'events', label: '이벤트 & 드릴다운' },
            ]}
          />

          <FiltersSummary
            filters={filters}
            onChange={setFilters}
            total={stats?.totals.events ?? 0}
          />

          {tab === 'overview' && stats && (
            <div className="flex flex-col gap-3">
              <Kpi stats={stats} />
              <Charts stats={stats} />
            </div>
          )}

          {tab === 'events' && (
            <>
              <EventTable
                rows={filteredEvents}
                selectedSessionId={visibleSessionId}
                onSelect={setSelectedSessionId}
              />
              {visibleSessionId && (
                <SessionDetail
                  key={visibleSessionId}
                  sessionId={visibleSessionId}
                  onClose={() => setSelectedSessionId(null)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
