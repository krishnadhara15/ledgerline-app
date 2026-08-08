'use client'

import * as React from 'react'
import type { DocCell, SourceDoc } from '@/lib/types'
import type { Region } from '@/lib/doc-regions'
import { cn } from '@/lib/utils'

export type DocHighlight = {
  region: Region
  mode: 'pulse' | 'peek'
  /** Changing the nonce re-triggers the one-shot pulse. */
  nonce: number
  chip?: React.ReactNode
}

function pct(r: Region): React.CSSProperties {
  return {
    left: `${r.x}%`,
    top: `${r.y}%`,
    width: `${r.w}%`,
    height: `${r.h}%`,
  }
}

function KindChrome({ doc }: { doc: SourceDoc }) {
  switch (doc.kind) {
    case 'W-2':
      return (
        <>
          <div className="absolute left-[5%] top-[4%] right-[5%] flex items-baseline justify-between border-b-2 border-neutral-800 pb-1">
            <span className="text-[0.9em] font-bold tracking-tight">Form W-2</span>
            <span className="text-[0.55em]">Wage and Tax Statement</span>
            <span className="text-[0.9em] font-bold">2025</span>
          </div>
          <div className="absolute left-[5%] top-[10.5%] text-[0.5em] text-neutral-500">
            Copy B — to be filed with employee&apos;s federal tax return
          </div>
          <div className="absolute left-[5%] top-[46%] right-[5%] border-t border-neutral-300" />
          <div className="absolute left-[5%] top-[48%] text-[0.5em] text-neutral-400">
            Department of the Treasury — Internal Revenue Service
          </div>
        </>
      )
    case '1099-INT':
    case '1099-DIV':
      return (
        <>
          <div className="absolute left-[5%] top-[4%] right-[5%] flex items-baseline justify-between border-b-2 border-neutral-800 pb-1">
            <span className="text-[0.9em] font-bold tracking-tight">Form {doc.kind}</span>
            <span className="text-[0.55em]">
              {doc.kind === '1099-INT' ? 'Interest Income' : 'Dividends and Distributions'}
            </span>
            <span className="text-[0.9em] font-bold">2025</span>
          </div>
          <div className="absolute left-[5%] top-[10.5%] text-[0.5em] text-neutral-500">
            Copy B — for recipient
          </div>
          <div className="absolute left-[5%] top-[44%] right-[5%] border-t border-neutral-300" />
          <div className="absolute left-[5%] top-[46%] text-[0.5em] text-neutral-400">
            Department of the Treasury — Internal Revenue Service
          </div>
        </>
      )
    case 'Foreign statement':
      return (
        <>
          <div className="absolute left-[8%] top-[6%]">
            <span className="font-serif text-[1.1em] font-bold tracking-wide text-[#00395d]">
              BARCLAYS
            </span>
            <p className="text-[0.5em] text-neutral-500">1 Churchill Place, London E14 5HP</p>
          </div>
          <div className="absolute right-[8%] top-[7%] text-right text-[0.55em] text-neutral-600">
            Annual interest summary
            <br />
            Tax year ending 5 April 2026
          </div>
          <div className="absolute left-[8%] top-[18%] right-[8%] border-t border-neutral-300" />
          <div className="absolute left-[8%] top-[38%] right-[8%] border-t border-neutral-200" />
          <div className="absolute left-[8%] top-[40%] text-[0.6em] font-medium text-neutral-700">
            Interest earned
          </div>
          <div className="absolute left-[8%] top-[52%] right-[8%] border-t border-neutral-200" />
          <div className="absolute left-[8%] bottom-[8%] text-[0.5em] text-neutral-400">
            Barclays Bank UK PLC is authorised by the Prudential Regulation Authority
          </div>
        </>
      )
    case 'Receipt':
      return (
        <>
          <div className="absolute left-[10%] top-[5%] right-[10%] border-b border-neutral-300 pb-2 text-center">
            <span className="font-serif text-[0.95em] font-semibold text-[#1a4d8f]">goodwill</span>
            <p className="text-[0.5em] text-neutral-500">Donation acknowledgement — keep for your records</p>
          </div>
          <div className="absolute left-[10%] top-[30%] text-[0.6em] text-neutral-600">Date:</div>
          <div className="absolute left-[10%] top-[43%] text-[0.6em] text-neutral-600">
            Estimated value of donated goods:
          </div>
          <div className="absolute left-[10%] top-[70%] text-[0.6em] text-neutral-600">
            Received by:
          </div>
          <div className="absolute left-[52%] top-[80%] right-[10%] border-t border-neutral-400" />
          <div className="absolute left-[10%] bottom-[6%] text-[0.45em] text-neutral-400">
            No goods or services were provided in exchange for this donation.
          </div>
        </>
      )
  }
}

/**
 * A source document rendered as a component styled like a scanned form.
 * Values are absolutely positioned with the same percentage coordinates as
 * SourceRef.region, so highlight overlays land exactly on the number.
 */
export function FakeDocument({
  doc,
  cells,
  highlight,
  className,
}: {
  doc: SourceDoc
  cells: DocCell[]
  highlight?: DocHighlight | null
  className?: string
}) {
  const boxed = doc.kind === 'W-2' || doc.kind === '1099-INT' || doc.kind === '1099-DIV'
  const handwritten = doc.quality === 'handwritten'

  return (
    <div
      className={cn(
        'relative aspect-[8.5/11] w-full select-none overflow-hidden rounded-[2px] bg-white text-neutral-800 shadow-md ring-1 ring-black/10',
        doc.quality === 'low_quality_scan' && 'scan-grain rotate-[0.4deg] blur-[0.4px] contrast-[1.18] brightness-[0.97] saturate-[0.85]',
        className
      )}
      // The page is a container; the inner layer hangs all text off a
      // cqw-based em scale so type stays proportional at any pane width.
      style={{ containerType: 'inline-size' }}
    >
      <div className="absolute inset-0" style={{ fontSize: 'clamp(7px, 2.45cqw, 18px)' }}>
        <KindChrome doc={doc} />

        {cells.map((cell, i) =>
          boxed ? (
            <div
              key={i}
              className="absolute border border-neutral-400 bg-white/60 px-[0.3em] py-[0.1em]"
              style={pct(cell.region)}
            >
              <span className="block truncate text-[0.42em] uppercase leading-tight tracking-wide text-neutral-500">
                {cell.label}
              </span>
              <span
                className={cn(
                  'block truncate leading-tight',
                  cell.emphasis ? 'text-[0.72em] font-semibold' : 'text-[0.6em]'
                )}
              >
                {cell.text}
              </span>
            </div>
          ) : (
            <div key={i} className="absolute" style={pct(cell.region)}>
              <span
                className={cn(
                  'block leading-tight',
                  handwritten
                    ? 'rotate-[-1.5deg] text-[1.15em] text-[#1c2f6b]'
                    : cell.emphasis
                      ? 'text-[0.72em] font-semibold'
                      : 'text-[0.6em]'
                )}
                style={handwritten ? { fontFamily: 'var(--font-hand)' } : undefined}
              >
                {cell.text}
              </span>
            </div>
          )
        )}
      </div>

      {highlight && (
        <div
          key={highlight.nonce}
          className={cn(
            'pointer-events-none absolute rounded-[2px] border-2',
            highlight.mode === 'pulse' && 'border-primary bg-primary/10 region-pulse',
            highlight.mode === 'peek' && 'border-primary/50 region-peek'
          )}
          style={{
            left: `calc(${highlight.region.x}% - 0.35%)`,
            top: `calc(${highlight.region.y}% - 0.5%)`,
            width: `calc(${highlight.region.w}% + 0.7%)`,
            height: `calc(${highlight.region.h}% + 1%)`,
          }}
        >
          {highlight.chip && (
            <div className="absolute -top-1 left-0 -translate-y-full">{highlight.chip}</div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Layer-2 evidence crop: the same FakeDocument, framed and transformed so the
 * source region fills the crop. No image files anywhere.
 */
export function EvidenceCrop({
  doc,
  cells,
  region,
  className,
}: {
  doc: SourceDoc
  cells: DocCell[]
  region: Region
  className?: string
}) {
  const cropW = 288 // px, w-72
  const pageW = 640
  const pageH = (pageW * 11) / 8.5
  const pad = 2.5 // % of page padding around the region
  const scale = cropW / ((pageW * (region.w + pad * 2)) / 100)
  const tx = (-(region.x - pad) / 100) * pageW * scale
  const ty = (-(region.y - pad) / 100) * pageH * scale
  const cropH = Math.min(((pageH * (region.h + pad * 2)) / 100) * scale, 160)

  return (
    <div
      className={cn('relative overflow-hidden rounded-sm border border-border bg-neutral-100', className)}
      style={{ width: cropW, height: cropH }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: pageW, transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        <FakeDocument doc={doc} cells={cells} highlight={{ region, mode: 'pulse', nonce: 0 }} />
      </div>
    </div>
  )
}
