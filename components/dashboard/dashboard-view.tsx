'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, BellRing, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { TaxReturn } from '@/lib/types'
import { ALL_RETURNS, CURRENT_USER, HERO_RETURN_ID } from '@/lib/mock-data'
import { scoreReturn } from '@/lib/score'
import { daysUntil, deadlineLabel } from '@/lib/format'
import {
  filtersToQuery,
  type DashboardFilters,
} from '@/lib/dashboard-filters'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ReturnStatusBadge } from '@/components/return-status-badge'
import { TeamView } from '@/components/dashboard/team-view'
import { AllReturnsTable } from '@/components/dashboard/all-returns-table'

const WORKABLE: TaxReturn['status'][] = ['preparing', 'in_review', 'ready_to_sign']

function neededLine(r: TaxReturn): string {
  if (r.id === HERO_RETURN_ID) return 'Resolve the dividend conflict, then 1 low-confidence flag'
  if (r.openFlags > 0) return `Answer ${r.openFlags} open flag${r.openFlags === 1 ? '' : 's'}`
  if (r.status === 'ready_to_sign') return 'Final look, then send for signature'
  if (r.unverifiedCount > 0) return `Verify ${r.unverifiedCount} value${r.unverifiedCount === 1 ? '' : 's'}`
  return 'Continue preparing — documents are in'
}

function returnHref(r: TaxReturn): string {
  return r.id === HERO_RETURN_ID ? `/returns/${r.id}?field=line-3b` : `/returns/${r.id}`
}

/** Hover shows the ranking reasons; click opens them too (never a dead click). */
function WhyFirst({ rank, score, reasons }: { rank: number; score: number; reasons: string[] }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span
          className="flex shrink-0 cursor-help items-center gap-1 text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2"
          onClick={(e) => {
            e.preventDefault()
            setOpen(true)
          }}
        >
          <HelpCircle className="size-3" />
          Why is this first?
        </span>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-60">
        <p className="font-medium">
          Ranked #{rank} · score {score}
        </p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}

function DeadlineChip({ r }: { r: TaxReturn }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-sm border px-1.5 py-0.5 text-[11px] leading-none',
        daysUntil(r.deadline) <= 2
          ? 'border-pending/50 bg-pending-soft text-pending'
          : 'border-border text-muted-foreground'
      )}
    >
      {deadlineLabel(r.deadline)}
    </span>
  )
}

export function DashboardView({ initialFilters }: { initialFilters: DashboardFilters }) {
  const [teamView, setTeamView] = React.useState(false)
  const [filters, setFilters] = React.useState<DashboardFilters>(initialFilters)

  // Filters sync to the query string, so a filtered view survives reload
  // and can be shared as a link.
  React.useEffect(() => {
    const qs = filtersToQuery(filters)
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [filters])

  const mine = ALL_RETURNS.filter((r) => r.assignee === CURRENT_USER)

  const today = mine
    .filter((r) => WORKABLE.includes(r.status))
    .map((r) => ({ r, result: scoreReturn(r) }))
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 7)

  const waiting = mine
    .filter((r) => r.status === 'waiting_on_client')
    .sort((a, b) => b.daysBlocked - a.daysBlocked)

  const attention = mine
    .filter(
      (r) =>
        r.status !== 'filed' &&
        r.status !== 'accepted' &&
        (r.openFlags > 0 || daysUntil(r.deadline) <= 2)
    )
    .sort((a, b) => scoreReturn(b).score - scoreReturn(a).score)
    .slice(0, 6)

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 py-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl tracking-tight">{teamView ? 'Team view' : 'Your work'}</h1>
            <p className="text-[13px] text-muted-foreground">
              {teamView
                ? 'At-risk returns, the unassigned pile, and who is carrying what.'
                : `Ranked by urgency for ${CURRENT_USER} — hover “Why is this first?” to see the reasoning.`}
            </p>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <span className={cn(!teamView && 'text-muted-foreground')}>Team view</span>
            <Switch checked={teamView} onCheckedChange={setTeamView} aria-label="Toggle team view" />
          </label>
        </header>

        <div className="mt-6">
          {teamView ? (
            <TeamView returns={ALL_RETURNS} />
          ) : (
            <div className="space-y-8">
              {/* Band 1 — Today */}
              <section>
                <h2 className="text-lg">Today</h2>
                <p className="text-[12px] text-muted-foreground">
                  The {today.length} returns most worth your next hours, in order.
                </p>
                <ol className="mt-3 space-y-1">
                  {today.map(({ r, result }, i) => (
                    <li key={r.id}>
                      <Link
                        href={returnHref(r)}
                        className="group flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 calm-transition outline-none hover:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="figure w-5 shrink-0 text-[13px] text-muted-foreground">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{r.client}</span>
                            <span className="shrink-0 text-[11px] text-muted-foreground">{r.form}</span>
                            <ReturnStatusBadge status={r.status} />
                          </span>
                          <span className="block truncate text-[12px] text-muted-foreground">{neededLine(r)}</span>
                        </span>
                        <WhyFirst rank={i + 1} score={result.score} reasons={result.reasons} />
                        <DeadlineChip r={r} />
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground calm-transition group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Band 2 — Waiting on others */}
              <section>
                <h2 className="text-lg">Waiting on others</h2>
                <p className="text-[12px] text-muted-foreground">Blocked returns, longest wait first.</p>
                <ul className="mt-3 space-y-1">
                  {waiting.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
                      <Link
                        href={`/returns/${r.id}`}
                        className="min-w-0 flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="block truncate text-sm font-medium hover:text-primary">{r.client}</span>
                        <span className="text-[12px] text-muted-foreground">
                          Waiting on client · {r.daysBlocked} day{r.daysBlocked === 1 ? '' : 's'} idle
                        </span>
                      </Link>
                      <DeadlineChip r={r} />
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          toast('Reminder queued — simulated', {
                            description: `${r.client} will get a nudge about their documents.`,
                          })
                        }
                      >
                        <BellRing className="size-3" />
                        Nudge
                      </Button>
                    </li>
                  ))}
                  {waiting.length === 0 && (
                    <li className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[13px] text-muted-foreground">
                      Nothing is waiting on someone else right now.
                    </li>
                  )}
                </ul>
              </section>

              {/* Band 3 — Needs attention */}
              <section>
                <h2 className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="size-4 text-pending" />
                  Needs attention
                </h2>
                <p className="text-[12px] text-muted-foreground">Exceptions only: conflicts, low-confidence flags, deadlines closing in.</p>
                <ul className="mt-3 space-y-1">
                  {attention.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={returnHref(r)}
                        className="flex items-center gap-3 rounded-md border border-pending/40 bg-pending-soft/50 px-3 py-2 calm-transition outline-none hover:border-pending focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{r.client}</span>
                          <span className="text-[12px] text-pending">
                            {r.id === HERO_RETURN_ID
                              ? 'Two 1099-DIVs disagree — the return can’t be verified until you pick one'
                              : r.openFlags > 0
                                ? `${r.openFlags} low-confidence flag${r.openFlags === 1 ? '' : 's'} waiting for an answer`
                                : `Deadline ${deadlineLabel(r.deadline).toLowerCase()}`}
                          </span>
                        </span>
                        <DeadlineChip r={r} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </div>

        <AllReturnsTable returns={ALL_RETURNS} filters={filters} onFiltersChange={setFilters} />
      </div>
    </div>
  )
}
