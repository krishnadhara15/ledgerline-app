import type { Metadata } from 'next'
import { LegendView } from '@/components/legend/legend-view'

export const metadata: Metadata = {
  title: 'Legend · Ledgerline',
}

export default function LegendPage() {
  return <LegendView />
}
