'use client'

import { X } from 'lucide-react'
import { useLedgerStore } from '@/lib/store'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'

/**
 * Non-blocking panel showing what recomputed downstream after a correction.
 * Never a modal, never a warning — the human's edit is the authority.
 */
export function PropagationPanel() {
  const diff = useLedgerStore((s) => s.lastPropagation)
  const clear = useLedgerStore((s) => s.clearPropagation)
  if (!diff) return null

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-20 w-80 rounded-md border border-border bg-card p-3 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium">
          {diff.changes.length === 0
            ? 'No downstream values changed'
            : `${diff.changes.length} downstream value${diff.changes.length === 1 ? '' : 's'} changed`}
        </p>
        <Button variant="ghost" size="icon-xs" aria-label="Dismiss" onClick={clear}>
          <X />
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">after your edit to {diff.causeLabel}</p>
      {diff.changes.length > 0 && (
        <ul className="mt-2 space-y-1">
          {diff.changes.map((c) => (
            <li key={c.fieldId} className="flex items-baseline justify-between text-[12px]">
              <span className="text-muted-foreground">{c.label}</span>
              <span className="figure">
                <span className="text-muted-foreground line-through">{formatCurrency(c.before)}</span>
                {' → '}
                <span className="font-medium">{formatCurrency(c.after)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
