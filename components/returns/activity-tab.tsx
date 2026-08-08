'use client'

import * as React from 'react'
import { Sparkles, User } from 'lucide-react'
import type { ActivityEvent } from '@/lib/types'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const KIND_LABEL: Record<ActivityEvent['kind'], string> = {
  read: 'Read',
  applied: 'Applied',
  suggested: 'Suggested',
  flagged: 'Flagged',
  override: 'Override',
  verified: 'Verified',
  approved: 'Approved',
}

/**
 * The compliance artifact: everything the AI read, applied, suggested, and
 * flagged, plus what humans overrode, verified, and approved.
 */
export function ActivityTab({
  events,
  onJumpToField,
}: {
  events: ActivityEvent[]
  onJumpToField: (fieldId: string) => void
}) {
  const [activeKinds, setActiveKinds] = React.useState<Set<ActivityEvent['kind']>>(new Set())

  const kindsPresent = React.useMemo(() => {
    const s = new Set<ActivityEvent['kind']>()
    for (const e of events) s.add(e.kind)
    return [...s]
  }, [events])

  const visible = events.filter((e) => activeKinds.size === 0 || activeKinds.has(e.kind))

  const toggle = (kind: ActivityEvent['kind']) =>
    setActiveKinds((prev) => {
      const next = new Set(prev)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {kindsPresent.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => toggle(kind)}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-[12px] calm-transition outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                activeKinds.has(kind)
                  ? 'border-ring bg-ai-soft font-medium text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
              aria-pressed={activeKinds.has(kind)}
            >
              {KIND_LABEL[kind]}
            </button>
          ))}
          {activeKinds.size > 0 && (
            <button
              type="button"
              className="text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() => setActiveKinds(new Set())}
            >
              Clear filters
            </button>
          )}
        </div>

        <ol className="mt-4 space-y-0.5">
          {visible.map((e, i) => {
            const human = e.actor !== 'AI' && e.actor !== 'System'
            const humanOverride = human && e.kind === 'override'
            const row = (
              <div
                className={cn(
                  'flex items-start gap-3 rounded-md px-3 py-2 text-[13px]',
                  humanOverride && 'border-l-2 border-pending bg-pending-soft',
                  !humanOverride && human && 'bg-ai-soft/60'
                )}
              >
                <span className="mt-0.5 shrink-0">
                  {e.actor === 'AI' ? (
                    <Sparkles className="size-3.5 text-primary/70" aria-label="AI" />
                  ) : (
                    <User className="size-3.5 text-foreground/70" aria-label={e.actor} />
                  )}
                </span>
                <span className="w-32 shrink-0 text-[12px] text-muted-foreground">
                  {formatDateTime(e.at)}
                </span>
                <span className="w-16 shrink-0 text-[12px] font-medium text-muted-foreground">
                  {KIND_LABEL[e.kind]}
                </span>
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="font-medium">{e.actor}</span>{' '}
                  <span className={cn(humanOverride && 'text-foreground')}>{e.detail}</span>
                </span>
              </div>
            )
            return (
              <li key={i}>
                {e.fieldId ? (
                  <button
                    type="button"
                    className="block w-full rounded-md text-left outline-none calm-transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                    onClick={() => onJumpToField(e.fieldId!)}
                    aria-label={`Open ${e.detail} in review`}
                  >
                    {row}
                  </button>
                ) : (
                  row
                )}
              </li>
            )
          })}
          {visible.length === 0 && (
            <li className="px-3 py-6 text-sm text-muted-foreground">
              No events match these filters. Clear a filter chip above to see more.
            </li>
          )}
        </ol>
      </div>
    </div>
  )
}
