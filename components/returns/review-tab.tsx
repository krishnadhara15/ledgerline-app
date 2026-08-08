'use client'

import * as React from 'react'
import { toast } from 'sonner'
import type { DocCell, Field, SourceDoc, TaxReturn } from '@/lib/types'
import { findApprovalBlocker, useLedgerStore } from '@/lib/store'
import { formatCurrency } from '@/lib/format'
import { FieldValue } from '@/components/field-value'
import { StatusChip } from '@/components/field-status'
import { DerivationTrail } from '@/components/returns/derivation-trail'
import { DocumentPane } from '@/components/returns/document-pane'
import { PropagationPanel } from '@/components/returns/propagation-panel'
import { TrustPopover } from '@/components/returns/trust-popover'
import type { DocHighlight } from '@/components/fake-document'

const SECTIONS: Field['section'][] = ['Income', 'Adjustments', 'Deductions', 'Tax & Payments']

function shortLine(field: Field): string {
  const parts = field.formLine.split('·')
  return parts[parts.length - 1].trim()
}

export function ReviewTab({
  ret,
  docs,
  cells,
  selectedId,
  stack,
  onRowSelect,
  onDrill,
  onBack,
}: {
  ret: TaxReturn
  docs: SourceDoc[]
  cells: Record<string, DocCell[]>
  selectedId: string | null
  stack: string[]
  onRowSelect: (id: string | null) => void
  onDrill: (id: string) => void
  onBack: () => void
}) {
  const returnState = useLedgerStore((s) => s.returns[ret.id])
  const verifyField = useLedgerStore((s) => s.verifyField)
  const acceptSuggestion = useLedgerStore((s) => s.acceptSuggestion)
  const overrideValue = useLedgerStore((s) => s.overrideValue)
  const approveField = useLedgerStore((s) => s.approveField)
  const rejectApproval = useLedgerStore((s) => s.rejectApproval)
  const resolveConflict = useLedgerStore((s) => s.resolveConflict)
  const confirmFlagged = useLedgerStore((s) => s.confirmFlagged)

  const docsById = React.useMemo(() => {
    const m: Record<string, SourceDoc> = {}
    for (const d of docs) m[d.id] = d
    return m
  }, [docs])

  const [currentDocId, setCurrentDocId] = React.useState<string | null>(docs[0]?.id ?? null)
  const [highlight, setHighlight] = React.useState<DocHighlight | null>(null)
  // Hover peek lives in its own slot so it never destroys the selection pulse.
  const [peek, setPeek] = React.useState<DocHighlight | null>(null)
  const [hint, setHint] = React.useState<string | null>(null)
  const nonceRef = React.useRef(0)
  const rowRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  const fields = React.useMemo(() => returnState?.fields ?? {}, [returnState])
  const fieldOrder = returnState?.fieldOrder ?? []
  const hydrated = !!returnState

  const jumpToSource = React.useCallback(
    (field: Field, sourceIndex: number) => {
      const src = field.sources[sourceIndex]
      if (!src) return
      setCurrentDocId(src.docId)
      nonceRef.current += 1
      setHighlight({
        region: src.region,
        mode: 'pulse',
        nonce: nonceRef.current,
        chip: <StatusChip field={field} className="bg-card shadow-sm" />,
      })
      setPeek(null)
      setHint(null)
    },
    []
  )

  // Selecting a field jumps the doc pane to its first source and pulses once.
  // Also re-runs once the store hydrates, so cold-loaded deep links land on
  // the right document.
  React.useEffect(() => {
    if (!hydrated) return
    if (!selectedId) {
      setHighlight(null)
      return
    }
    const field = fields[selectedId]
    if (!field) return
    if (field.sources.length > 0) {
      jumpToSource(field, field.chosenSourceIndex ?? 0)
    } else {
      setHighlight(null)
    }
    rowRefs.current[selectedId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, hydrated])

  const handleHover = (field: Field, hovering: boolean) => {
    if (!hovering) {
      setHint(null)
      setPeek(null)
      return
    }
    const src = field.sources[field.chosenSourceIndex ?? 0]
    if (!src) return
    if (src.docId === currentDocId) {
      setPeek({ region: src.region, mode: 'peek', nonce: -1 })
    } else {
      const doc = docsById[src.docId]
      if (doc) setHint(`${doc.title} · p.${src.page} — click to jump`)
    }
  }

  const actionsFor = (field: Field) => ({
    onVerify:
      field.status === 'auto_applied' && field.derivedFrom.length === 0
        ? () => {
            verifyField(ret.id, field.id)
            toast('Verified', { description: `${field.formLine} · ${field.label}` })
          }
        : undefined,
    onAccept:
      field.status === 'suggested'
        ? () => {
            acceptSuggestion(ret.id, field.id)
            toast('Accepted', {
              description: `${field.formLine} · ${formatCurrency(field.value)} is now verified`,
            })
          }
        : undefined,
    onConfirm:
      field.status === 'flagged' && !field.conflict
        ? () => {
            confirmFlagged(ret.id, field.id)
            toast('Confirmed', { description: `${field.formLine} · ${formatCurrency(field.value)}` })
          }
        : undefined,
    onApprove:
      field.status === 'needs_approval'
        ? () => {
            approveField(ret.id, field.id)
            toast('Approved', { description: `${field.label} — dependent lines unblocked` })
          }
        : undefined,
    onRejectApproval:
      field.status === 'needs_approval' ? () => rejectApproval(ret.id, field.id) : undefined,
    onResolveConflict: field.conflict
      ? (i: number) => {
          resolveConflict(ret.id, field.id, i)
          jumpToSource(
            { ...field, status: 'verified', conflict: false, chosenSourceIndex: i },
            i
          )
          toast('Conflict resolved', {
            description: `${field.formLine} set to ${formatCurrency(field.sources[i]?.value ?? field.value)}`,
          })
        }
      : undefined,
    onCommitEdit:
      field.derivedFrom.length === 0 &&
      field.status !== 'locked' &&
      field.status !== 'verified' &&
      field.status !== 'needs_approval'
        ? (v: number) => {
            overrideValue(ret.id, field.id, v)
            // Show the field's trail so the override note is immediately visible.
            if (selectedId !== field.id) onRowSelect(field.id)
          }
        : undefined,
  })

  const backTarget =
    stack.length > 0 && fields[stack[stack.length - 1]]
      ? { label: shortLine(fields[stack[stack.length - 1]]), onBack }
      : null

  if (!returnState) return null

  return (
    <div className="relative grid min-h-0 flex-1 grid-cols-[minmax(400px,46%)_1fr]">
      {/* Return lines */}
      <div className="min-h-0 overflow-y-auto border-r border-border">
        <div className="px-4 py-4">
          {SECTIONS.map((section) => {
            const ids = fieldOrder.filter((id) => fields[id]?.section === section)
            if (ids.length === 0) return null
            const verified = ids.filter((id) => fields[id].status === 'verified').length
            return (
              <section key={section} className="mb-5">
                <div className="mb-1.5 flex items-baseline justify-between border-b border-border pb-1">
                  <h2 className="text-[15px]">{section}</h2>
                  <span className="text-[11px] text-muted-foreground">
                    {verified} of {ids.length} verified
                  </span>
                </div>
                <div className="space-y-1">
                  {ids.map((id) => {
                    const field = fields[id]
                    const blocker = findApprovalBlocker(field, fields)
                    return (
                      <div
                        key={id}
                        ref={(el) => {
                          rowRefs.current[id] = el
                        }}
                      >
                        <FieldValue
                          field={field}
                          selected={selectedId === id}
                          blockedBy={blocker?.label ?? null}
                          onSelect={() => onRowSelect(selectedId === id ? null : id)}
                          onHoverChange={(hovering) => handleHover(field, hovering)}
                          actions={actionsFor(field)}
                          detailsSlot={
                            field.aiNote && field.derivedFrom.length === 0 ? (
                              <TrustPopover field={field} docs={docsById} cells={cells} />
                            ) : undefined
                          }
                        />
                        {selectedId === id && (
                          <DerivationTrail
                            field={field}
                            fields={fields}
                            docs={docsById}
                            onViewSource={(i) => jumpToSource(field, i)}
                            onDrill={onDrill}
                            backTarget={backTarget}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      {/* Pinned document pane */}
      <DocumentPane
        docs={docs}
        cells={cells}
        currentDocId={currentDocId}
        onSelectDoc={(id) => {
          setCurrentDocId(id)
          setHighlight(null)
          setPeek(null)
          setHint(null)
        }}
        highlight={peek ?? highlight}
        hint={hint}
      />

      <PropagationPanel />
    </div>
  )
}
