import type { Event } from '../api/types'
import { Badge, Chip, Table, Td, Th, Tr } from './ds'
import { fmtTs, shortSid } from '../lib/format'

function entityCounts(entities: Event['entities_summary']): { type: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const e of entities) counts.set(e.type, (counts.get(e.type) ?? 0) + 1)
  return Array.from(counts, ([type, count]) => ({ type, count }))
}

function uniqActions(transforms: Event['transforms']): string {
  return Array.from(new Set(transforms.map((t) => t.action))).join(', ')
}

// 0.8 = dlp-server/app/config.yaml risk.hard_block 실제 값
function riskColorClass(risk: number): string {
  if (risk >= 0.8) return 'bg-block'
  if (risk >= 0.3) return 'bg-transform'
  return 'bg-allow'
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
    <div className="overflow-hidden rounded-xl bg-surface">
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-muted">표시할 이벤트가 없습니다.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>시각</Th>
              <Th>세션</Th>
              <Th>방향</Th>
              <Th>판정</Th>
              <Th>목적</Th>
              <Th>엔티티</Th>
              <Th>조치</Th>
              <Th align="right">guardrail</Th>
              <Th>위험도</Th>
              <Th align="right">latency(ms)</Th>
              <Th>fail</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((ev) => (
              <Tr
                key={ev.event_id}
                onClick={() => onSelect(ev.session_id)}
                className={ev.session_id === selectedSessionId ? 'bg-primary-bg' : ''}
              >
                <Td>{fmtTs(ev.created_at)}</Td>
                <Td>{ev.session_id_raw || shortSid(ev.session_id)}</Td>
                <Td>{ev.direction}</Td>
                <Td>
                  <Badge tone={ev.verdict_action}>{ev.verdict_action}</Badge>
                </Td>
                <Td>{ev.purpose ?? ''}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {entityCounts(ev.entities_summary).map((e) => (
                      <Chip key={e.type}>
                        {e.type} {e.count}
                      </Chip>
                    ))}
                  </div>
                </Td>
                <Td>{uniqActions(ev.transforms)}</Td>
                <Td align="right">{ev.guardrail_hits.length}</Td>
                <Td>
                  {typeof ev.risk_score === 'number' && (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={`h-full ${riskColorClass(ev.risk_score)}`}
                          style={{ width: `${Math.round(ev.risk_score * 100)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-strong">
                        {ev.risk_score.toFixed(2)}
                      </span>
                    </div>
                  )}
                </Td>
                <Td align="right">{ev.latency_ms ?? ''}</Td>
                <Td>
                  {ev.fail_policy_applied ? (
                    <Badge tone="block">fail-closed</Badge>
                  ) : (
                    <span className="text-faint">정상</span>
                  )}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  )
}
