'use client'

import * as React from 'react'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import type { DocCell, Field, SourceDoc } from '@/lib/types'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ConfidenceDot } from '@/components/field-status'
import { EvidenceCrop } from '@/components/fake-document'

/**
 * Layers 2 and 3 of the trust disclosure. Layer 1 (confidence dot + plain
 * claim) is always visible on the field row; this popover holds the evidence
 * and, behind one more click, the full reasoning.
 */
export function TrustPopover({
  field,
  docs,
  cells,
}: {
  field: Field
  docs: Record<string, SourceDoc>
  cells: Record<string, DocCell[]>
}) {
  const [showReasoning, setShowReasoning] = React.useState(false)
  if (!field.aiNote) return null

  return (
    <Popover onOpenChange={(open) => !open && setShowReasoning(false)}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="xs" className="text-primary" onClick={(e) => e.stopPropagation()}>
          <Sparkles className="size-3" />
          Evidence
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[330px] p-3 text-[13px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2">
          {field.confidence !== null && <ConfidenceDot confidence={field.confidence} className="mt-1.5" />}
          <p className="leading-snug">{field.aiNote}</p>
        </div>

        {field.sources.slice(0, 2).map((s, i) => {
          const doc = docs[s.docId]
          const docCells = cells[s.docId]
          if (!doc || !docCells) return null
          return (
            <div key={i} className="mt-2.5">
              <EvidenceCrop doc={doc} cells={docCells} region={s.region} className="w-full" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {doc.title} · {s.label} · <span className="figure">{formatCurrency(s.value)}</span>
              </p>
            </div>
          )
        })}

        {field.transform && (
          <p className="mt-2 text-[12px] text-muted-foreground">Transform: {field.transform}</p>
        )}
        {field.uncertaintyNote && (
          <p className="mt-2 rounded-sm bg-pending-soft px-2 py-1.5 text-[12px] leading-snug text-pending">
            {field.uncertaintyNote}
          </p>
        )}
        {field.confidence !== null && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Raw confidence: {Math.round(field.confidence * 100)}%
          </p>
        )}

        {field.reasoning && (
          <div className="mt-2 border-t border-border pt-2">
            <button
              type="button"
              className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              onClick={() => setShowReasoning((v) => !v)}
            >
              {showReasoning ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              {showReasoning ? 'Hide reasoning' : 'Show reasoning'}
            </button>
            {showReasoning && (
              <div className="mt-1.5 space-y-1.5">
                <p className="leading-snug text-muted-foreground">{field.reasoning}</p>
                <p className="text-[11px] text-muted-foreground/80">
                  Model ledgerline-extract-2 · read 10 Mar 2026, 2:02 PM
                </p>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
