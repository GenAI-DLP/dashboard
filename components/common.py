"""대시보드 공용 상수·포맷 유틸."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))

# 사이드바 기간 선택 → /stats·/events 의 window 문자열
WINDOWS: dict[str, str] = {
    "최근 15분": "15m",
    "최근 1시간": "1h",
    "최근 6시간": "6h",
    "최근 24시간": "24h",
}

# verdict 3값 고정 색 (allow=녹색 · transform=호박 · block=적색). 라이트/다크 모두 대비 확보.
VERDICT_COLORS: dict[str, str] = {
    "allow": "#2E7D32",
    "transform": "#F9A825",
    "block": "#C62828",
}
VERDICT_EMOJI: dict[str, str] = {"allow": "🟢", "transform": "🟡", "block": "🔴"}

# 정책 목적 코드 (docs/schemas/dlp-server/postgres-schema.sql 의 purpose_ref)
PURPOSES: list[str] = [
    "customer_support",
    "doc_summarize",
    "code_help",
    "data_analysis",
    "fraud_investigation",
    "unknown",
]

# 엔티티 타입 (entity_type_ref)
ENTITY_TYPES: list[str] = [
    "RRN",
    "FOREIGN_RRN",
    "CARD",
    "ACCOUNT",
    "PHONE",
    "EMAIL",
    "PASSPORT",
    "DRIVER",
    "BIZNO",
    "NAME",
    "CREDIT_INFO",
    "AMOUNT",
]

_UNIT_KWARG = {"m": "minutes", "h": "hours"}


def window_since(window: str) -> datetime:
    """``15m`` / ``1h`` ... → 지금(KST)에서 그만큼 뺀 시각."""
    n, unit = int(window[:-1]), window[-1]
    return datetime.now(KST) - timedelta(**{_UNIT_KWARG[unit]: n})


def fmt_ts(iso: str | None) -> str:
    """API 의 KST ISO 문자열 → ``MM-DD HH:MM:SS``. 파싱 실패 시 원본."""
    if not iso:
        return "-"
    try:
        return datetime.fromisoformat(iso).strftime("%m-%d %H:%M:%S")
    except ValueError:
        return iso


def short_sid(session_id: str | None) -> str:
    return (session_id or "")[:8]
