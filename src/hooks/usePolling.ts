import { useEffect } from 'react'

/**
 * `effect` 를 즉시 1회 실행하고, `intervalMs` 가 있으면 그 주기로 반복한다.
 * `effect` 의 참조가 바뀌면(필터 변경 등) 즉시 재실행 후 주기를 다시 잡는다.
 */
export function usePolling(
  effect: () => void,
  intervalMs: number | null,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return
    effect()
    if (intervalMs === null) return
    const id = window.setInterval(effect, intervalMs)
    return () => window.clearInterval(id)
  }, [effect, intervalMs, enabled])
}
