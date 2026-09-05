export function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex h-10 items-center rounded-full px-[18px] text-[15px] font-semibold transition-colors ${
              active ? 'bg-strong text-surface' : 'bg-surface text-muted'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
