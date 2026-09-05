import type { Event } from '../api/types'
import { VERDICT_EMOJI } from '../lib/constants'
import { fmtTs, shortSid } from '../lib/format'

function uniq(values: string[]): string {
  return Array.from(new Set(values.filter(Boolean))).join(', ')
}

export function EventTable({
  rows,
  selectedSessionId,
  onSelect,
}: {
  rows: Event[]
  selectedSessionId: string | null
  onSelect: (sessionId: string) => void
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">
        🔒 원문 미저장 — 엔티티는 타입·마스킹 프리뷰만 표시
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">
          표시할 이벤트가 없습니다. dlp-server 에서 `python scripts/demo_seed.py` 실행.
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="p-1">시각</th>
                <th className="p-1">세션</th>
                <th className="p-1">방향</th>
                <th className="p-1">판정</th>
                <th className="p-1">목적</th>
                <th className="p-1">엔티티</th>
                <th className="p-1">조치</th>
                <th className="p-1">guardrail</th>
                <th className="p-1">risk</th>
                <th className="p-1">latency(ms)</th>
                <th className="p-1">fail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ev) => (
                <tr
                  key={ev.event_id}
                  onClick={() => onSelect(ev.session_id)}
                  className={`cursor-pointer border-b hover:bg-gray-50 ${
                    ev.session_id === selectedSessionId ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-1">{fmtTs(ev.created_at)}</td>
                  <td className="p-1">{ev.session_id_raw || shortSid(ev.session_id)}</td>
                  <td className="p-1">{ev.direction}</td>
                  <td className="p-1">
                    {VERDICT_EMOJI[ev.verdict_action]} {ev.verdict_action}
                  </td>
                  <td className="p-1">{ev.purpose ?? ''}</td>
                  <td className="p-1">{uniq(ev.entities_summary.map((e) => e.type))}</td>
                  <td className="p-1">{uniq(ev.transforms.map((t) => t.action))}</td>
                  <td className="p-1">{ev.guardrail_hits.length}</td>
                  <td className="p-1">
                    {typeof ev.risk_score === 'number' ? ev.risk_score.toFixed(2) : ''}
                  </td>
                  <td className="p-1">{ev.latency_ms ?? ''}</td>
                  <td className="p-1">{ev.fail_policy_applied ? '⚠' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
