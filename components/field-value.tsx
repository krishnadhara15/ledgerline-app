'use client'

import * as React from 'react'
import { PenLine, ShieldAlert } from 'lucide-react'
import type { Field } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  ConfidenceDot,
  StatusGlyph,
  isCalculated,
  isConflict,
} from '@/components/field-status'
import { InlineValueEditor } from '@/components/inline-value-editor'

export type FieldActions = {
  onVerify?: () => void
  onAccept?: () => void
  onCommitEdit?: (value: number) => void
  onApprove?: () => void
  onRejectApproval?: () => void
  onResolveConflict?: (sourceIndex: number) => void
  onConfirm?: () => void
}

export type FieldValueProps = {
  field: Field
  selected?: boolean
  /** Label of the needs_approval field blocking this calculated line. */
  blockedBy?: string | null
  onSelect?: () => void
  onHoverChange?: (hovering: boolean) => void
  actions?: FieldActions
  /** Extra node rendered in the meta row (e.g. the trust-layer popover). */
  detailsSlot?: React.ReactNode
  className?: string
}

/**
 * The six-state grammar. One component, used identically on the return
 * lines, the document pane annotations, and the legend. Color is never the
 * only signal; verification removes decoration.
 */
export function FieldValue({
  field,
  selected = false,
  blockedBy = null,
  onSelect,
  onHoverChange,
  actions,
  detailsSlot,
  className,
}: FieldValueProps) {
  const [editing, setEditing] = React.useState(false)
  const calculated = isCalculated(field)
  const conflict = isConflict(field)
  const editable =
    !!actions?.onCommitEdit &&
    (field.status === 'manual' ||
      field.status === 'suggested' ||
      field.status === 'flagged' ||
      field.status === 'auto_applied')

  const commitEdit = (value: number) => {
    setEditing(false)
    actions?.onCommitEdit?.(value)
  }

  const displayValue = field.textValue ?? formatCurrency(field.value)

  const container = cn(
    'group relative rounded-md calm-transition',
    // status decoration — falls away when verified
    field.status === 'auto_applied' && !calculated && 'bg-ai-soft',
    field.status === 'suggested' && 'border-l-2 border-pending bg-pending-soft',
    field.status === 'flagged' &&
      !conflict &&
      'border-l-2 border-pending bg-pending-soft',
    conflict && 'border-l-2 border-destructive bg-conflict-soft',
    field.status === 'needs_approval' && 'border border-pending/70',
    field.status === 'locked' && 'opacity-80',
    selected && 'ring-2 ring-ring/40',
    className
  )

  const valueNode = editing ? (
    <InlineValueEditor
      initialValue={field.value}
      onCommit={commitEdit}
      onCancel={() => setEditing(false)}
    />
  ) : (
    <span
      className={cn(
        'figure text-sm',
        calculated && 'underline decoration-dotted decoration-muted-foreground/60 underline-offset-4',
        field.status === 'locked' && 'text-locked',
        conflict && 'text-destructive'
      )}
    >
      {displayValue}
    </span>
  )

  const row = (
    <div
      className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <StatusGlyph field={field} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{field.label}</span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="whitespace-nowrap">{field.formLine}</span>
          {!calculated &&
            (field.status === 'auto_applied' ||
              field.status === 'suggested' ||
              field.status === 'flagged') && (
              <ConfidenceDot confidence={field.confidence} />
            )}
          {field.aiNote && !calculated && (
            <span className="hidden truncate sm:inline">· {field.aiNote}</span>
          )}
          {calculated && field.transform && <span>· {field.transform}</span>}
        </span>
      </span>
      {field.status === 'auto_applied' && !calculated && actions?.onVerify && !editing && (
        <Button
          variant="ghost"
          size="xs"
          className="invisible text-verified group-hover:visible focus-visible:visible"
          onClick={(e) => {
            e.stopPropagation()
            actions.onVerify?.()
          }}
        >
          Verify
        </Button>
      )}
      {editable && (field.status === 'manual' || field.status === 'auto_applied') && !editing && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={`Edit ${field.label}`}
          className="invisible group-hover:visible focus-visible:visible"
          onClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
        >
          <PenLine />
        </Button>
      )}
      {valueNode}
    </div>
  )

  return (
    <div className={container}>
      {onSelect ? (
        <div
          role="button"
          tabIndex={0}
          className="block w-full cursor-pointer rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect()
            }
          }}
          aria-label={`${field.label} ${displayValue} — open trail`}
        >
          {row}
        </div>
      ) : (
        row
      )}

      {/* Status-specific meta and inline actions */}
      <FieldMeta
        field={field}
        blockedBy={blockedBy}
        actions={actions}
        editing={editing}
        startEdit={editable ? () => setEditing(true) : undefined}
        detailsSlot={detailsSlot}
      />
    </div>
  )
}

function FieldMeta({
  field,
  blockedBy,
  actions,
  editing,
  startEdit,
  detailsSlot,
}: {
  field: Field
  blockedBy: string | null
  actions?: FieldActions
  editing: boolean
  startEdit?: () => void
  detailsSlot?: React.ReactNode
}) {
  const conflict = isConflict(field)
  const calculated = isCalculated(field)

  const bits: React.ReactNode[] = []

  if (calculated && blockedBy) {
    bits.push(
      <span
        key="blocked"
        className="inline-flex items-center gap-1 rounded-sm border border-pending bg-pending-soft px-1.5 py-0.5 text-[11px] text-pending"
      >
        <ShieldAlert className="size-3" />
        Blocked by approval — {blockedBy}
      </span>
    )
  }

  if (field.status === 'manual' && field.sources.length === 0) {
    const who = field.editedBy ?? field.enteredBy
    bits.push(
      <span key="nosource" className="inline-flex items-center gap-1 text-[11px] font-medium text-pending">
        <PenLine className="size-3" />
        No source document
        {who && (
          <span className="font-normal text-muted-foreground">
            — entered by {who.name}, {formatDate(who.at)}
          </span>
        )}
      </span>
    )
  }

  if (field.status === 'flagged' && field.uncertaintyNote) {
    bits.push(
      <span key="question" className={cn('text-[12px]', conflict ? 'text-destructive' : 'text-pending')}>
        {field.uncertaintyNote}
      </span>
    )
  }

  if (field.status === 'verified' && field.verifiedBy) {
    bits.push(
      <Tooltip key="verified">
        <TooltipTrigger asChild>
          <span className="cursor-default text-[11px] text-muted-foreground opacity-0 calm-transition group-hover:opacity-100">
            Verified
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Verified by {field.verifiedBy.name} · {formatDate(field.verifiedBy.at)}
        </TooltipContent>
      </Tooltip>
    )
  }

  if (field.status === 'locked' && field.lockedReason) {
    bits.push(
      <Tooltip key="locked">
        <TooltipTrigger asChild>
          <span className="cursor-not-allowed text-[11px] text-locked underline decoration-dotted underline-offset-2">
            Why is this locked?
          </span>
        </TooltipTrigger>
        <TooltipContent>{field.lockedReason}</TooltipContent>
      </Tooltip>
    )
  }

  // Inline action rows
  let actionRow: React.ReactNode = null
  if (!editing && actions) {
    if (field.status === 'suggested') {
      actionRow = (
        <div className="flex items-center gap-1.5">
          {actions.onAccept && (
            <Button size="xs" onClick={actions.onAccept}>
              Accept {formatCurrency(field.value)}
            </Button>
          )}
          {startEdit && (
            <Button size="xs" variant="outline" onClick={startEdit}>
              Edit
            </Button>
          )}
          {startEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="xs" variant="ghost" className="text-muted-foreground" onClick={startEdit}>
                  Reject
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rejecting opens the editor so you can type the correct value.</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    } else if (field.status === 'flagged' && conflict && actions.onResolveConflict) {
      actionRow = (
        <div className="flex flex-wrap items-center gap-1.5">
          {field.sources.map((s, i) => (
            <Button
              key={i}
              size="xs"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-conflict-soft hover:text-destructive"
              onClick={() => actions.onResolveConflict?.(i)}
            >
              Use {formatCurrency(s.value)} · {s.label.includes('copy B') ? 'copy B' : 'copy A'}
            </Button>
          ))}
        </div>
      )
    } else if (field.status === 'flagged' && !conflict) {
      actionRow = (
        <div className="flex items-center gap-1.5">
          {actions.onConfirm && (
            <Button size="xs" onClick={actions.onConfirm}>
              Confirm {formatCurrency(field.value)}
            </Button>
          )}
          {startEdit && (
            <Button size="xs" variant="outline" onClick={startEdit}>
              Edit
            </Button>
          )}
        </div>
      )
    } else if (field.status === 'needs_approval') {
      actionRow = (
        <div className="flex items-center gap-1.5">
          {actions.onApprove && (
            <Button size="xs" onClick={actions.onApprove}>
              Approve deduction
            </Button>
          )}
          {actions.onRejectApproval && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="xs" variant="outline" onClick={actions.onRejectApproval}>
                  Reject
                </Button>
              </TooltipTrigger>
              <TooltipContent>Removes the deduction from the return; downstream totals recompute.</TooltipContent>
            </Tooltip>
          )}
        </div>
      )
    }
  }

  if (bits.length === 0 && !actionRow && !detailsSlot) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-2 pb-1.5 pl-[30px]">
      {bits}
      {detailsSlot}
      {actionRow}
    </div>
  )
}
