import { faker } from '@faker-js/faker'
import type {
  ActivityEvent,
  DocCell,
  Field,
  SourceDoc,
  TaxReturn,
} from './types'
import {
  DIV_REGIONS,
  FOREIGN_REGIONS,
  INT_REGIONS,
  RECEIPT_REGIONS,
  W2_REGIONS,
} from './doc-regions'

export const CURRENT_USER = 'Krishna Dhara Syava'

export const HERO_RETURN_ID = 'ret-chen-1040'
export const EMPTY_RETURN_ID = 'ret-okafor-1040'

/** Fixed seed — every load generates identical data. */
export const GENERATED_SEED = 20260408

function isoInDays(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

const fmt = (n: number) => n.toLocaleString('en-US')

// ---------------------------------------------------------------------------
// Hero return — Sarah Chen, Form 1040
// ---------------------------------------------------------------------------

const heroDocs: SourceDoc[] = [
  { id: 'doc-w2-acme', title: 'W-2 — Acme Corp (2025)', kind: 'W-2', pages: 1, quality: 'clean' },
  { id: 'doc-w2-northwind', title: 'W-2 — Northwind LLC (2025)', kind: 'W-2', pages: 1, quality: 'clean' },
  { id: 'doc-1099int-fnb', title: '1099-INT — First National Bank (2025)', kind: '1099-INT', pages: 1, quality: 'low_quality_scan' },
  { id: 'doc-1099div-a', title: '1099-DIV — Vanguard Brokerage (2025) · copy A', kind: '1099-DIV', pages: 1, quality: 'clean' },
  { id: 'doc-1099div-b', title: '1099-DIV — Vanguard Brokerage (2025) · copy B', kind: '1099-DIV', pages: 1, quality: 'clean' },
  { id: 'doc-foreign-barclays', title: 'Foreign statement — Barclays UK (2025)', kind: 'Foreign statement', pages: 1, quality: 'clean' },
  { id: 'doc-receipt-goodwill', title: 'Receipt — Goodwill donation (handwritten)', kind: 'Receipt', pages: 1, quality: 'handwritten' },
]

function w2Cells(opts: {
  ein: string
  employer: string
  employee: string
  box1: number
  box2: number
  box3: number
  box5: number
}): DocCell[] {
  return [
    { page: 1, region: W2_REGIONS.ein, label: 'b — Employer EIN', text: opts.ein },
    { page: 1, region: W2_REGIONS.employer, label: 'c — Employer name', text: opts.employer },
    { page: 1, region: W2_REGIONS.employee, label: 'e — Employee', text: opts.employee },
    { page: 1, region: W2_REGIONS.wagesBox1, label: 'Box 1 — Wages', text: fmt(opts.box1), emphasis: true },
    { page: 1, region: W2_REGIONS.fedTaxBox2, label: 'Box 2 — Federal income tax withheld', text: fmt(opts.box2), emphasis: true },
    { page: 1, region: W2_REGIONS.ssWagesBox3, label: 'Box 3 — Social security wages', text: fmt(opts.box3) },
    { page: 1, region: W2_REGIONS.ssTaxBox4, label: 'Box 4 — Social security tax', text: fmt(Math.round(opts.box3 * 0.062)) },
    { page: 1, region: W2_REGIONS.medicareWagesBox5, label: 'Box 5 — Medicare wages', text: fmt(opts.box5) },
    { page: 1, region: W2_REGIONS.medicareTaxBox6, label: 'Box 6 — Medicare tax', text: fmt(Math.round(opts.box5 * 0.0145)) },
  ]
}

const heroCells: Record<string, DocCell[]> = {
  'doc-w2-acme': w2Cells({
    ein: '82-4401173',
    employer: 'Acme Corp · 500 Harrison Ave, Boston MA',
    employee: 'Sarah Chen',
    box1: 96200,
    box2: 14890,
    box3: 96200,
    box5: 96200,
  }),
  'doc-w2-northwind': w2Cells({
    ein: '47-2210984',
    employer: 'Northwind LLC · 77 Pine St, Seattle WA',
    employee: 'Sarah Chen',
    box1: 32250,
    box2: 3350,
    box3: 32250,
    box5: 32250,
  }),
  'doc-1099int-fnb': [
    { page: 1, region: INT_REGIONS.payer, label: 'Payer', text: 'First National Bank · PO Box 900, Chicago IL' },
    { page: 1, region: INT_REGIONS.recipient, label: 'Recipient', text: 'Sarah Chen' },
    { page: 1, region: INT_REGIONS.interestBox1, label: 'Box 1 — Interest income', text: '412', emphasis: true },
    { page: 1, region: INT_REGIONS.taxExemptBox8, label: 'Box 8 — Tax-exempt interest', text: '180', emphasis: true },
  ],
  'doc-1099div-a': [
    { page: 1, region: DIV_REGIONS.payer, label: 'Payer', text: 'Vanguard Brokerage Services' },
    { page: 1, region: DIV_REGIONS.payerTin, label: 'Payer TIN', text: '23-7112009' },
    { page: 1, region: DIV_REGIONS.ordinaryBox1a, label: 'Box 1a — Total ordinary dividends', text: '1,850', emphasis: true },
    { page: 1, region: DIV_REGIONS.qualifiedBox1b, label: 'Box 1b — Qualified dividends', text: '1,240', emphasis: true },
  ],
  'doc-1099div-b': [
    { page: 1, region: DIV_REGIONS.payer, label: 'Payer', text: 'Vanguard Brokerage Services' },
    { page: 1, region: DIV_REGIONS.payerTin, label: 'Payer TIN', text: '23-7112009' },
    { page: 1, region: DIV_REGIONS.ordinaryBox1a, label: 'Box 1a — Total ordinary dividends', text: '1,580', emphasis: true },
    { page: 1, region: DIV_REGIONS.qualifiedBox1b, label: 'Box 1b — Qualified dividends', text: '1,240', emphasis: true },
  ],
  'doc-foreign-barclays': [
    { page: 1, region: FOREIGN_REGIONS.holder, label: 'Account holder', text: 'Ms Sarah Chen — account 8842-19' },
    { page: 1, region: FOREIGN_REGIONS.interestLine, label: 'Gross interest credited', text: '£4,000.00', emphasis: true },
    { page: 1, region: FOREIGN_REGIONS.fxNote, label: 'Note', text: 'All figures in pounds sterling (GBP)' },
  ],
  'doc-receipt-goodwill': [
    { page: 1, region: RECEIPT_REGIONS.org, label: 'Organization', text: 'Goodwill of Greater Boston' },
    { page: 1, region: RECEIPT_REGIONS.date, label: 'Date', text: 'Feb 9, 2026' },
    { page: 1, region: RECEIPT_REGIONS.amount, label: 'Donation amount', text: '$2,500', emphasis: true },
    { page: 1, region: RECEIPT_REGIONS.signature, label: 'Signature', text: 'R. Whitfield' },
  ],
}

const heroFields: Field[] = [
  {
    id: 'line-1a',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 1a',
    label: 'Wages, salaries, tips',
    value: 128450,
    status: 'auto_applied',
    confidence: 0.98,
    aiNote: 'Read from two W-2s (Acme Corp, Northwind LLC), Box 1, and summed.',
    uncertaintyNote: null,
    reasoning:
      'Both W-2s list Sarah Chen as employee with distinct employer EINs (82-4401173, 47-2210984), so they are separate jobs, not duplicates. Box 1 amounts were read at high confidence from clean scans and summed per Form 1040 instructions for multiple employers.',
    sources: [
      { docId: 'doc-w2-acme', page: 1, region: W2_REGIONS.wagesBox1, label: 'Box 1 — Wages', value: 96200 },
      { docId: 'doc-w2-northwind', page: 1, region: W2_REGIONS.wagesBox1, label: 'Box 1 — Wages', value: 32250 },
    ],
    transform: 'Sum of 2 sources',
    derivedFrom: [],
  },
  {
    id: 'line-2a',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 2a',
    label: 'Tax-exempt interest',
    value: 180,
    status: 'verified',
    confidence: 0.93,
    aiNote: 'Read from 1099-INT (First National Bank), Box 8.',
    uncertaintyNote: null,
    reasoning:
      'Box 8 on the 1099-INT is printed clearly despite the low overall scan quality; the digits matched on two OCR passes.',
    sources: [
      { docId: 'doc-1099int-fnb', page: 1, region: INT_REGIONS.taxExemptBox8, label: 'Box 8 — Tax-exempt interest', value: 180 },
    ],
    transform: null,
    derivedFrom: [],
    verifiedBy: { name: 'D. Kim', at: '2026-03-13T15:20:00Z' },
  },
  {
    id: 'line-2b',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 2b',
    label: 'Taxable interest',
    value: 412,
    status: 'flagged',
    confidence: 0.58,
    aiNote: 'Read from 1099-INT (First National Bank), Box 1 — but the scan is hard to read.',
    uncertaintyNote:
      'The scan is low quality — the amount could read $412 or $472. Please confirm against the original.',
    reasoning:
      'The second digit of Box 1 is ambiguous in the scan: it renders as "1" in one OCR pass and "7" in another. $412 scored marginally higher on stroke match, but the difference is inside the error band, so this is flagged rather than applied.',
    sources: [
      { docId: 'doc-1099int-fnb', page: 1, region: INT_REGIONS.interestBox1, label: 'Box 1 — Interest income', value: 412 },
    ],
    transform: null,
    derivedFrom: [],
  },
  {
    id: 'line-3a',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 3a',
    label: 'Qualified dividends',
    value: 1240,
    status: 'verified',
    confidence: 0.95,
    aiNote: 'Read from 1099-DIV (Vanguard Brokerage), Box 1b.',
    uncertaintyNote: null,
    reasoning:
      'Box 1b is identical ($1,240) on both copies of the Vanguard 1099-DIV, so the Box 1a disagreement does not affect this line.',
    sources: [
      { docId: 'doc-1099div-a', page: 1, region: DIV_REGIONS.qualifiedBox1b, label: 'Box 1b — Qualified dividends', value: 1240 },
    ],
    transform: null,
    derivedFrom: [],
    verifiedBy: { name: 'D. Kim', at: '2026-03-13T15:24:00Z' },
  },
  {
    id: 'line-3b',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 3b',
    label: 'Ordinary dividends',
    value: 1850,
    status: 'flagged',
    conflict: true,
    confidence: 0.52,
    aiNote: 'Two 1099-DIV copies from the same payer disagree on Box 1a.',
    uncertaintyNote:
      'Two 1099-DIV documents share the same payer TIN (23-7112009) but disagree: $1,850 vs $1,580 — the digits look transposed. Pick the copy that matches the original.',
    reasoning:
      'Both documents are from Vanguard Brokerage with identical payer TIN and recipient, which usually means a corrected reissue — but neither copy is marked CORRECTED. $1,850 and $1,580 differ by a digit transposition, a common re-key error. The AI will not guess between them.',
    sources: [
      { docId: 'doc-1099div-a', page: 1, region: DIV_REGIONS.ordinaryBox1a, label: 'Box 1a — Total ordinary dividends (copy A)', value: 1850 },
      { docId: 'doc-1099div-b', page: 1, region: DIV_REGIONS.ordinaryBox1a, label: 'Box 1a — Total ordinary dividends (copy B)', value: 1580 },
    ],
    transform: null,
    derivedFrom: [],
  },
  {
    id: 'line-8',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 8',
    label: 'Other income — foreign interest',
    value: 5080,
    status: 'suggested',
    confidence: 0.81,
    aiNote: 'Read £4,000 from the Barclays UK statement and converted at 1.27 USD/GBP.',
    uncertaintyNote:
      'The conversion uses the IRS yearly average rate. If the client prefers the transaction-date rate, this number changes slightly.',
    reasoning:
      'The Barclays statement shows gross interest of £4,000.00 credited during 2025. Applied the IRS yearly average exchange rate for 2025 (1 GBP = 1.27 USD): 4,000 × 1.27 = $5,080. Alternative considered: spot rate on the credit date (1.253), which would give $5,012.',
    sources: [
      { docId: 'doc-foreign-barclays', page: 1, region: FOREIGN_REGIONS.interestLine, label: 'Gross interest credited — £4,000', value: 4000 },
    ],
    transform: 'Converted GBP→USD @ 1.27',
    derivedFrom: [],
  },
  {
    id: 'line-9',
    returnId: HERO_RETURN_ID,
    section: 'Income',
    formLine: 'Form 1040 · Line 9',
    label: 'Total income',
    value: 135792,
    status: 'auto_applied',
    confidence: null,
    aiNote: null,
    uncertaintyNote: null,
    reasoning: null,
    sources: [],
    transform: null,
    derivedFrom: ['line-1a', 'line-2b', 'line-3b', 'line-8'],
    formula: 'line-1a + line-2b + line-3b + line-8',
  },
  {
    id: 'line-10',
    returnId: HERO_RETURN_ID,
    section: 'Adjustments',
    formLine: 'Form 1040 · Line 10',
    label: 'Adjustments to income',
    value: 2500,
    status: 'suggested',
    confidence: 0.71,
    aiNote: 'Read from a handwritten Goodwill donation receipt.',
    uncertaintyNote:
      'The receipt is handwritten — the amount reads as $2,500 but handwriting recognition is less reliable than print.',
    reasoning:
      'The receipt from Goodwill of Greater Boston is dated Feb 9, 2026 and signed. The handwritten amount was read as $2,500; the leading "2" and trailing zeros are clear, the comma placement was inferred. No other receipt in the file matches this donation.',
    sources: [
      { docId: 'doc-receipt-goodwill', page: 1, region: RECEIPT_REGIONS.amount, label: 'Donation amount — handwritten', value: 2500 },
    ],
    transform: null,
    derivedFrom: [],
  },
  {
    id: 'line-11',
    returnId: HERO_RETURN_ID,
    section: 'Adjustments',
    formLine: 'Form 1040 · Line 11',
    label: 'Adjusted gross income',
    value: 133292,
    status: 'auto_applied',
    confidence: null,
    aiNote: null,
    uncertaintyNote: null,
    reasoning: null,
    sources: [],
    transform: null,
    derivedFrom: ['line-9', 'line-10'],
    formula: 'line-9 - line-10',
  },
  {
    id: 'line-12s',
    returnId: HERO_RETURN_ID,
    section: 'Deductions',
    formLine: 'Form 1040 · Line 12',
    label: 'Standard deduction',
    value: 30000,
    status: 'verified',
    confidence: 0.99,
    aiNote: 'Standard amount for filing status Married filing jointly (2025).',
    uncertaintyNote: null,
    reasoning:
      'Applied the statutory 2025 standard deduction for Married filing jointly. No itemization schedule is present in the file, and the itemizable amounts found (charitable receipt) fall well below the standard deduction.',
    sources: [],
    transform: null,
    derivedFrom: [],
    verifiedBy: { name: 'D. Kim', at: '2026-03-13T15:31:00Z' },
  },
  {
    id: 'home-office',
    returnId: HERO_RETURN_ID,
    section: 'Deductions',
    formLine: 'Schedule C · Line 30',
    label: 'Home-office deduction',
    value: 3120,
    status: 'needs_approval',
    confidence: 0.84,
    aiNote: 'Computed with the simplified method: 208 sq ft × $15/sq ft.',
    uncertaintyNote:
      'Home-office deductions require preparer approval under firm policy before they enter the return.',
    reasoning:
      'The client questionnaire lists a dedicated home office of 208 sq ft used regularly and exclusively for the consulting business. Simplified method: 208 × $15 = $3,120 (safe-harbor capped at 300 sq ft). Actual-expense method was not computed because utility records are not in the file.',
    sources: [],
    transform: null,
    derivedFrom: [],
  },
  {
    id: 'line-12t',
    returnId: HERO_RETURN_ID,
    section: 'Deductions',
    formLine: 'Deductions · Total',
    label: 'Total deductions',
    value: 33120,
    status: 'auto_applied',
    confidence: null,
    aiNote: null,
    uncertaintyNote: null,
    reasoning: null,
    sources: [],
    transform: null,
    derivedFrom: ['line-12s', 'home-office'],
    formula: 'line-12s + home-office',
  },
  {
    id: 'filing-status',
    returnId: HERO_RETURN_ID,
    section: 'Tax & Payments',
    formLine: 'Form 1040 · Filing status',
    label: 'Filing status',
    value: 0,
    textValue: 'Married filing jointly',
    status: 'locked',
    confidence: null,
    aiNote: null,
    uncertaintyNote: null,
    reasoning: null,
    sources: [],
    transform: null,
    derivedFrom: [],
    lockedReason: 'Locked after e-file consent was signed on 2 Mar.',
  },
  {
    id: 'line-25a',
    returnId: HERO_RETURN_ID,
    section: 'Tax & Payments',
    formLine: 'Form 1040 · Line 25a',
    label: 'Federal income tax withheld',
    value: 18240,
    status: 'verified',
    confidence: 0.97,
    aiNote: 'Read from two W-2s (Acme Corp, Northwind LLC), Box 2, and summed.',
    uncertaintyNote: null,
    reasoning:
      'Box 2 read cleanly on both W-2s: $14,890 (Acme Corp) + $3,350 (Northwind LLC) = $18,240.',
    sources: [
      { docId: 'doc-w2-acme', page: 1, region: W2_REGIONS.fedTaxBox2, label: 'Box 2 — Federal income tax withheld', value: 14890 },
      { docId: 'doc-w2-northwind', page: 1, region: W2_REGIONS.fedTaxBox2, label: 'Box 2 — Federal income tax withheld', value: 3350 },
    ],
    transform: 'Sum of 2 sources',
    derivedFrom: [],
    verifiedBy: { name: 'D. Kim', at: '2026-03-13T15:36:00Z' },
  },
  {
    id: 'est-payments',
    returnId: HERO_RETURN_ID,
    section: 'Tax & Payments',
    formLine: 'Form 1040 · Line 26',
    label: '2025 estimated tax payments',
    value: 8000,
    status: 'manual',
    confidence: null,
    aiNote: null,
    uncertaintyNote: null,
    reasoning: null,
    sources: [],
    transform: null,
    derivedFrom: [],
    enteredBy: { name: 'Krishna Dhara Syava', at: '2026-03-12T18:05:00Z' },
  },
]

const heroEvents: ActivityEvent[] = [
  { at: '2026-03-10T14:02:00Z', actor: 'AI', kind: 'read', detail: 'Read W-2 (Acme Corp) page 1 · found boxes 1–6' },
  { at: '2026-03-10T14:02:20Z', actor: 'AI', kind: 'read', detail: 'Read W-2 (Northwind LLC) page 1 · found boxes 1–6' },
  { at: '2026-03-10T14:02:45Z', actor: 'AI', kind: 'applied', detail: 'Applied Line 1a Wages $128,450 · sum of Box 1 from 2 W-2s (confidence 98%)', fieldId: 'line-1a' },
  { at: '2026-03-10T14:03:10Z', actor: 'AI', kind: 'read', detail: 'Read 1099-INT (First National Bank) page 1 · low-quality scan detected' },
  { at: '2026-03-10T14:03:30Z', actor: 'AI', kind: 'applied', detail: 'Applied Line 2a Tax-exempt interest $180 · Box 8 legible on both OCR passes', fieldId: 'line-2a' },
  { at: '2026-03-10T14:03:52Z', actor: 'AI', kind: 'flagged', detail: 'Flagged Line 2b Taxable interest · Box 1 could read $412 or $472 — asked for confirmation', fieldId: 'line-2b' },
  { at: '2026-03-10T14:04:15Z', actor: 'AI', kind: 'read', detail: 'Read 1099-DIV (Vanguard Brokerage, copy A) page 1' },
  { at: '2026-03-10T14:04:33Z', actor: 'AI', kind: 'read', detail: 'Read 1099-DIV (Vanguard Brokerage, copy B) page 1 · same payer TIN as copy A' },
  { at: '2026-03-10T14:04:58Z', actor: 'AI', kind: 'applied', detail: 'Applied Line 3a Qualified dividends $1,240 · Box 1b identical on both copies', fieldId: 'line-3a' },
  { at: '2026-03-10T14:05:20Z', actor: 'AI', kind: 'flagged', detail: 'Flagged Line 3b Ordinary dividends · copies disagree $1,850 vs $1,580 — asked the preparer to pick one', fieldId: 'line-3b' },
  { at: '2026-03-10T14:05:48Z', actor: 'AI', kind: 'read', detail: 'Read Foreign statement (Barclays UK) page 1 · figures in GBP' },
  { at: '2026-03-10T14:06:12Z', actor: 'AI', kind: 'suggested', detail: 'Suggested Line 8 Other income $5,080 · £4,000 converted GBP→USD @ 1.27 (confidence 81%)', fieldId: 'line-8' },
  { at: '2026-03-10T14:06:40Z', actor: 'AI', kind: 'read', detail: 'Read Receipt (Goodwill donation) page 1 · handwritten values' },
  { at: '2026-03-10T14:07:05Z', actor: 'AI', kind: 'suggested', detail: 'Suggested Line 10 Adjustments $2,500 · handwritten donation receipt (confidence 71%)', fieldId: 'line-10' },
  { at: '2026-03-10T14:07:30Z', actor: 'AI', kind: 'applied', detail: 'Applied Line 12 Standard deduction $30,000 · statutory amount for Married filing jointly', fieldId: 'line-12s' },
  { at: '2026-03-10T14:07:55Z', actor: 'AI', kind: 'suggested', detail: 'Computed Home-office deduction $3,120 · routed for approval per firm policy on Schedule C home office', fieldId: 'home-office' },
  { at: '2026-03-10T14:08:20Z', actor: 'AI', kind: 'applied', detail: 'Applied Line 25a Federal tax withheld $18,240 · sum of Box 2 from 2 W-2s', fieldId: 'line-25a' },
  { at: '2026-03-10T14:08:45Z', actor: 'AI', kind: 'applied', detail: 'Computed Line 9 Total income $135,792 from 4 operands', fieldId: 'line-9' },
  { at: '2026-03-10T14:08:50Z', actor: 'AI', kind: 'applied', detail: 'Computed Line 11 Adjusted gross income $133,292 (Line 9 − Line 10)', fieldId: 'line-11' },
  { at: '2026-03-10T14:08:55Z', actor: 'AI', kind: 'applied', detail: 'Computed Total deductions $33,120 · blocked from finalizing until the home-office deduction is approved', fieldId: 'line-12t' },
  { at: '2026-03-11T09:15:00Z', actor: 'System', kind: 'applied', detail: 'Locked Filing status (Married filing jointly) · e-file consent signed 2 Mar', fieldId: 'filing-status' },
  { at: '2026-03-12T18:05:00Z', actor: 'Krishna Dhara Syava', kind: 'override', detail: 'Manually entered Line 26 Estimated tax payments $8,000 · no source document on file', fieldId: 'est-payments' },
  { at: '2026-03-13T15:20:00Z', actor: 'D. Kim', kind: 'verified', detail: 'Verified Line 2a Tax-exempt interest $180', fieldId: 'line-2a' },
  { at: '2026-03-13T15:24:00Z', actor: 'D. Kim', kind: 'verified', detail: 'Verified Line 3a Qualified dividends $1,240', fieldId: 'line-3a' },
  { at: '2026-03-13T15:31:00Z', actor: 'D. Kim', kind: 'verified', detail: 'Verified Line 12 Standard deduction $30,000', fieldId: 'line-12s' },
  { at: '2026-03-13T15:36:00Z', actor: 'D. Kim', kind: 'verified', detail: 'Verified Line 25a Federal tax withheld $18,240', fieldId: 'line-25a' },
]

// ---------------------------------------------------------------------------
// Handcrafted returns for the dashboard Today band
// ---------------------------------------------------------------------------

export const HANDCRAFTED_RETURNS: TaxReturn[] = [
  {
    id: HERO_RETURN_ID,
    client: 'Sarah Chen',
    form: '1040',
    status: 'in_review',
    assignee: 'Krishna Dhara Syava',
    deadline: isoInDays(2),
    daysBlocked: 0,
    clientJustReplied: true,
    reviewerIdleDays: 1,
    complexity: 3,
    openFlags: 2,
    unverifiedCount: 9,
  },
  {
    id: EMPTY_RETURN_ID,
    client: 'David Okafor',
    form: '1040',
    status: 'waiting_on_client',
    assignee: 'Krishna Dhara Syava',
    deadline: isoInDays(9),
    daysBlocked: 6,
    clientJustReplied: false,
    reviewerIdleDays: 0,
    complexity: 1,
    openFlags: 0,
    unverifiedCount: 0,
  },
  {
    id: 'ret-brightpath-1120s',
    client: 'BrightPath Labs Inc.',
    form: '1120-S',
    status: 'preparing',
    assignee: 'D. Kim',
    deadline: isoInDays(4),
    daysBlocked: 0,
    clientJustReplied: true,
    reviewerIdleDays: 2,
    complexity: 3,
    openFlags: 1,
    unverifiedCount: 12,
  },
  {
    id: 'ret-morrow-1065',
    client: 'Morrow & Finch Partners LLP',
    form: '1065',
    status: 'in_review',
    assignee: 'Krishna Dhara Syava',
    deadline: isoInDays(6),
    daysBlocked: 2,
    clientJustReplied: false,
    reviewerIdleDays: 3,
    complexity: 2,
    openFlags: 1,
    unverifiedCount: 7,
  },
  {
    id: 'ret-osei-1040',
    client: 'Kwame Osei',
    form: '1040',
    status: 'ready_to_sign',
    assignee: 'S. Romero',
    deadline: isoInDays(1),
    daysBlocked: 0,
    clientJustReplied: true,
    reviewerIdleDays: 0,
    complexity: 1,
    openFlags: 0,
    unverifiedCount: 0,
  },
  {
    id: 'ret-delgado-1040',
    client: 'Lucia Delgado',
    form: '1040',
    status: 'waiting_on_client',
    assignee: 'S. Romero',
    deadline: isoInDays(12),
    daysBlocked: 9,
    clientJustReplied: false,
    reviewerIdleDays: 0,
    complexity: 2,
    openFlags: 0,
    unverifiedCount: 3,
  },
]

// ---------------------------------------------------------------------------
// ~220 generated returns (fixed seed → identical on every load)
// ---------------------------------------------------------------------------

const TEAM = ['Krishna Dhara Syava', 'D. Kim', 'S. Romero', 'A. Novak', 'M. Reyes', 'T. Okonkwo']
const STATUSES: TaxReturn['status'][] = [
  'waiting_on_client',
  'preparing',
  'in_review',
  'ready_to_sign',
  'filed',
  'accepted',
]

function generateReturns(count: number): TaxReturn[] {
  faker.seed(GENERATED_SEED)
  const rows: TaxReturn[] = []
  for (let i = 0; i < count; i++) {
    const form = faker.helpers.weightedArrayElement([
      { value: '1040' as const, weight: 6 },
      { value: '1120-S' as const, weight: 2 },
      { value: '1065' as const, weight: 2 },
    ])
    const status = faker.helpers.weightedArrayElement([
      { value: STATUSES[0], weight: 2 },
      { value: STATUSES[1], weight: 3 },
      { value: STATUSES[2], weight: 3 },
      { value: STATUSES[3], weight: 1 },
      { value: STATUSES[4], weight: 2 },
      { value: STATUSES[5], weight: 2 },
    ])
    const done = status === 'filed' || status === 'accepted'
    const client =
      form === '1040'
        ? faker.person.fullName()
        : `${faker.company.name()}`
    rows.push({
      id: `ret-gen-${String(i + 1).padStart(3, '0')}`,
      client,
      form,
      status,
      assignee: faker.helpers.maybe(() => faker.helpers.arrayElement(TEAM), { probability: 0.92 }) ?? 'Unassigned',
      deadline: isoInDays(done ? faker.number.int({ min: -40, max: -5 }) : faker.number.int({ min: 0, max: 60 })),
      daysBlocked: status === 'waiting_on_client' ? faker.number.int({ min: 1, max: 12 }) : 0,
      clientJustReplied: !done && faker.datatype.boolean({ probability: 0.15 }),
      reviewerIdleDays: status === 'in_review' ? faker.number.int({ min: 0, max: 7 }) : 0,
      complexity: faker.helpers.arrayElement([1, 2, 3] as const),
      openFlags: done ? 0 : faker.number.int({ min: 0, max: 4 }),
      unverifiedCount: done ? 0 : faker.number.int({ min: 0, max: 30 }),
    })
  }
  return rows
}

export const GENERATED_RETURNS: TaxReturn[] = generateReturns(220)

export const ALL_RETURNS: TaxReturn[] = [...HANDCRAFTED_RETURNS, ...GENERATED_RETURNS]

export function getReturn(id: string): TaxReturn | undefined {
  return ALL_RETURNS.find((r) => r.id === id)
}

// ---------------------------------------------------------------------------
// Per-return bundle (fields + docs + cells + events)
// ---------------------------------------------------------------------------

export type ReturnBundle = {
  fields: Field[]
  docs: SourceDoc[]
  cells: Record<string, DocCell[]>
  events: ActivityEvent[]
}

/** Deterministic generic bundle for returns without an authored story, so
 * every row on the dashboard opens a working review screen. */
function genericBundle(returnId: string): ReturnBundle {
  const ret = getReturn(returnId)
  // Seed from the return id so each return is stable across loads.
  let hash = 0
  for (const ch of returnId) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  faker.seed(hash)

  const client = ret?.client ?? 'Client'
  const employer = faker.company.name()
  const bank = `${faker.location.city()} Savings Bank`
  const wages = faker.number.int({ min: 42, max: 240 }) * 500
  const withheld = Math.round(wages * 0.14)
  const interest = faker.number.int({ min: 3, max: 60 }) * 10
  const est = faker.number.int({ min: 0, max: 12 }) * 500

  const w2Id = `${returnId}-doc-w2`
  const intId = `${returnId}-doc-int`

  const docs: SourceDoc[] = [
    { id: w2Id, title: `W-2 — ${employer} (2025)`, kind: 'W-2', pages: 1, quality: 'clean' },
    { id: intId, title: `1099-INT — ${bank} (2025)`, kind: '1099-INT', pages: 1, quality: 'clean' },
  ]

  const cells: Record<string, DocCell[]> = {
    [w2Id]: w2Cells({
      ein: `${faker.number.int({ min: 10, max: 98 })}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
      employer,
      employee: client,
      box1: wages,
      box2: withheld,
      box3: wages,
      box5: wages,
    }),
    [intId]: [
      { page: 1, region: INT_REGIONS.payer, label: 'Payer', text: bank },
      { page: 1, region: INT_REGIONS.recipient, label: 'Recipient', text: client },
      { page: 1, region: INT_REGIONS.interestBox1, label: 'Box 1 — Interest income', text: fmt(interest), emphasis: true },
      { page: 1, region: INT_REGIONS.taxExemptBox8, label: 'Box 8 — Tax-exempt interest', text: '0' },
    ],
  }

  const fields: Field[] = [
    {
      id: 'line-1a',
      returnId,
      section: 'Income',
      formLine: 'Form 1040 · Line 1a',
      label: 'Wages, salaries, tips',
      value: wages,
      status: 'auto_applied',
      confidence: 0.97,
      aiNote: `Read from W-2 (${employer}), Box 1.`,
      uncertaintyNote: null,
      reasoning: 'Single W-2 in the file; Box 1 read cleanly at high confidence.',
      sources: [{ docId: w2Id, page: 1, region: W2_REGIONS.wagesBox1, label: 'Box 1 — Wages', value: wages }],
      transform: null,
      derivedFrom: [],
    },
    {
      id: 'line-2b',
      returnId,
      section: 'Income',
      formLine: 'Form 1040 · Line 2b',
      label: 'Taxable interest',
      value: interest,
      status: 'suggested',
      confidence: 0.82,
      aiNote: `Read from 1099-INT (${bank}), Box 1.`,
      uncertaintyNote: 'Only one interest statement is in the file — confirm no other accounts exist.',
      reasoning: 'Box 1 read cleanly; suggested rather than applied because interest income for this client varied year over year.',
      sources: [{ docId: intId, page: 1, region: INT_REGIONS.interestBox1, label: 'Box 1 — Interest income', value: interest }],
      transform: null,
      derivedFrom: [],
    },
    {
      id: 'line-9',
      returnId,
      section: 'Income',
      formLine: 'Form 1040 · Line 9',
      label: 'Total income',
      value: wages + interest,
      status: 'auto_applied',
      confidence: null,
      aiNote: null,
      uncertaintyNote: null,
      reasoning: null,
      sources: [],
      transform: null,
      derivedFrom: ['line-1a', 'line-2b'],
      formula: 'line-1a + line-2b',
    },
    {
      id: 'line-25a',
      returnId,
      section: 'Tax & Payments',
      formLine: 'Form 1040 · Line 25a',
      label: 'Federal income tax withheld',
      value: withheld,
      status: 'verified',
      confidence: 0.96,
      aiNote: `Read from W-2 (${employer}), Box 2.`,
      uncertaintyNote: null,
      reasoning: 'Box 2 read cleanly.',
      sources: [{ docId: w2Id, page: 1, region: W2_REGIONS.fedTaxBox2, label: 'Box 2 — Federal income tax withheld', value: withheld }],
      transform: null,
      derivedFrom: [],
      verifiedBy: { name: 'D. Kim', at: '2026-03-11T10:00:00Z' },
    },
    ...(est > 0
      ? [
          {
            id: 'est-payments',
            returnId,
            section: 'Tax & Payments' as const,
            formLine: 'Form 1040 · Line 26',
            label: '2025 estimated tax payments',
            value: est,
            status: 'manual' as const,
            confidence: null,
            aiNote: null,
            uncertaintyNote: null,
            reasoning: null,
            sources: [],
            transform: null,
            derivedFrom: [],
            enteredBy: { name: 'Krishna Dhara Syava', at: '2026-03-09T16:30:00Z' },
          },
        ]
      : []),
  ]

  const events: ActivityEvent[] = [
    { at: '2026-03-09T11:00:00Z', actor: 'AI', kind: 'read', detail: `Read W-2 (${employer}) page 1` },
    { at: '2026-03-09T11:00:30Z', actor: 'AI', kind: 'applied', detail: `Applied Line 1a Wages ${formatUsd(wages)} · W-2 Box 1`, fieldId: 'line-1a' },
    { at: '2026-03-09T11:01:00Z', actor: 'AI', kind: 'read', detail: `Read 1099-INT (${bank}) page 1` },
    { at: '2026-03-09T11:01:30Z', actor: 'AI', kind: 'suggested', detail: `Suggested Line 2b Taxable interest ${formatUsd(interest)}`, fieldId: 'line-2b' },
    { at: '2026-03-09T11:02:00Z', actor: 'AI', kind: 'applied', detail: `Applied Line 25a Federal tax withheld ${formatUsd(withheld)}`, fieldId: 'line-25a' },
    { at: '2026-03-11T10:00:00Z', actor: 'D. Kim', kind: 'verified', detail: `Verified Line 25a Federal tax withheld ${formatUsd(withheld)}`, fieldId: 'line-25a' },
  ]

  return { fields, docs, cells, events }
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

export function getReturnBundle(returnId: string): ReturnBundle {
  if (returnId === HERO_RETURN_ID) {
    return { fields: heroFields, docs: heroDocs, cells: heroCells, events: heroEvents }
  }
  if (returnId === EMPTY_RETURN_ID) {
    return {
      fields: [],
      docs: [],
      cells: {},
      events: [
        { at: '2026-03-06T09:12:00Z', actor: 'Krishna Dhara Syava', kind: 'flagged', detail: 'Requested W-2 and 1099s from David Okafor by email' },
        { at: '2026-03-10T09:00:00Z', actor: 'System', kind: 'flagged', detail: 'Automatic reminder sent — no documents received yet' },
      ],
    }
  }
  return genericBundle(returnId)
}
