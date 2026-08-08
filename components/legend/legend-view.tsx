'use client'

import * as React from 'react'
import { RotateCcw } from 'lucide-react'
import type { Field } from '@/lib/types'
import { FieldValue } from '@/components/field-value'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function demoField(partial: Partial<Field> & Pick<Field, 'id' | 'label' | 'value' | 'status'>): Field {
  return {
    returnId: 'demo',
    section: 'Income',
    formLine: 'Form 1040 · Line 1a',
    confidence: null,
    aiNote: null,
    uncertaintyNote: null,
    reasoning: null,
    sources: [],
    transform: null,
    derivedFrom: [],
    ...partial,
  }
}

type Row = {
  title: string
  visual: string
  interaction: string
  field: Field
}

function makeRows(): Row[] {
  return [
    {
      title: 'Calculated',
      visual: 'Plain text, dotted underline, ∑ glyph',
      interaction: 'Click opens the derivation trail with clickable operand chips',
      field: demoField({
        id: 'demo-calc',
        formLine: 'Form 1040 · Line 9',
        label: 'Total income',
        value: 135792,
        status: 'auto_applied',
        derivedFrom: ['line-1a', 'line-2b'],
        formula: 'line-1a + line-2b',
      }),
    },
    {
      title: 'Auto-applied',
      visual: 'Small AI glyph + confidence dot, minimal tint',
      interaction: 'Click opens the trail; a Verify affordance appears on hover',
      field: demoField({
        id: 'demo-auto',
        label: 'Wages, salaries, tips',
        value: 128450,
        status: 'auto_applied',
        confidence: 0.98,
        aiNote: 'Read from W-2 (Acme Corp), Box 1.',
      }),
    },
    {
      title: 'Suggested',
      visual: 'Left accent bar, AI glyph, confidence dot, tinted background',
      interaction: 'Inline Accept / Edit / Reject',
      field: demoField({
        id: 'demo-suggested',
        formLine: 'Form 1040 · Line 8',
        label: 'Other income — foreign interest',
        value: 5080,
        status: 'suggested',
        confidence: 0.81,
        aiNote: 'Converted £4,000 at 1.27 USD/GBP.',
        transform: 'Converted GBP→USD @ 1.27',
      }),
    },
    {
      title: 'Flagged — low confidence',
      visual: 'Amber accent, AI glyph, the question shown in words',
      interaction: 'Resolve inline: confirm the reading or type the correct value',
      field: demoField({
        id: 'demo-flagged',
        formLine: 'Form 1040 · Line 2b',
        label: 'Taxable interest',
        value: 412,
        status: 'flagged',
        confidence: 0.58,
        aiNote: 'Read from 1099-INT (First National Bank), Box 1.',
        uncertaintyNote:
          'The scan is low quality — the amount could read $412 or $472. Please confirm against the original.',
      }),
    },
    {
      title: 'Flagged — conflict',
      visual: 'Red accent (reserved strictly for conflict), AI glyph, forced choice',
      interaction: 'Pick the source that matches the original — the AI never guesses',
      field: demoField({
        id: 'demo-conflict',
        formLine: 'Form 1040 · Line 3b',
        label: 'Ordinary dividends',
        value: 1850,
        status: 'flagged',
        conflict: true,
        confidence: 0.52,
        uncertaintyNote:
          'Two 1099-DIV documents share the same payer TIN but disagree: $1,850 vs $1,580.',
        sources: [
          { docId: 'demo-a', page: 1, region: { x: 0, y: 0, w: 10, h: 5 }, label: 'Box 1a (copy A)', value: 1850 },
          { docId: 'demo-b', page: 1, region: { x: 0, y: 0, w: 10, h: 5 }, label: 'Box 1a (copy B)', value: 1580 },
        ],
      }),
    },
    {
      title: 'Needs approval',
      visual: 'Amber outline, explicit Approve / Reject',
      interaction: 'Blocks dependent calculations until resolved',
      field: demoField({
        id: 'demo-approval',
        formLine: 'Schedule C · Line 30',
        label: 'Home-office deduction',
        value: 3120,
        status: 'needs_approval',
        confidence: 0.84,
        aiNote: 'Simplified method: 208 sq ft × $15/sq ft.',
      }),
    },
    {
      title: 'Verified',
      visual: 'Tiny check, all tint and bars removed — visually quiet',
      interaction: 'Hover reveals who verified and when',
      field: demoField({
        id: 'demo-verified',
        formLine: 'Form 1040 · Line 25a',
        label: 'Federal income tax withheld',
        value: 18240,
        status: 'verified',
        verifiedBy: { name: 'D. Kim', at: '2026-03-13T15:36:00Z' },
      }),
    },
    {
      title: 'Locked',
      visual: 'Grey, lock glyph',
      interaction: 'Not editable; the reason is always available on hover',
      field: demoField({
        id: 'demo-locked',
        formLine: 'Form 1040 · Filing status',
        label: 'Filing status',
        value: 0,
        textValue: 'Married filing jointly',
        status: 'locked',
        lockedReason: 'Locked after e-file consent was signed on 2 Mar.',
      }),
    },
    {
      title: 'Manual',
      visual: 'Pen glyph + a loud "No source document" notice',
      interaction: 'Editable in place — Enter commits, Esc cancels',
      field: demoField({
        id: 'demo-manual',
        formLine: 'Form 1040 · Line 26',
        label: '2025 estimated tax payments',
        value: 8000,
        status: 'manual',
        enteredBy: { name: 'Krishna Dhara Syava', at: '2026-03-12T18:05:00Z' },
      }),
    },
  ]
}

function LegendRow({ row }: { row: Row }) {
  const [field, setField] = React.useState<Field>(row.field)
  const dirty = field !== row.field

  const verify = () =>
    setField((f) => ({ ...f, status: 'verified', verifiedBy: { name: 'Krishna Dhara Syava', at: new Date().toISOString() } }))

  return (
    <div className="grid grid-cols-1 items-start gap-x-6 gap-y-2 py-4 md:grid-cols-[190px_minmax(320px,1fr)] xl:grid-cols-[190px_250px_minmax(340px,1fr)]">
      <div>
        <p className="text-sm font-medium">{row.title}</p>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{row.visual}</p>
      </div>
      <p className="hidden text-[12px] leading-snug text-muted-foreground xl:block">{row.interaction}</p>
      <div className="relative min-w-0 rounded-md border border-border bg-card px-1 py-1">
        <FieldValue
          field={field}
          onSelect={row.title === 'Calculated' ? () => {} : undefined}
          actions={{
            onVerify: verify,
            onAccept: verify,
            onConfirm: verify,
            onApprove: verify,
            onRejectApproval: () =>
              setField((f) => ({
                ...f,
                value: 0,
                status: 'manual',
                editedBy: { name: 'Krishna Dhara Syava', at: new Date().toISOString(), previousValue: f.value },
              })),
            onResolveConflict: (i) =>
              setField((f) => ({
                ...f,
                value: f.sources[i]?.value ?? f.value,
                status: 'verified',
                conflict: false,
                verifiedBy: { name: 'Krishna Dhara Syava', at: new Date().toISOString() },
              })),
            onCommitEdit:
              field.status === 'locked' || field.status === 'verified'
                ? undefined
                : (v) =>
                    setField((f) => ({
                      ...f,
                      value: v,
                      status: 'manual',
                      editedBy: { name: 'Krishna Dhara Syava', at: new Date().toISOString(), previousValue: f.value },
                    })),
          }}
        />
        {dirty && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Reset ${row.title} example`}
            className="absolute -right-2 -top-2 rounded-full border border-border bg-card text-muted-foreground shadow-xs"
            onClick={() => setField(row.field)}
          >
            <RotateCcw />
          </Button>
        )}
      </div>
    </div>
  )
}

export function LegendView() {
  const rows = React.useMemo(makeRows, [])
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 py-8">
        <h1 className="text-2xl tracking-tight">The interaction grammar</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every value in Ledgerline is in exactly one of these states, and each state looks and
          behaves the same everywhere it appears — on return lines, on document annotations, and on
          dashboard rows. The examples below are live: try them.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-muted-foreground">
          <li>Color is never the only signal — every state also has a glyph or shape.</li>
          <li>Verification calms the screen: decoration disappears as you verify.</li>
          <li>Disabled controls always explain themselves on hover.</li>
        </ul>
        <Separator className="mt-6" />
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <LegendRow key={row.field.id} row={row} />
          ))}
        </div>
      </div>
    </div>
  )
}
