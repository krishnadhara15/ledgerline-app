'use client'

import * as React from 'react'
import { ArrowLeft, CornerDownRight, Eye, PenLine } from 'lucide-react'
import type { Field, SourceDoc } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { isConflict } from '@/components/field-status'

function shortLine(field: Field): string {
  const parts = field.formLine.split('·')
  return parts[parts.length - 1].trim()
}

/**
 * The derivation trail: a chain, not a paragraph. Calculated fields render
 * their formula as clickable operand chips that drill recursively; leaf
 * fields list their exact source regions with [view] jumps; manual fields
 * render the absence of a source loudly.
 */
export function DerivationTrail({
  field,
  fields,
  docs,
  onViewSource,
  onDrill,
  backTarget,
}: {
  field: Field
  fields: Record<string, Field>
  docs: Record<string, SourceDoc>
  onViewSource: (sourceIndex: number) => void
  onDrill: (fieldId: string) => void
  backTarget?: { label: string; onBack: () => void } | null
}) {
  const conflict = isConflict(field)
  const calculated = field.derivedFrom.length > 0

  return (
    <div className="mx-2 mb-2 rounded-md border border-border bg-card px-3 py-2.5 text-[13px] shadow-xs">
      {backTarget && (
        <Button
          variant="ghost"
          size="xs"
          className="-ml-1.5 mb-1.5 text-muted-foreground"
          onClick={backTarget.onBack}
        >
          <ArrowLeft className="size-3" />
          Back to {backTarget.label}
        </Button>
      )}

      <p className="font-medium">
        {field.formLine} · <span className="figure">{field.textValue ?? formatCurrency(field.value)}</span>
      </p>

      {/* Calculated: formula as clickable operand chips */}
      {calculated && field.formula && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-4">
          <span className="text-muted-foreground">=</span>
          {field.formula.split(/\s+/).map((token, i) => {
            if (token === '+' || token === '-') {
              return (
                <span key={i} className="text-muted-foreground">
                  {token === '-' ? '−' : '+'}
                </span>
              )
            }
            const operand = fields[token]
            if (!operand) return null
            return (
              <button
                key={i}
                type="button"
                onClick={() => onDrill(token)}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-background px-1.5 py-0.5 calm-transition hover:border-ring hover:bg-ai-soft focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
                aria-label={`Trace ${operand.label}`}
              >
                <span className="text-muted-foreground">{shortLine(operand)}</span>
                <span className="figure font-medium">{formatCurrency(operand.value)}</span>
              </button>
            )
          })}
          <span className="ml-1 text-[11px] text-muted-foreground">click an operand to trace it</span>
        </div>
      )}

      {/* Transform line */}
      {!calculated && field.transform && (
        <p className="mt-1 pl-4 text-muted-foreground">↑ {field.transform}</p>
      )}
      {conflict && (
        <p className="mt-1 pl-4 font-medium text-destructive">
          ↑ Conflicting sources — pick the one that matches the original
        </p>
      )}

      {/* Source rows */}
      {field.sources.length > 0 && (
        <ul className="mt-1 space-y-0.5 pl-4">
          {field.sources.map((s, i) => {
            const doc = docs[s.docId]
            const chosen = field.chosenSourceIndex === i
            const passedOver =
              field.chosenSourceIndex !== undefined && field.chosenSourceIndex !== i
            return (
              <li key={i} className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{i === field.sources.length - 1 ? '└─' : '├─'}</span>
                <span className={cn('min-w-0 truncate', conflict && 'text-destructive', passedOver && 'line-through opacity-60')}>
                  {doc?.title ?? s.docId} · {s.label} ·{' '}
                  <span className="figure font-medium">{formatCurrency(s.value)}</span> · p.{s.page}
                </span>
                {chosen && <span className="text-[11px] text-verified">chosen</span>}
                <Button
                  variant="ghost"
                  size="xs"
                  className="shrink-0 text-primary"
                  onClick={() => onViewSource(i)}
                  aria-label={`View ${s.label} on ${doc?.title ?? 'document'}`}
                >
                  <Eye className="size-3" />
                  view
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Original AI value survives an override */}
      {field.editedBy && (
        <p className="mt-1.5 flex items-center gap-1.5 pl-4 text-muted-foreground">
          <CornerDownRight className="size-3" />
          AI read {formatCurrency(field.editedBy.previousValue)} — overridden by{' '}
          {field.editedBy.name}, {formatDate(field.editedBy.at)}
        </p>
      )}

      {/* Manual: the absence of a source, loud */}
      {field.status === 'manual' && field.sources.length === 0 && (
        <div className="mt-1.5 flex items-center gap-2 rounded-sm border border-pending/60 bg-pending-soft px-2 py-1.5 text-pending">
          <PenLine className="size-3.5 shrink-0" />
          <span>
            <span className="font-semibold">No source document</span>
            {(field.editedBy ?? field.enteredBy) && (
              <>
                {' '}
                — entered by {(field.editedBy ?? field.enteredBy)!.name},{' '}
                {formatDate((field.editedBy ?? field.enteredBy)!.at)}
              </>
            )}
          </span>
        </div>
      )}

      {/* Locked: reason in the trail too */}
      {field.status === 'locked' && field.lockedReason && (
        <p className="mt-1.5 pl-4 text-muted-foreground">{field.lockedReason}</p>
      )}
    </div>
  )
}
