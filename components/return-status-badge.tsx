import type { TaxReturn } from '@/lib/types'
import { cn } from '@/lib/utils'

export const RETURN_STATUS_LABEL: Record<TaxReturn['status'], string> = {
  waiting_on_client: 'Waiting on client',
  preparing: 'Preparing',
  in_review: 'In review',
  ready_to_sign: 'Ready to sign',
  filed: 'Filed',
  accepted: 'Accepted',
}

export function ReturnStatusBadge({
  status,
  className,
}: {
  status: TaxReturn['status']
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] leading-none',
        status === 'waiting_on_client' && 'border-pending/40 bg-pending-soft text-pending',
        status === 'preparing' && 'border-border bg-muted text-muted-foreground',
        status === 'in_review' && 'border-primary/30 bg-ai-soft text-primary',
        status === 'ready_to_sign' && 'border-primary/40 bg-ai-soft font-medium text-primary',
        (status === 'filed' || status === 'accepted') && 'border-border text-muted-foreground',
        className
      )}
    >
      {RETURN_STATUS_LABEL[status]}
    </span>
  )
}
