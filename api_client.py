"""dlp-server 읽기 API httpx 클라이언트.

env ``DLP_API_BASE`` (기본 ``http://localhost:8000``). 네트워크·HTTP 오류는 모두
``ApiError`` 로 감싸 UI 에서 한 곳에서 처리한다.

대상 API: docs/schemas/dlp-server/log-event.md, docs/architecture/dlp-server-architecture.md §4
"""

from __future__ import annotations

import os
from datetime import datetime

import httpx

BASE_URL = os.getenv("DLP_API_BASE", "http://localhost:8000")

_client = httpx.Client(base_url=BASE_URL, timeout=5.0)


class ApiError(RuntimeError):
    """dlp-server 응답 실패 — 연결 불가 / 타임아웃 / 4xx / 5xx."""


def _get(path: str, **params: object) -> object:
    clean = {k: v for k, v in params.items() if v not in (None, [], "")}
    try:
        resp = _client.get(path, params=clean)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        raise ApiError(f"{path} → {exc.response.status_code} {exc.response.text[:200]}") from exc
    except httpx.HTTPError as exc:
        raise ApiError(f"{path} → 연결 실패: {exc}") from exc


def health() -> dict:
    return _get("/health")


def get_events(
    *,
    limit: int = 300,
    direction: str | None = None,
    verdict: str | None = None,
    session_id: str | None = None,
    since: datetime | None = None,
) -> list[dict]:
    return _get(
        "/events",
        limit=limit,
        direction=direction,
        verdict=verdict,
        session_id=session_id,
        since=since.isoformat() if since else None,
    )


def get_session(session_id: str) -> list[dict]:
    return _get(f"/events/{session_id}")


def get_stats(window: str = "1h") -> dict:
    return _get("/stats", window=window)


def get_vault_access(session_id: str, *, limit: int = 100) -> list[dict]:
    return _get("/vault-access", session_id=session_id, limit=limit)
