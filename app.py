"""DLP 관리자 대시보드 — 엔트리.

dlp-server 읽기 API(/events · /stats · /events/{id} · /vault-access)를 tail 하는 Streamlit 앱.
상단 KPI · 차트 · 실시간 이벤트 테이블(자동 새로고침) · 행 선택 시 세션 드릴다운.
"""

from __future__ import annotations

import streamlit as st

import api_client
from components import charts, common, event_table, kpi, session_detail

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


def _client_filter(rows: list[dict]) -> list[dict]:
    """/events 파라미터에 없는 축(목적·엔티티) + 다중 선택 값은 여기서 거른다."""
    out = []
    for ev in rows:
        if filters["directions"] and ev.get("direction") not in filters["directions"]:
            continue
        if filters["verdicts"] and ev.get("verdict_action") not in filters["verdicts"]:
            continue
        if filters["purposes"] and (ev.get("purpose") or "unknown") not in filters["purposes"]:
            continue
        if filters["entities"]:
            types = {e.get("type") for e in ev.get("entities_summary", [])}
            if not types & set(filters["entities"]):
                continue
        if filters["only_fail"] and not ev.get("fail_policy_applied"):
            continue
        out.append(ev)
    return out


@st.fragment(run_every=filters["interval"])
def _live() -> None:
    try:
        stats = api_client.get_stats(filters["window"])
        rows = api_client.get_events(
            limit=300,
            direction=filters["directions"][0] if len(filters["directions"]) == 1 else None,
            verdict=filters["verdicts"][0] if len(filters["verdicts"]) == 1 else None,
            session_id=filters["session_q"] or None,
            since=common.window_since(filters["window"]),
        )
    except api_client.ApiError as exc:
        st.error(f"조회 실패: {exc}")
        return

    kpi.render(stats)
    st.divider()
    charts.render(stats)
    st.divider()
    selected = event_table.render(_client_filter(rows))
    if selected and selected != st.session_state.get("sel_session"):
        st.session_state["sel_session"] = selected
        st.rerun(scope="app")


_live()

# 드릴다운은 fragment 밖 — 자동 새로고침이 사용자가 보는 상세를 흔들지 않게.
_sel = st.session_state.get("sel_session")
if _sel:
    st.divider()
    top = st.columns([5, 1])
    top[0].subheader("세션 상세")
    if top[1].button("닫기"):
        del st.session_state["sel_session"]
        st.rerun()
    session_detail.render(_sel)
