export function SearchInput({
  value,
  onChange,
  placeholder = '검색',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-md bg-surface-muted px-3.5">
      <span className="text-faint">⌕</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-strong placeholder:text-faint focus:outline-none"
      />
    </div>
  )
}
