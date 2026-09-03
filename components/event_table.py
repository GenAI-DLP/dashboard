"""실시간 이벤트 테이블 — ``/events``.

원문은 절대 싣지 않는다. 엔티티는 타입만, 판정 근거의 세부는 드릴다운에서 본다.
"""

from __future__ import annotations

import pandas as pd
import streamlit as st

from components.common import VERDICT_EMOJI, fmt_ts, short_sid

_COLS = [
    "시각",
    "세션",
    "방향",
    "판정",
    "목적",
    "엔티티",
    "조치",
    "guardrail",
    "risk",
    "latency(ms)",
    "fail",
]


def _uniq(values: list[str]) -> str:
    return ", ".join(dict.fromkeys(v for v in values if v))


def _row(ev: dict) -> dict:
    risk = ev.get("risk_score")
    verdict = ev.get("verdict_action", "")
    return {
        "시각": fmt_ts(ev.get("created_at")),
        "세션": ev.get("session_id_raw") or short_sid(ev.get("session_id")),
        "방향": ev.get("direction", ""),
        "판정": f"{VERDICT_EMOJI.get(verdict, '')} {verdict}".strip(),
        "목적": ev.get("purpose") or "",
        "엔티티": _uniq([e.get("type", "") for e in ev.get("entities_summary", [])]),
        "조치": _uniq([t.get("action", "") for t in ev.get("transforms", [])]),
        "guardrail": len(ev.get("guardrail_hits", [])),
        "risk": f"{risk:.2f}" if isinstance(risk, int | float) else "",
        "latency(ms)": ev.get("latency_ms", ""),
        "fail": "⚠" if ev.get("fail_policy_applied") else "",
    }


def render(rows: list[dict]) -> str | None:
    """이벤트 테이블을 그리고, 선택된 행의 session_id 를 돌려준다(없으면 None)."""
    st.caption("🔒 원문 미저장 — 엔티티는 타입·마스킹 프리뷰만 표시")
    if not rows:
        st.info("표시할 이벤트가 없습니다. dlp-server 에서 `python scripts/demo_seed.py` 실행.")
        return None

    df = pd.DataFrame([_row(e) for e in rows], columns=_COLS)
    event = st.dataframe(
        df,
        width="stretch",
        hide_index=True,
        on_select="rerun",
        selection_mode="single-row",
    )
    selected = event.selection.rows
    return rows[selected[0]].get("session_id") if selected else None
