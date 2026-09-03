"""차트 패널 — ``/stats`` 기반. altair."""

from __future__ import annotations

import altair as alt
import pandas as pd
import streamlit as st

from components.common import VERDICT_COLORS

_VERDICT_SCALE = alt.Scale(domain=list(VERDICT_COLORS), range=list(VERDICT_COLORS.values()))


def render(stats: dict) -> None:
    left, right = st.columns(2)
    with left:
        st.caption("시간대별 판정")
        _verdict_timeline(stats.get("buckets", []))
        st.caption("목적 분포")
        _count_bar(stats.get("by_purpose", []), "purpose")
    with right:
        st.caption("조치 분포")
        _count_bar(stats.get("by_action", []), "action")
        st.caption("엔티티 타입 Top-N")
        _count_bar(stats.get("by_entity_type", []), "type")


def _verdict_timeline(buckets: list[dict]) -> None:
    if not buckets:
        st.caption("데이터 없음")
        return
    df = pd.DataFrame(buckets)
    long = df.melt(
        "ts", value_vars=["allow", "transform", "block"], var_name="verdict", value_name="count"
    )
    long["ts"] = pd.to_datetime(long["ts"])
    chart = (
        alt.Chart(long)
        .mark_bar()
        .encode(
            x=alt.X("ts:T", title=None),
            y=alt.Y("count:Q", title=None, stack="zero"),
            color=alt.Color("verdict:N", scale=_VERDICT_SCALE, title=None),
            order=alt.Order("verdict:N"),
            tooltip=["ts:T", "verdict:N", "count:Q"],
        )
        .properties(height=200)
    )
    st.altair_chart(chart, width="stretch")


def _count_bar(rows: list[dict], field: str) -> None:
    if not rows:
        st.caption("데이터 없음")
        return
    df = pd.DataFrame(rows)
    chart = (
        alt.Chart(df)
        .mark_bar()
        .encode(
            x=alt.X("count:Q", title=None),
            y=alt.Y(f"{field}:N", sort="-x", title=None),
            tooltip=[f"{field}:N", "count:Q"],
        )
        .properties(height=min(30 * len(df) + 20, 220))
    )
    st.altair_chart(chart, width="stretch")
