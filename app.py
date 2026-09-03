"""DLP 관리자 대시보드 — 엔트리.

dlp-server 읽기 API(/events · /stats · /events/{id} · /vault-access)를 tail 하는 Streamlit 앱.
KPI · 차트 · 이벤트 테이블 · 세션 드릴다운은 이후 커밋에서 채운다.
"""

from __future__ import annotations

import streamlit as st

import api_client
from components import charts, common, kpi

st.set_page_config(page_title="DLP 관리자 대시보드", layout="wide")
st.title("DLP 관리자 대시보드")


def _health_badge() -> None:
    try:
        h = api_client.health()
    except api_client.ApiError as exc:
        st.error(
            f"🔴 dlp-server 연결 실패 — DLP_API_BASE({api_client.BASE_URL}) 를 확인하세요.\n\n{exc}"
        )
        st.stop()
    st.caption(f"🟢 dlp-server 연결됨 · DB {h.get('db', '?')} · {api_client.BASE_URL}")


def _sidebar() -> dict:
    with st.sidebar:
        st.header("필터")
        window = common.WINDOWS[st.selectbox("기간", list(common.WINDOWS), index=1)]
        directions = st.multiselect("방향", ["input", "output"])
        verdicts = st.multiselect("판정", ["allow", "transform", "block"])
        purposes = st.multiselect("목적", common.PURPOSES)
        entities = st.multiselect("엔티티 타입", common.ENTITY_TYPES)
        session_q = st.text_input("세션 검색 (UUID 또는 원본 ID)").strip()
        only_fail = st.checkbox("fail-closed 만")
        refresh = st.radio("자동 새로고침", ["끄기", "3초", "5초"], index=2, horizontal=True)
    return {
        "window": window,
        "directions": directions,
        "verdicts": verdicts,
        "purposes": purposes,
        "entities": entities,
        "session_q": session_q,
        "only_fail": only_fail,
        "interval": {"끄기": None, "3초": 3, "5초": 5}[refresh],
    }


_health_badge()
filters = _sidebar()

try:
    stats = api_client.get_stats(filters["window"])
except api_client.ApiError as exc:
    st.error(f"통계 조회 실패: {exc}")
    st.stop()

kpi.render(stats)
st.divider()
charts.render(stats)

# 이벤트 테이블·세션 드릴다운은 다음 커밋에서 연결.
st.info("이벤트 테이블은 다음 단계에서 연결됩니다.")
