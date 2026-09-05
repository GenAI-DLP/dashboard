import { useEffect, useRef } from 'react'
import { streamEventsUrl } from '../api/client'
import type { Event } from '../api/types'

/**
 * `/events/stream`(SSE) 구독. direction/verdict/sessionId 변경 시 재연결한다.
 */
export function useEventStream(
  params: { direction: string | null; verdict: string | null; sessionId: string | null },
  onEvent: (ev: Event) => void,
  enabled: boolean,
): void {
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  })

  useEffect(() => {
    if (!enabled) return
    const url = streamEventsUrl(params)
    const es = new EventSource(url)
    es.onmessage = (e) => {
      onEventRef.current(JSON.parse(e.data) as Event)
    }
    return () => es.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.direction, params.verdict, params.sessionId, enabled])
}
