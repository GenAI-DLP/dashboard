import { useCallback, useState } from 'react'
import { health as fetchHealth } from '../api/client'
import type { HealthResponse } from '../api/types'
import { usePolling } from './usePolling'

export type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; data: HealthResponse }
  | { status: 'error'; error: string }

const HEALTH_INTERVAL_MS = 5000

export function useHealth(): HealthState {
  const [state, setState] = useState<HealthState>({ status: 'loading' })

  const check = useCallback(() => {
    fetchHealth()
      .then((data) => setState({ status: 'ok', data }))
      .catch((exc) => setState({ status: 'error', error: String(exc) }))
  }, [])

  usePolling(check, HEALTH_INTERVAL_MS)

  return state
}
