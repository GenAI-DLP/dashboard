import type { Tone } from './StatusDot'
import { StatusDot } from './StatusDot'

export function FilterRow({
  label,
  count,
  checked,
  onChange,
  dotTone,
}: {
  label: string
  count?: string | number
  checked: boolean
  onChange: (value: boolean) => void
  dotTone?: Tone
}) {
  return (
    <label className="flex h-10 cursor-pointer items-center gap-2.5 px-1">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] text-xs font-bold text-surface ${
          checked ? 'bg-primary' : 'bg-surface-muted'
        }`}
      >
        {checked && '✓'}
      </span>
      {dotTone && <StatusDot tone={dotTone} />}
      <span className="text-sm font-medium text-body">{label}</span>
      <span className="flex-1" />
      {count !== undefined && (
        <span className="text-[13px] font-medium text-muted">{count}</span>
      )}
    </label>
  )
}
