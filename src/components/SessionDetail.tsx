import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getSession, getVaultAccess } from '../api/client'
import type { Event, VaultAccessRow } from '../api/types'
import { VERDICT_EMOJI } from '../lib/constants'
import { fmtTs, shortSid } from '../lib/format'
import { Metric } from './Metric'

const RISK_HARD_BLOCK = 0.6

function isNum(v: unknown): v is number {
  return typeof v === 'number'
}

function RiskTrend({ timeline }: { timeline: Event[] }) {
  const pts = timeline
    .map((e, i) => ({ turn: i, risk: e.risk_score }))
    .filter((p): p is { turn: number; risk: number } => isNum(p.risk))
  if (pts.length < 2) return null
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={pts}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="turn" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
        <Tooltip />
        <ReferenceLine y={RISK_HARD_BLOCK} stroke="#C62828" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="risk" stroke="#4C55C7" dot />
      </LineChart>
    </ResponsiveContainer>
  )
}

function EventCard({ ev }: { ev: Event }) {
  let head = `${fmtTs(ev.created_at)} · ${ev.direction} · ${VERDICT_EMOJI[ev.verdict_action]} ${ev.verdict_action}`
  if (ev.note) head += ` · ${ev.note}`
  return (
    <div className="rounded border p-3">
      <p className="font-semibold">{head}</p>
      {ev.entities_summary.length > 0 && (
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="p-1">type</th>
              <th className="p-1">masked_preview</th>
              <th className="p-1">confidence</th>
            </tr>
          </thead>
          <tbody>
            {ev.entities_summary.map((e, i) => (
              <tr key={i}>
                <td className="p-1">{e.type}</td>
                <td className="p-1">{e.masked_preview ?? ''}</td>
                <td className="p-1">{e.confidence ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {ev.transforms.length > 0 && (
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-gray-500">
              <th className="p-1">entity</th>
              <th className="p-1">action</th>
              <th className="p-1">token_label</th>
            </tr>
          </thead>
          <tbody>
            {ev.transforms.map((t, i) => (
              <tr key={i}>
                <td className="p-1">{t.entity}</td>
                <td className="p-1">{t.action}</td>
                <td className="p-1">{t.token_label ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {ev.guardrail_hits.length > 0 && (
        <p className="mt-2 text-xs text-amber-700">
          guardrail: {ev.guardrail_hits.map((h) => h.type).join(', ')}
        </p>
      )}
    </div>
  )
}

function VaultPanel({ rows }: { rows: VaultAccessRow[] }) {
  if (!rows.length) return null
  return (
    <div className="mt-4">
      <h3 className="font-semibold">토큰 복원 시도</h3>
      <table className="mt-2 w-full text-left text-xs">
        <thead>
          <tr className="text-gray-500">
            <th className="p-1">accessed_at</th>
            <th className="p-1">token_label</th>
            <th className="p-1">requested_role</th>
            <th className="p-1">requested_purpose</th>
            <th className="p-1">granted</th>
            <th className="p-1">denied_reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.access_id}>
              <td className="p-1">{fmtTs(r.accessed_at)}</td>
              <td className="p-1">{r.token_label ?? ''}</td>
              <td className="p-1">{r.requested_role ?? ''}</td>
              <td className="p-1">{r.requested_purpose ?? ''}</td>
              <td className="p-1">{String(r.granted)}</td>
              <td className="p-1">{r.denied_reason ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const [timeline, setTimeline] = useState<Event[] | null>(null)
  const [vault, setVault] = useState<VaultAccessRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSession(sessionId)
      .then(setTimeline)
      .catch((exc) => setError(String(exc)))
    getVaultAccess(sessionId)
      .then(setVault)
      .catch(() => setVault([]))
  }, [sessionId])

  if (error) return <p className="text-red-600">세션 조회 실패: {error}</p>
  if (timeline === null) return null
  if (timeline.length === 0) {
    return <p className="text-sm text-gray-500">이 세션의 이벤트가 없습니다.</p>
  }

  const first = timeline[0]
  const risks = timeline.map((e) => e.risk_score).filter(isNum)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="세션" value={shortSid(sessionId)} />
        <Metric label="원본 식별자" value={first.session_id_raw ?? '-'} />
        <Metric label="이벤트 수" value={timeline.length} />
        <Metric
          label="최종 risk"
          value={risks.length ? risks[risks.length - 1].toFixed(2) : '-'}
        />
      </div>

      <RiskTrend timeline={timeline} />

      <div className="mt-4 space-y-3">
        {timeline.map((ev) => (
          <EventCard key={ev.event_id} ev={ev} />
        ))}
      </div>

      <VaultPanel rows={vault} />

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-500">
          원시 판정 근거 (JSON)
        </summary>
        <pre className="mt-2 overflow-x-auto text-xs">
          {JSON.stringify(
            Object.fromEntries(timeline.map((ev, i) => [i, ev.reason])),
            null,
            2,
          )}
        </pre>
      </details>
    </div>
  )
}
