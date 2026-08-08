'use client'

import { FileQuestion, Mail } from 'lucide-react'
import { toast } from 'sonner'
import type { TaxReturn } from '@/lib/types'
import { useLedgerStore } from '@/lib/store'
import { Button } from '@/components/ui/button'

/**
 * Designed empty state: what's missing, who was asked, when, and one
 * primary action. Never just a mood.
 */
export function EmptyReturnState({ ret }: { ret: TaxReturn }) {
  const logEvent = useLedgerStore((s) => s.logEvent)

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-xs">
        <FileQuestion className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-3 text-lg">No documents to review yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          This return has no source documents and no extracted fields. We asked{' '}
          <span className="font-medium text-foreground">{ret.client}</span> for their W-2 and
          1099s by email on <span className="font-medium text-foreground">6 Mar</span>; an
          automatic reminder went out on{' '}
          <span className="font-medium text-foreground">10 Mar</span>. Nothing has been received.
        </p>
        <Button
          className="mt-5"
          onClick={() => {
            toast('Reminder queued — simulated', {
              description: `A document request reminder will be emailed to ${ret.client}.`,
            })
            logEvent(ret.id, {
              kind: 'flagged',
              detail: `Resent document request to ${ret.client}`,
            })
          }}
        >
          <Mail className="size-4" />
          Resend document request
        </Button>
      </div>
    </div>
  )
}
