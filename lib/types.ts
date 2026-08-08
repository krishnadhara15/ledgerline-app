export type SourceRef = {
  docId: string
  page: number
  region: { x: number; y: number; w: number; h: number } // percentages of the page
  label: string // "Box 1 — Wages"
  value: number
}

export type FieldStatus =
  | 'auto_applied' // AI, high confidence — applied without asking, still fully traceable
  | 'suggested' // AI, medium confidence — waits for Accept / Edit / Reject
  | 'flagged' // AI, low confidence or conflict — asks a question instead of guessing
  | 'needs_approval' // human approval gate; blocks dependent calculations
  | 'verified' // a human confirmed it; decoration goes quiet
  | 'locked' // read-only, reason always available
  | 'manual' // typed by a human; the ABSENCE of a source is shown loudly

export type Field = {
  id: string
  returnId: string
  section: 'Income' | 'Adjustments' | 'Deductions' | 'Tax & Payments'
  formLine: string // "Form 1040 · Line 1a"
  label: string
  value: number
  status: FieldStatus
  confidence: number | null // 0–1; null for manual/locked/calculated
  aiNote: string | null // Layer 1 plain claim: "Read from W-2 (Acme Corp), Box 1"
  uncertaintyNote: string | null // words, not numbers
  reasoning: string | null // Layer 3 detail: matching logic, alternatives considered
  sources: SourceRef[] // empty for manual — that emptiness is a feature
  transform: string | null // "Sum of 2 sources" | "Converted GBP→USD @ 1.27"
  derivedFrom: string[] // field ids → calculated field; enables recursive tracing
  formula?: string // "line-9 - line-10" (ASCII operators; rendered prettily)
  lockedReason?: string
  verifiedBy?: { name: string; at: string }
  editedBy?: { name: string; at: string; previousValue: number } // set by the correction flow
  // --- optional extensions beyond the base spec ---
  textValue?: string // non-numeric display value (e.g. filing status)
  enteredBy?: { name: string; at: string } // provenance of an original manual entry
  conflict?: boolean // true when sources disagree and the CPA must pick one
  chosenSourceIndex?: number // records which source resolved a conflict
}

export type SourceDoc = {
  id: string
  title: string // "W-2 — Acme Corp (2025)"
  kind: 'W-2' | '1099-INT' | '1099-DIV' | 'Receipt' | 'Foreign statement'
  pages: number
  quality: 'clean' | 'low_quality_scan' | 'handwritten'
}

export type TaxReturn = {
  id: string
  client: string
  form: '1040' | '1120-S' | '1065'
  status:
    | 'waiting_on_client'
    | 'preparing'
    | 'in_review'
    | 'ready_to_sign'
    | 'filed'
    | 'accepted'
  assignee: string
  deadline: string // ISO date
  daysBlocked: number
  clientJustReplied: boolean
  reviewerIdleDays: number
  complexity: 1 | 2 | 3
  openFlags: number
  unverifiedCount: number
}

export type ActivityEvent = {
  at: string
  actor: 'AI' | string
  kind:
    | 'read'
    | 'applied'
    | 'suggested'
    | 'flagged'
    | 'override'
    | 'verified'
    | 'approved'
  detail: string // "Read W-2 (Acme Corp) page 1 · matched Box 1 to Line 1a"
  fieldId?: string
}

/** A positioned cell rendered on a fake document page. Fields' SourceRefs
 * reuse these exact regions so highlight overlays land on the number. */
export type DocCell = {
  page: number
  region: { x: number; y: number; w: number; h: number }
  label: string
  text: string
  emphasis?: boolean
}
