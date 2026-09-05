import type { VerdictAction } from '../api/types'

// 사이드바 기간 선택 → /stats·/events 의 window 문자열
export const WINDOWS: Record<string, string> = {
  '최근 15분': '15m',
  '최근 1시간': '1h',
  '최근 6시간': '6h',
  '최근 24시간': '24h',
}

// verdict 3값 고정 색 (allow=녹색 · transform=호박 · block=적색)
export const VERDICT_COLORS: Record<VerdictAction, string> = {
  allow: 'var(--color-allow)',
  transform: 'var(--color-transform)',
  block: 'var(--color-block)',
}

export const VERDICT_EMOJI: Record<VerdictAction, string> = {
  allow: '🟢',
  transform: '🟡',
  block: '🔴',
}

// 정책 목적 코드 (docs/schemas/dlp-server/postgres-schema.sql 의 purpose_ref)
export const PURPOSES: string[] = [
  'customer_support',
  'doc_summarize',
  'code_help',
  'data_analysis',
  'fraud_investigation',
  'unknown',
]

// 엔티티 타입 (entity_type_ref)
export const ENTITY_TYPES: string[] = [
  'RRN',
  'FOREIGN_RRN',
  'CARD',
  'ACCOUNT',
  'PHONE',
  'EMAIL',
  'PASSPORT',
  'DRIVER',
  'BIZNO',
  'NAME',
  'CREDIT_INFO',
  'AMOUNT',
]
