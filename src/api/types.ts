export type Direction = 'input' | 'output'
export type VerdictAction = 'allow' | 'block' | 'transform'

export interface Transform {
  entity: string
  action: string
  token_label?: string
}

export interface EntitySummary {
  type: string
  masked_preview?: string
  confidence?: number
}

export interface GuardrailHit {
  type: string
  pattern?: string
}

export interface Event {
  event_id: number
  session_id: string
  session_id_raw: string | null
  direction: Direction
  provider: string | null
  purpose: string | null
  verdict_action: VerdictAction
  transforms: Transform[]
  entities_summary: EntitySummary[]
  guardrail_hits: GuardrailHit[]
  fail_policy_applied: boolean
  latency_ms: number | null
  risk_score: number | null
  note: string | null
  created_at: string | null
  /** /events/{session_id} 응답에만 포함되는 판정 원시 근거 */
  reason?: Record<string, unknown>
}

export interface HealthResponse {
  status: string
  db: string
}

export interface CountRow {
  count: number
  [key: string]: string | number
}

export interface Stats {
  window: string
  generated_at: string | null
  totals: {
    events: number
    sessions: number
    input: number
    output: number
  }
  verdict: {
    allow: number
    block: number
    transform: number
  }
  guardrail_hits: number
  fail_closed: number
  latency_ms: {
    avg: number
    p95: number
  }
  by_purpose: CountRow[]
  by_entity_type: CountRow[]
  by_action: CountRow[]
  buckets: {
    ts: string | null
    allow: number
    block: number
    transform: number
  }[]
}

export interface VaultAccessRow {
  access_id: number
  token_id: string
  session_id: string
  token_label: string | null
  requested_role: string | null
  requested_purpose: string | null
  granted: boolean
  denied_reason: string | null
  accessed_at: string | null
}
