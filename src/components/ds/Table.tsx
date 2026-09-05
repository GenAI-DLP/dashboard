import type { ReactNode } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  )
}

export function Th({
  children,
  align = 'left',
}: {
  children: ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`bg-surface-subtle px-4 py-2.5 text-[13px] font-semibold text-muted ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  align = 'left',
}: {
  children: ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <td className={`px-4 py-3.5 text-body ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </td>
  )
}

export function Tr({
  children,
  onClick,
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-t border-border-subtle ${
        onClick ? 'cursor-pointer hover:bg-surface-subtle' : ''
      } ${className}`}
    >
      {children}
    </tr>
  )
}
