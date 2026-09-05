export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-[26px] w-11 shrink-0 items-center rounded-full p-[3px] transition-colors ${
        checked ? 'bg-primary justify-end' : 'bg-border justify-start'
      } ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
    >
      <span className="h-5 w-5 rounded-full bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.16)]" />
    </button>
  )
}
