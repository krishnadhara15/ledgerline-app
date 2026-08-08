import type { TaxReturn } from './types'
import { daysUntil } from './format'

export type DashboardFilters = {
  status: TaxReturn['status'] | null
  assignee: string | null
  dueWithin7: boolean
  hasFlags: boolean
  page: number
}

export const DEFAULT_FILTERS: DashboardFilters = {
  status: null,
  assignee: null,
  dueWithin7: false,
  hasFlags: false,
  page: 1,
}

const STATUS_VALUES: TaxReturn['status'][] = [
  'waiting_on_client',
  'preparing',
  'in_review',
  'ready_to_sign',
  'filed',
  'accepted',
]

export function parseFilters(sp: Record<string, string | undefined>): DashboardFilters {
  const status = STATUS_VALUES.find((s) => s === sp.status) ?? null
  return {
    status,
    assignee: sp.assignee ?? null,
    dueWithin7: sp.due === '7',
    hasFlags: sp.flags === '1',
    page: Math.max(1, Number(sp.page) || 1),
  }
}

export function filtersToQuery(f: DashboardFilters): string {
  const params = new URLSearchParams()
  if (f.status) params.set('status', f.status)
  if (f.assignee) params.set('assignee', f.assignee)
  if (f.dueWithin7) params.set('due', '7')
  if (f.hasFlags) params.set('flags', '1')
  if (f.page > 1) params.set('page', String(f.page))
  return params.toString()
}

export function applyFilters(rows: TaxReturn[], f: DashboardFilters): TaxReturn[] {
  return rows.filter((r) => {
    if (f.status && r.status !== f.status) return false
    if (f.assignee && r.assignee !== f.assignee) return false
    if (f.dueWithin7 && !(daysUntil(r.deadline) >= 0 && daysUntil(r.deadline) < 7)) return false
    if (f.hasFlags && r.openFlags === 0) return false
    return true
  })
}
