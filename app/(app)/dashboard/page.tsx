import type { Metadata } from 'next'
import { parseFilters } from '@/lib/dashboard-filters'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard · Ledgerline',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  return <DashboardView initialFilters={parseFilters(sp)} />
}
