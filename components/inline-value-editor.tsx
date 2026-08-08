'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/** Inline numeric editor: Enter commits, Esc cancels. Never a modal. */
export function InlineValueEditor({
  initialValue,
  onCommit,
  onCancel,
  className,
}: {
  initialValue: number
  onCommit: (value: number) => void
  onCancel: () => void
  className?: string
}) {
  const [text, setText] = React.useState(String(initialValue))
  const ref = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  const commit = () => {
    const parsed = Number(text.replace(/[$,\s]/g, ''))
    if (Number.isFinite(parsed)) onCommit(Math.round(parsed))
    else onCancel()
  }

  return (
    <input
      ref={ref}
      value={text}
      inputMode="decimal"
      aria-label="Edit value — Enter commits, Esc cancels"
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        // Stop propagation so Enter/Esc never reach the row's own handlers.
        e.stopPropagation()
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          onCancel()
        }
      }}
      onBlur={onCancel}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'figure w-28 rounded-sm border border-ring bg-card px-1.5 py-0.5 text-sm outline-none ring-2 ring-ring/30',
        className
      )}
    />
  )
}
