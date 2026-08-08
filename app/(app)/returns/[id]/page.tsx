import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getReturn } from '@/lib/mock-data'
import { ReturnView } from '@/components/returns/return-view'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ field?: string; tab?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const ret = getReturn(id)
  return { title: ret ? `${ret.client} · Ledgerline` : 'Return · Ledgerline' }
}

export default async function ReturnPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const ret = getReturn(id)
  if (!ret) notFound()

  return (
    <ReturnView
      ret={ret}
      initialFieldId={sp.field ?? null}
      initialTab={sp.tab === 'activity' ? 'activity' : 'review'}
    />
  )
}
