import { BASE_URL } from '../api/client'

export function ConnectionError({ error }: { error?: string }) {
  return (
    <div className="rounded-xl bg-block-bg p-4">
      <p className="font-semibold text-block-text">
        🔴 연결 실패
      </p>
      {error && <p className="mt-2 text-sm text-block-text">{error}</p>}
    </div>
  )
}
