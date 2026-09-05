/**
 * dlp-server 읽기 API fetch 클라이언트.
 *
 * env `VITE_API_BASE` (기본 `http://localhost:8000`).
 * 네트워크·HTTP 오류는 모두 `ApiError` 로 감싸 한 곳에서 처리한다.
 *
 */
import type { Event, HealthResponse, Stats, VaultAccessRow } from './types'

export const BASE_URL: string =
  import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export class ApiError extends Error {}

type Params = Record<string, string | number | boolean | null | undefined>

function buildUrl(path: string, params: Params = {}): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return `${BASE_URL}${path}${query ? `?${query}` : ''}`
}

async function apiGet<T>(path: string, params: Params = {}): Promise<T> {
  const url = buildUrl(path, params)

  let res: Response
  try {
    res = await fetch(url)
  } catch (exc) {
    throw new ApiError(`${path} → 연결 실패: ${exc}`)
  }
  if (!res.ok) {
    const body = await res.text()
    throw new ApiError(`${path} → ${res.status} ${body.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

export function health(): Promise<HealthResponse> {
  return apiGet('/health')
}

export function getEvents(options: {
  limit?: number
  direction?: string | null
  verdict?: string | null
  sessionId?: string | null
  since?: Date | null
}): Promise<Event[]> {
  const { limit = 300, direction, verdict, sessionId, since } = options
  return apiGet('/events', {
    limit,
    direction,
    verdict,
    session_id: sessionId,
    since: since ? since.toISOString() : undefined,
  })
}

export function getSession(sessionId: string): Promise<Event[]> {
  return apiGet(`/events/${sessionId}`)
}

/** /events/stream(SSE) URL. 필터 의미는 getEvents 와 동일(direction/verdict/sessionId 만). */
export function streamEventsUrl(options: {
  direction?: string | null
  verdict?: string | null
  sessionId?: string | null
}): string {
  const { direction, verdict, sessionId } = options
  return buildUrl('/events/stream', {
    direction,
    verdict,
    session_id: sessionId,
  })
}

export function getStats(window: string = '1h'): Promise<Stats> {
  return apiGet('/stats', { window })
}

export function getVaultAccess(
  sessionId: string,
  limit: number = 100,
): Promise<VaultAccessRow[]> {
  return apiGet('/vault-access', { session_id: sessionId, limit })
}
