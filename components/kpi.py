"""상단 KPI 행 — ``/stats`` 요약."""

from __future__ import annotations

import streamlit as st


def _ratio(a: int, t: int, b: int, total: int) -> str:
    if not total:
        return "데이터 없음"
    return f"allow {a / total:.0%} · transform {t / total:.0%} · block {b / total:.0%}"


def render(stats: dict) -> None:
    totals = stats.get("totals", {})
    verdict = stats.get("verdict", {})
    lat = stats.get("latency_ms", {})
    by_action = {row["action"]: row["count"] for row in stats.get("by_action", [])}

    total = totals.get("events", 0) or 0
    allow = verdict.get("allow", 0)
    transform = verdict.get("transform", 0)
    block = verdict.get("block", 0)
    fail = stats.get("fail_closed", 0)
    avg = lat.get("avg", 0) or 0
    p95 = lat.get("p95", 0) or 0

    col = st.columns(6)
    col[0].metric(
        "총 판정",
        f"{total:,}",
        help=f"input {totals.get('input', 0)} · output {totals.get('output', 0)}",
    )
    col[1].metric(
        "allow / transform / block",
        f"{allow} / {transform} / {block}",
        help=_ratio(allow, transform, block, total),
    )
    col[2].metric(
        "토큰화 엔티티", by_action.get("tokenize", 0), help="가역 보호로 치환된 엔티티 수"
    )
    col[3].metric("guardrail 적중", stats.get("guardrail_hits", 0))
    col[4].metric(
        "latency p95 (ms)",
        f"{p95:g}",
        delta=round(p95 - 600, 1) if p95 else None,
        delta_color="inverse",
        help=f"평균 {avg:g} ms · 로컬 목표 600 ms",
    )
    col[5].metric("fail-closed", fail)
    if fail:
        col[5].caption("⚠ 장애로 강제 차단")

    st.caption(f"활성 세션 {totals.get('sessions', 0)} · 집계 기준 {stats.get('generated_at', '')}")
