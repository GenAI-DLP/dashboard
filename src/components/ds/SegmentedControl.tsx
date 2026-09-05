export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  columns,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  columns?: number
}) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`h-[34px] rounded-sm text-[13px] transition-colors ${
              active
                ? 'bg-primary-bg font-bold text-primary'
                : 'bg-surface-muted font-medium text-secondary'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
