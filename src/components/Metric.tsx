export function Metric({
  label,
  value,
  help,
  delta,
  warn,
}: {
  label: string
  value: string | number
  help?: string
  delta?: number
  warn?: string
}) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {delta !== undefined && (
        <div className={delta > 0 ? 'text-xs text-red-600' : 'text-xs text-green-600'}>
          {delta > 0 ? '+' : ''}
          {delta}
        </div>
      )}
      {help && <div className="text-xs text-gray-400">{help}</div>}
      {warn && <div className="text-xs text-amber-600">{warn}</div>}
    </div>
  )
}
