'use client'

import Link from 'next/link'
import { AlertTriangle, Inbox } from 'lucide-react'
import type { TaxReturn } from '@/lib/types'
import { scoreReturn } from '@/lib/score'
import { daysUntil, deadlineLabel } from '@/lib/format'
import { ReturnStatusBadge } from '@/components/return-status-badge'
import { cn } from '@/lib/utils'

const ACTIVE: TaxReturn['status'][] = ['waiting_on_client', 'preparing', 'in_review', 'ready_to_sign']

export function TeamView({ returns }: { returns: TaxReturn[] }) {
  const active = returns.filter((r) => ACTIVE.includes(r.status))

  const atRisk = active
    .filter((r) => daysUntil(r.deadline) <= 3 || r.openFlags >= 3)
    .map((r) => ({ r, score: scoreReturn(r) }))
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, 8)

  const unassigned = active.filter((r) => r.assignee === 'Unassigned')

  const workload = new Map<string, number>()
  for (const r of active) {
    if (r.assignee === 'Unassigned') continue
    workload.set(r.assignee, (workload.get(r.assignee) ?? 0) + 1)
  }
  const workloadRows = [...workload.entries()].sort((a, b) => b[1] - a[1])
  const maxLoad = workloadRows[0]?.[1] ?? 1

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
      <section>
        <h2 className="flex items-center gap-2 text-lg">
          <AlertTriangle className="size-4 text-pending" />
          At risk
        </h2>
        <p className="text-[12px] text-muted-foreground">Deadline within 3 days or 3+ open flags, ranked by urgency.</p>
        <ul className="mt-3 space-y-1">
          {atRisk.map(({ r }) => (
            <li key={r.id}>
              <Link
                href={`/returns/${r.id}`}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 calm-transition outline-none hover:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.client}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {r.form} · {r.assignee}
                    {r.openFlags > 0 && ` · ${r.openFlags} flag${r.openFlags === 1 ? '' : 's'}`}
                  </span>
                </span>
                <ReturnStatusBadge status={r.status} />
                <span
                  className={cn(
                    'shrink-0 rounded-sm border px-1.5 py-0.5 text-[11px]',
                    daysUntil(r.deadline) <= 2
                      ? 'border-pending/50 bg-pending-soft text-pending'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {deadlineLabel(r.deadline)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="space-y-6">
        <section>
          <h2 className="flex items-center gap-2 text-lg">
            <Inbox className="size-4 text-muted-foreground" />
            Unassigned
          </h2>
          <p className="text-[12px] text-muted-foreground">Returns nobody owns yet.</p>
          <ul className="mt-3 space-y-1">
            {unassigned.slice(0, 5).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/returns/${r.id}`}
                  className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 calm-transition outline-none hover:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.client}</span>
                  <ReturnStatusBadge status={r.status} />
                  <span className="shrink-0 text-[11px] text-muted-foreground">{deadlineLabel(r.deadline)}</span>
                </Link>
              </li>
            ))}
            {unassigned.length > 5 && (
              <li className="px-3 py-1 text-[12px] text-muted-foreground">
                + {unassigned.length - 5} more in the table below (filter: Unassigned)
              </li>
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-lg">Workload</h2>
          <p className="text-[12px] text-muted-foreground">Active returns per person.</p>
          <ul className="mt-3 space-y-1.5">
            {workloadRows.map(([name, count]) => (
              <li key={name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm">{name}</span>
                <span className="h-2 rounded-full bg-primary/70" style={{ width: `${(count / maxLoad) * 100 * 0.7}%` }} />
                <span className="figure text-[12px] text-muted-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
