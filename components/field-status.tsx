import {
  Check,
  Lock,
  PenLine,
  ShieldAlert,
  Sigma,
  Sparkles,
} from 'lucide-react'
import type { Field, FieldStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export function isCalculated(field: Field): boolean {
  return field.derivedFrom.length > 0
}

export function isConflict(field: Field): boolean {
  return field.status === 'flagged' && field.conflict === true
}

type StatusMeta = {
  label: string
  short: string
}

export const STATUS_META: Record<FieldStatus, StatusMeta> = {
  auto_applied: { label: 'Applied by AI', short: 'AI applied' },
  suggested: { label: 'Suggested by AI', short: 'Suggested' },
  flagged: { label: 'Flagged — needs an answer', short: 'Flagged' },
  needs_approval: { label: 'Needs approval', short: 'Approval' },
  verified: { label: 'Verified', short: 'Verified' },
  locked: { label: 'Locked', short: 'Locked' },
  manual: { label: 'Entered manually', short: 'Manual' },
}

export function confidenceTone(confidence: number): string {
  // Red stays reserved for conflict-grade confidence; ordinary low
  // confidence reads amber.
  if (confidence >= 0.85) return 'bg-verified'
  if (confidence >= 0.55) return 'bg-pending'
  return 'bg-destructive'
}

/** Small dot encoding confidence. Never the only signal — always sits next
 * to a glyph, and the exact number is available on hover. */
export function ConfidenceDot({
  confidence,
  className,
}: {
  confidence: number | null
  className?: string
}) {
  if (confidence === null) return null
  return (
    <span
      className={cn(
        'inline-block size-1.5 shrink-0 rounded-full',
        confidenceTone(confidence),
        className
      )}
      title={`AI confidence ${Math.round(confidence * 100)}%`}
      aria-label={`AI confidence ${Math.round(confidence * 100)}%`}
    />
  )
}

/** The glyph column of the grammar: shape, never just color. */
export function StatusGlyph({
  field,
  className,
}: {
  field: Field
  className?: string
}) {
  const base = cn('size-3.5 shrink-0', className)
  if (isCalculated(field)) {
    return <Sigma className={cn(base, 'text-muted-foreground')} aria-label="Calculated" />
  }
  switch (field.status) {
    case 'auto_applied':
    case 'suggested':
      return <Sparkles className={cn(base, 'text-primary/70')} aria-label={STATUS_META[field.status].label} />
    case 'flagged':
      return (
        <ShieldAlert
          className={cn(base, isConflict(field) ? 'text-destructive' : 'text-pending')}
          aria-label={isConflict(field) ? 'Conflict' : 'Flagged'}
        />
      )
    case 'needs_approval':
      return <ShieldAlert className={cn(base, 'text-pending')} aria-label="Needs approval" />
    case 'verified':
      return <Check className={cn(base, 'text-verified')} aria-label="Verified" />
    case 'locked':
      return <Lock className={cn(base, 'text-locked')} aria-label="Locked" />
    case 'manual':
      return <PenLine className={cn(base, 'text-foreground/70')} aria-label="Entered manually" />
  }
}

/** Compact status chip used on dashboard rows and document annotations —
 * the same grammar in a smaller container. */
export function StatusChip({ field, className }: { field: Field; className?: string }) {
  const conflict = isConflict(field)
  const calculated = isCalculated(field)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] leading-none calm-transition',
        calculated && 'border-border text-muted-foreground',
        !calculated && field.status === 'auto_applied' && 'border-primary/20 bg-ai-soft text-foreground',
        field.status === 'suggested' && 'border-pending/30 bg-pending-soft text-foreground',
        field.status === 'flagged' && !conflict && 'border-pending/50 bg-pending-soft text-pending',
        conflict && 'border-destructive/50 bg-conflict-soft text-destructive',
        field.status === 'needs_approval' && 'border-pending bg-transparent text-pending',
        field.status === 'verified' && 'border-transparent text-muted-foreground',
        field.status === 'locked' && 'border-border bg-muted text-locked',
        field.status === 'manual' && 'border-border text-foreground/80',
        className
      )}
    >
      <StatusGlyph field={field} className="size-3" />
      {calculated ? 'Calculated' : STATUS_META[field.status].short}
      {!calculated && (field.status === 'auto_applied' || field.status === 'suggested' || field.status === 'flagged') && (
        <ConfidenceDot confidence={field.confidence} />
      )}
    </span>
  )
}
