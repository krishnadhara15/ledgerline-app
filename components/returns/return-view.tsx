'use client'

import * as React from 'react'
import Link from 'next/link'
import type { TaxReturn } from '@/lib/types'
import { getReturnBundle } from '@/lib/mock-data'
import { useLedgerStore } from '@/lib/store'
import { deadlineLabel, daysUntil } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReturnStatusBadge } from '@/components/return-status-badge'
import { ReviewTab } from '@/components/returns/review-tab'
import { ActivityTab } from '@/components/returns/activity-tab'
import { EmptyReturnState } from '@/components/returns/empty-return-state'

export type ReturnTab = 'review' | 'activity'

export function ReturnView({
  ret,
  initialFieldId,
  initialTab,
}: {
  ret: TaxReturn
  initialFieldId: string | null
  initialTab: ReturnTab
}) {
  const ensureReturn = useLedgerStore((s) => s.ensureReturn)
  const returnState = useLedgerStore((s) => s.returns[ret.id])
  React.useEffect(() => ensureReturn(ret.id), [ret.id, ensureReturn])

  // Docs and cells are immutable — read them straight from the fixture layer.
  const bundle = React.useMemo(() => getReturnBundle(ret.id), [ret.id])

  const [tab, setTab] = React.useState<ReturnTab>(initialTab)
  const [selectedId, setSelectedId] = React.useState<string | null>(initialFieldId)
  const [stack, setStack] = React.useState<string[]>([])

  // Selected field and open tab sync to the query string, so any state is a
  // shareable URL that cold-loads back into full context.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (selectedId) params.set('field', selectedId)
    else params.delete('field')
    if (tab === 'activity') params.set('tab', 'activity')
    else params.delete('tab')
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [selectedId, tab])

  const rowSelect = (id: string | null) => {
    setSelectedId(id)
    setStack([])
  }
  const drill = (id: string) => {
    if (selectedId) setStack((s) => [...s, selectedId])
    setSelectedId(id)
  }
  const back = () => {
    setStack((s) => {
      if (s.length === 0) return s
      const copy = [...s]
      const prev = copy.pop()!
      setSelectedId(prev)
      return copy
    })
  }
  const jumpFromActivity = (fieldId: string) => {
    setSelectedId(fieldId)
    setStack([])
    setTab('review')
  }

  const empty = bundle.fields.length === 0
  const dueSoon = daysUntil(ret.deadline) <= 3

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-2.5">
        <nav
          className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden whitespace-nowrap text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/dashboard"
            className="shrink-0 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            Dashboard
          </Link>
          <span className="text-muted-foreground">›</span>
          <span className="min-w-16 truncate font-medium">{ret.client}</span>
          <span className="hidden text-muted-foreground lg:inline">›</span>
          <span className="hidden shrink-0 text-muted-foreground lg:inline">
            2025 Form {ret.form}
          </span>
          <span className="text-muted-foreground">›</span>
          <span className="shrink-0">{tab === 'review' ? 'Review' : 'AI activity'}</span>
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span
            className={cn(
              'rounded-sm border px-1.5 py-0.5 text-[11px] leading-none',
              dueSoon ? 'border-pending/50 bg-pending-soft text-pending' : 'border-border text-muted-foreground'
            )}
          >
            {deadlineLabel(ret.deadline)}
          </span>
          <ReturnStatusBadge status={ret.status} />
          <Tabs value={tab} onValueChange={(v) => setTab(v as ReturnTab)}>
            <TabsList>
              <TabsTrigger value="review">Review</TabsTrigger>
              <TabsTrigger value="activity">AI activity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {tab === 'review' ? (
        empty ? (
          <EmptyReturnState ret={ret} />
        ) : (
          <ReviewTab
            ret={ret}
            docs={bundle.docs}
            cells={bundle.cells}
            selectedId={selectedId}
            stack={stack}
            onRowSelect={rowSelect}
            onDrill={drill}
            onBack={back}
          />
        )
      ) : (
        <ActivityTab events={returnState?.events ?? bundle.events} onJumpToField={jumpFromActivity} />
      )}
    </div>
  )
}
