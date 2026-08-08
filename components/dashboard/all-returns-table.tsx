'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { TaxReturn } from '@/lib/types'
import {
  applyFilters,
  type DashboardFilters,
} from '@/lib/dashboard-filters'
import { deadlineLabel, daysUntil } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ReturnStatusBadge, RETURN_STATUS_LABEL } from '@/components/return-status-badge'

const PAGE_SIZE = 25
const STATUS_VALUES = Object.keys(RETURN_STATUS_LABEL) as TaxReturn['status'][]

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-[12px] calm-transition outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active
          ? 'border-ring bg-ai-soft font-medium text-primary'
          : 'border-border text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

export function AllReturnsTable({
  returns,
  filters,
  onFiltersChange,
}: {
  returns: TaxReturn[]
  filters: DashboardFilters
  onFiltersChange: (f: DashboardFilters) => void
}) {
  const router = useRouter()
  const assignees = React.useMemo(() => {
    const s = new Set<string>()
    for (const r of returns) s.add(r.assignee)
    return [...s].sort()
  }, [returns])

  const filtered = applyFilters(returns, filters)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(filters.page, pageCount)
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const patch = (p: Partial<DashboardFilters>) =>
    onFiltersChange({ ...filters, page: 1, ...p })

  return (
    <section className="mt-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg">All returns</h2>
        <p className="text-[12px] text-muted-foreground">
          Filters are encoded in the URL — a filtered view is a shareable link.
        </p>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">Status</span>
          {STATUS_VALUES.map((s) => (
            <Chip
              key={s}
              active={filters.status === s}
              onClick={() => patch({ status: filters.status === s ? null : s })}
            >
              {RETURN_STATUS_LABEL[s]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">Assignee</span>
          {assignees.map((a) => (
            <Chip
              key={a}
              active={filters.assignee === a}
              onClick={() => patch({ assignee: filters.assignee === a ? null : a })}
            >
              {a}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">More</span>
          <Chip active={filters.dueWithin7} onClick={() => patch({ dueWithin7: !filters.dueWithin7 })}>
            Deadline &lt; 7 days
          </Chip>
          <Chip active={filters.hasFlags} onClick={() => patch({ hasFlags: !filters.hasFlags })}>
            Has flags
          </Chip>
          {(filters.status || filters.assignee || filters.dueWithin7 || filters.hasFlags) && (
            <button
              type="button"
              className="text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() =>
                onFiltersChange({ status: null, assignee: null, dueWithin7: false, hasFlags: false, page: 1 })
              }
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Flags</TableHead>
              <TableHead className="text-right">Unverified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.id}
                tabIndex={0}
                className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
                onClick={() => router.push(`/returns/${r.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') router.push(`/returns/${r.id}`)
                }}
              >
                <TableCell className="max-w-56 truncate font-medium">{r.client}</TableCell>
                <TableCell className="text-muted-foreground">{r.form}</TableCell>
                <TableCell>
                  <ReturnStatusBadge status={r.status} />
                </TableCell>
                <TableCell className={cn(r.assignee === 'Unassigned' && 'text-muted-foreground italic')}>
                  {r.assignee}
                </TableCell>
                <TableCell
                  className={cn(
                    daysUntil(r.deadline) <= 2 &&
                      r.status !== 'filed' &&
                      r.status !== 'accepted' &&
                      'text-pending'
                  )}
                >
                  {deadlineLabel(r.deadline)}
                </TableCell>
                <TableCell className="figure">
                  {r.openFlags > 0 ? (
                    <span className="rounded-sm border border-pending/50 bg-pending-soft px-1.5 py-0.5 text-[11px] text-pending">
                      {r.openFlags}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="figure text-muted-foreground">
                  {r.unverifiedCount > 0 ? r.unverifiedCount : '—'}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No returns match these filters. Clear a filter chip above to see more.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>
          Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} returns
        </span>
        <span className="flex items-center gap-1.5">
          {page <= 1 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button size="xs" variant="outline" disabled>
                    Previous
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>You&apos;re on the first page.</TooltipContent>
            </Tooltip>
          ) : (
            <Button size="xs" variant="outline" onClick={() => onFiltersChange({ ...filters, page: page - 1 })}>
              Previous
            </Button>
          )}
          <span className="figure">
            {page} / {pageCount}
          </span>
          {page >= pageCount ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button size="xs" variant="outline" disabled>
                    Next
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>You&apos;re on the last page.</TooltipContent>
            </Tooltip>
          ) : (
            <Button size="xs" variant="outline" onClick={() => onFiltersChange({ ...filters, page: page + 1 })}>
              Next
            </Button>
          )}
        </span>
      </div>
    </section>
  )
}
