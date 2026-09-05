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
import { Badge, Card, Chip, Table, Td, Th, Tr } from './ds'
import { fmtTs, shortSid } from '../lib/format'

// dlp-server/app/config.yaml risk.hard_block 값과 맞춰야 한다 (코드 기본값 0.6 아님)
const RISK_HARD_BLOCK = 0.8

function isNum(v: unknown): v is number {
  return typeof v === 'number'
}

function groupCounts<T>(items: T[], key: (item: T) => string): { key: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const item of items) {
    const k = key(item)
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  return Array.from(counts, ([k, count]) => ({ key: k, count }))
}

function RiskTrend({ timeline }: { timeline: Event[] }) {
  const pts = timeline
    .map((e, i) => ({ turn: i, risk: e.risk_score }))
    .filter((p): p is { turn: number; risk: number } => isNum(p.risk))

  return (
    <Card variant="subtle" padding="md">
      <div className="flex items-baseline gap-2.5">
        <div className="text-[15px] font-bold text-strong">세션 위험도 추이</div>
        <div className="flex-1" />
        <div className="text-[13px] text-muted">
          risk 0.00–1.00 · 차단 기준 {RISK_HARD_BLOCK.toFixed(2)}
        </div>
      </div>
      {pts.length < 2 ? (
        <p className="mt-3 text-sm text-faint">추이를 그리기엔 이벤트가 부족합니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={pts} margin={{ top: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="turn"
              tick={{ fontSize: 11, fill: 'var(--color-faint)' }}
              label={{ value: '이벤트 순번', position: 'insideBottom', offset: -4, fontSize: 11 }}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: 'var(--color-faint)' }}
            />
            <Tooltip />
            <ReferenceLine
              y={RISK_HARD_BLOCK}
              stroke="var(--color-block)"
              strokeDasharray="4 4"
            />
            <Line type="monotone" dataKey="risk" stroke="var(--color-primary)" dot />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

function EventCard({ ev }: { ev: Event }) {
  const guardrailGroups = groupCounts(ev.guardrail_hits, (h) => h.type)
  return (
    <Card variant={ev.verdict_action === 'block' ? 'dangerSubtle' : 'subtle'} padding="md">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-semibold text-secondary">{fmtTs(ev.created_at)}</span>
        <span className="text-sm text-muted">{ev.direction}</span>
        <Badge tone={ev.verdict_action}>{ev.verdict_action}</Badge>
        {ev.purpose && <span className="text-sm text-secondary">{ev.purpose}</span>}
        <div className="flex-1" />
        <span className="text-[13px] text-muted">
          {isNum(ev.risk_score) ? `risk ${ev.risk_score.toFixed(2)} · ` : ''}
          {ev.latency_ms ?? '-'}ms
        </span>
      </div>
      {ev.note && <p className="mt-1.5 text-[13px] text-muted">{ev.note}</p>}

      {(ev.entities_summary.length > 0 || ev.transforms.length > 0) && (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          {ev.entities_summary.length > 0 && (
            <div>
              <div className="mb-1.5 text-[13px] font-semibold text-muted">탐지된 엔티티</div>
              <Table>
                <thead>
                  <tr>
                    <Th>type</Th>
                    <Th>masked_preview</Th>
                    <Th align="right">confidence</Th>
                  </tr>
                </thead>
                <tbody>
                  {ev.entities_summary.map((e, i) => (
                    <Tr key={i}>
                      <Td>{e.type}</Td>
                      <Td>{e.masked_preview ?? ''}</Td>
                      <Td align="right">{e.confidence ?? ''}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {ev.transforms.length > 0 && (
            <div>
              <div className="mb-1.5 text-[13px] font-semibold text-muted">적용된 조치</div>
              <Table>
                <thead>
                  <tr>
                    <Th>entity</Th>
                    <Th>action</Th>
                    <Th>token_label</Th>
                  </tr>
                </thead>
                <tbody>
                  {ev.transforms.map((t, i) => (
                    <Tr key={i}>
                      <Td>{t.entity}</Td>
                      <Td>{t.action}</Td>
                      <Td>{t.token_label ?? ''}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      )}

      {guardrailGroups.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {guardrailGroups.map((g) => (
            <Chip key={g.key} tone="block">
              guardrail · {g.key} {g.count}
            </Chip>
          ))}
        </div>
      )}
    </Card>
  )
}

function VaultPanel({ rows }: { rows: VaultAccessRow[] }) {
  if (!rows.length) return null
  return (
    <Card variant="subtle" padding="md">
      <h3 className="text-[15px] font-bold text-strong">토큰 복원 시도</h3>
      <div className="mt-3">
        <Table>
          <thead>
            <tr>
              <Th>시각</Th>
              <Th>토큰</Th>
              <Th>요청 역할</Th>
              <Th>목적</Th>
              <Th>결과</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <Tr key={r.access_id}>
                <Td>{fmtTs(r.accessed_at)}</Td>
                <Td>{r.token_label ?? ''}</Td>
                <Td>{r.requested_role ?? ''}</Td>
                <Td>{r.requested_purpose ?? ''}</Td>
                <Td>
                  {r.granted ? (
                    <Badge tone="allow">승인</Badge>
                  ) : (
                    <Badge tone="block">거부</Badge>
                  )}
                  {!r.granted && r.denied_reason && (
                    <span className="ml-2 text-[13px] text-muted">{r.denied_reason}</span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}

function SessionSummary({ timeline }: { timeline: Event[] }) {
  const inputCount = timeline.filter((e) => e.direction === 'input').length
  const outputCount = timeline.filter((e) => e.direction === 'output').length
  const tokenizeCount = timeline.reduce(
    (sum, e) => sum + e.transforms.filter((t) => t.action === 'tokenize').length,
    0,
  )
  const guardrailCount = timeline.reduce((sum, e) => sum + e.guardrail_hits.length, 0)
  const failCount = timeline.filter((e) => e.fail_policy_applied).length

  const rows: [string, string | number][] = [
    ['provider', timeline[0]?.provider ?? '-'],
    ['input / output', `${inputCount} / ${outputCount}`],
    ['토큰화 엔티티', `${tokenizeCount}건`],
    ['guardrail 적중', `${guardrailCount}건`],
    ['fail-closed', `${failCount}건`],
  ]

  return (
    <Card variant="subtle" padding="md">
      <h3 className="text-[15px] font-bold text-strong">세션 요약</h3>
      <div className="mt-3 flex flex-col gap-2.5 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <span className="text-muted">{label}</span>
            <span className="font-semibold text-strong">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SessionDetail({
  sessionId,
  onClose,
}: {
  sessionId: string
  onClose: () => void
}) {
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

  const risks = timeline?.map((e) => e.risk_score).filter(isNum) ?? []
  const lastRisk = risks.length ? risks[risks.length - 1] : null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-base font-bold text-strong">세션 상세</h2>
        <Badge tone="primary">{shortSid(sessionId)}</Badge>
        {timeline && (
          <span className="text-sm text-muted">이벤트 {timeline.length}건</span>
        )}
        <div className="flex-1" />
        {lastRisk !== null && (
          <div className="flex items-baseline gap-2 text-sm text-muted">
            최종 위험도
            <span
              className={`text-xl font-bold ${lastRisk >= RISK_HARD_BLOCK ? 'text-block-text' : 'text-strong'}`}
            >
              {lastRisk.toFixed(2)}
            </span>
          </div>
        )}
        <button
          type="button"
          className="rounded-md bg-surface-muted px-3 py-1.5 text-sm font-semibold text-secondary"
          onClick={onClose}
        >
          닫기
        </button>
      </div>

      {error && <p className="text-block-text">세션 조회 실패: {error}</p>}

      {timeline && timeline.length === 0 && (
        <p className="text-sm text-muted">이 세션의 이벤트가 없습니다.</p>
      )}

      {timeline && timeline.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3">
            <RiskTrend timeline={timeline} />
            {timeline.map((ev) => (
              <EventCard key={ev.event_id} ev={ev} />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <VaultPanel rows={vault} />
            <SessionSummary timeline={timeline} />
            <Card variant="subtle" padding="none" className="overflow-hidden">
              <details>
                <summary className="cursor-pointer p-4 text-sm text-muted">
                  원시 판정 근거 (JSON)
                </summary>
                <pre className="overflow-x-auto px-4 pb-4 text-xs text-secondary">
                  {JSON.stringify(
                    Object.fromEntries(timeline.map((ev, i) => [i, ev.reason])),
                    null,
                    2,
                  )}
                </pre>
              </details>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
