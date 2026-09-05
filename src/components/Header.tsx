import { BASE_URL } from '../api/client'
import type { HealthResponse } from '../api/types'

export function HealthCaption({ data }: { data: HealthResponse }) {
  return (
    <p className="text-sm text-gray-500">
      🟢 dlp-server 연결됨 · DB {data.db ?? '?'} · {BASE_URL}
    </p>
  )
}

export function HealthError({ error }: { error: string }) {
  return (
    <div className="p-4 text-red-600">
      <p>
        🔴 dlp-server 연결 실패 — VITE_API_BASE({BASE_URL}) 를 확인하세요.
      </p>
      <p className="mt-2 text-sm">{error}</p>
    </div>
  )
}
