'use client'

import * as React from 'react'
import { FileText } from 'lucide-react'
import type { DocCell, SourceDoc } from '@/lib/types'
import { cn } from '@/lib/utils'
import { FakeDocument, type DocHighlight } from '@/components/fake-document'

const QUALITY_LABEL: Record<SourceDoc['quality'], string | null> = {
  clean: null,
  low_quality_scan: 'low-quality scan',
  handwritten: 'handwritten',
}

/**
 * The pinned document pane. Never unmounts during tracing — only its content
 * swaps, so the reviewer keeps their bearings.
 */
export function DocumentPane({
  docs,
  cells,
  currentDocId,
  onSelectDoc,
  highlight,
  hint,
}: {
  docs: SourceDoc[]
  cells: Record<string, DocCell[]>
  currentDocId: string | null
  onSelectDoc: (docId: string) => void
  highlight: DocHighlight | null
  hint: string | null
}) {
  const current = docs.find((d) => d.id === currentDocId) ?? docs[0] ?? null

  return (
    <div className="flex h-full min-w-0 flex-col bg-muted/60">
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelectDoc(doc.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[12px] calm-transition outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                current?.id === doc.id
                  ? 'border-ring bg-ai-soft font-medium text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="size-3" />
              {doc.title}
            </button>
          ))}
        </div>
        {hint && (
          <p className="mt-1.5 text-[12px] text-primary">
            Source: {hint}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {current ? (
          <div className="mx-auto max-w-[560px]">
            <FakeDocument doc={current} cells={cells[current.id] ?? []} highlight={highlight} />
            <p className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {current.title} · p.1 of {current.pages}
              </span>
              {QUALITY_LABEL[current.quality] && (
                <span className="rounded-sm border border-pending/50 bg-pending-soft px-1.5 py-0.5 text-pending">
                  {QUALITY_LABEL[current.quality]}
                </span>
              )}
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No documents on file for this return.
          </div>
        )}
      </div>
    </div>
  )
}
