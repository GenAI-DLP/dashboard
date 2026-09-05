import { useState } from 'react'
import { SegmentedControl, StatusDot } from './ds'
import { REFRESH_OPTIONS } from '../lib/filters'
import { fmtClock } from '../lib/format'

export function AppHeader({
  connected,
  lastUpdated,
  intervalMs,
  onIntervalChange,
}: {
  connected: boolean
  lastUpdated: Date | null
  intervalMs: number | null
  onIntervalChange: (value: number | null) => void
}) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const refreshLabel =
    Object.entries(REFRESH_OPTIONS).find(([, v]) => v === intervalMs)?.[0] ?? '끄기'

  return (
    <header className="relative z-40 flex h-16 items-center gap-4 bg-surface px-7">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-xs bg-primary text-sm font-bold text-surface">
          D
        </div>
        <div className="text-[17px] font-bold tracking-[-0.02em] text-strong">
          DLP <span className="font-medium text-muted">관리자 대시보드</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 rounded-full bg-surface-muted px-3 py-1.5">
        <StatusDot tone={connected ? 'allow' : 'block'} />
        <span className="text-[13px] font-semibold text-secondary">
          {connected ? '연결됨' : '연결 안됨'}
        </span>
      </div>

      {lastUpdated && (
        <div className="text-[13px] text-muted">
          마지막 갱신 <span className="font-medium text-secondary">{fmtClock(lastUpdated)}</span>
        </div>
      )}

      <div className="flex-1" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className="flex h-[38px] items-center gap-1.5 rounded-md bg-surface-muted px-4 text-sm font-semibold text-secondary"
        >
          환경설정
        </button>
        {settingsOpen && (
          <div className="absolute top-[46px] right-0 z-50 w-72 rounded-xl bg-surface p-5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]">
            <div className="text-base font-bold text-strong">환경설정</div>
            <div className="mt-4 flex flex-col gap-2.5">
              <div className="text-[13px] font-semibold text-muted">자동 새로고침</div>
              <SegmentedControl
                value={refreshLabel}
                onChange={(label) => onIntervalChange(REFRESH_OPTIONS[label])}
                options={Object.keys(REFRESH_OPTIONS).map((label) => ({
                  value: label,
                  label,
                }))}
              />
              <div className="text-[13px] text-muted">폴링 주기는 서버 부하에 영향을 줍니다.</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-muted text-xs font-bold text-muted">
          운
        </div>
        운영팀
      </div>
    </header>
  )
}
