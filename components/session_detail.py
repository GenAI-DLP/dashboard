"""세션 드릴다운 — ``/events/{session_id}`` + ``/vault-access``.

한 세션의 판정 흐름(input→output)과 토큰 복원 시도를 보여준다. 표시는 마스킹
프리뷰·타입까지만, 원시 근거는 접힌 JSON 으로만 노출한다.
"""

from __future__ import annotations

import altair as alt
import pandas as pd
import streamlit as st

import api_client
from components.common import VERDICT_EMOJI, fmt_ts, short_sid

_RISK_HARD_BLOCK = 0.6


def _num(v: object) -> bool:
    return isinstance(v, int | float)


def _pick(rows: list[dict], cols: list[str]) -> pd.DataFrame:
    df = pd.DataFrame(rows)
    return df[[c for c in cols if c in df.columns]]


def render(session_id: str) -> None:
    try:
        timeline = api_client.get_session(session_id)
    except api_client.ApiError as exc:
        st.error(f"세션 조회 실패: {exc}")
        return
    if not timeline:
        st.info("이 세션의 이벤트가 없습니다.")
        return

    first = timeline[0]
    risks = [e["risk_score"] for e in timeline if _num(e.get("risk_score"))]
    head = st.columns(4)
    head[0].metric("세션", short_sid(session_id))
    head[1].metric("원본 식별자", first.get("session_id_raw") or "-")
    head[2].metric("이벤트 수", len(timeline))
    head[3].metric("최종 risk", f"{risks[-1]:.2f}" if risks else "-")

    _risk_trend(timeline)
    st.divider()
    for ev in timeline:
        _event_card(ev)

    _vault_panel(session_id)

    with st.expander("원시 판정 근거 (JSON)"):
        st.json({str(i): ev.get("reason") for i, ev in enumerate(timeline)})


def _risk_trend(timeline: list[dict]) -> None:
    pts = [
        {"turn": i, "risk": e["risk_score"]}
        for i, e in enumerate(timeline)
        if _num(e.get("risk_score"))
    ]
    if len(pts) < 2:
        return
    line = (
        alt.Chart(pd.DataFrame(pts))
        .mark_line(point=True)
        .encode(
            x=alt.X("turn:Q", title="이벤트 순번"),
            y=alt.Y("risk:Q", title="risk_score", scale=alt.Scale(domain=[0, 1])),
        )
    )
    rule = (
        alt.Chart(pd.DataFrame({"y": [_RISK_HARD_BLOCK]}))
        .mark_rule(strokeDash=[4, 4], color="#C62828")
        .encode(y="y:Q")
    )
    st.altair_chart(line + rule, width="stretch")


def _event_card(ev: dict) -> None:
    verdict = ev.get("verdict_action", "")
    with st.container(border=True):
        head = (
            f"{fmt_ts(ev.get('created_at'))} · {ev.get('direction', '')} · "
            f"{VERDICT_EMOJI.get(verdict, '')} {verdict}"
        )
        if ev.get("note"):
            head += f" · {ev['note']}"
        st.markdown(f"**{head}**")

        if ev.get("entities_summary"):
            st.dataframe(
                _pick(ev["entities_summary"], ["type", "masked_preview", "confidence"]),
                width="stretch",
                hide_index=True,
            )
        if ev.get("transforms"):
            st.dataframe(
                _pick(ev["transforms"], ["entity", "action", "token_label"]),
                width="stretch",
                hide_index=True,
            )
        if ev.get("guardrail_hits"):
            kinds = ", ".join(h.get("type", "?") for h in ev["guardrail_hits"])
            st.warning(f"guardrail: {kinds}")


def _vault_panel(session_id: str) -> None:
    try:
        rows = api_client.get_vault_access(session_id)
    except api_client.ApiError as exc:
        st.caption(f"볼트 접근 조회 실패: {exc}")
        return
    if not rows:
        return
    st.subheader("토큰 복원 시도")
    df = _pick(
        rows,
        [
            "accessed_at",
            "token_label",
            "requested_role",
            "requested_purpose",
            "granted",
            "denied_reason",
        ],
    )
    if "accessed_at" in df.columns:
        df["accessed_at"] = df["accessed_at"].map(fmt_ts)
    st.dataframe(df, width="stretch", hide_index=True)
