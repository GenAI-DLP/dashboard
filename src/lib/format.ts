const UNIT_MS: Record<string, number> = { m: 60_000, h: 3_600_000 }

/** `15m` / `1h` ... → 지금부터 그만큼 뺀 시각. */
export function windowSince(window: string): Date {
  const match = /^(\d+)([mh])$/.exec(window)
  if (!match) throw new Error(`잘못된 window: ${window}`)
  const [, n, unit] = match
  return new Date(Date.now() - Number(n) * UNIT_MS[unit])
}

/**
 * API 의 KST ISO 문자열(`...+09:00`) → `MM-DD HH:MM:SS`.
 * 브라우저 로컬 타임존으로 변환하지 않고 문자열을 그대로 파싱한다.
 */
export function fmtTs(iso: string | null | undefined): string {
  if (!iso) return '-'
  const match = /^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(iso)
  if (!match) return iso
  const [, month, day, hour, minute, second] = match
  return `${month}-${day} ${hour}:${minute}:${second}`
}

export function shortSid(sessionId: string | null | undefined): string {
  return (sessionId ?? '').slice(0, 8)
}

/** Date → `HH:MM:SS` (브라우저 로컬 시각). */
export function fmtClock(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
