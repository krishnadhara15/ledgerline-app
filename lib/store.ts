import { create } from 'zustand'
import type { ActivityEvent, Field } from './types'
import { CURRENT_USER, getReturnBundle } from './mock-data'
import { formatCurrency } from './format'

export type PropagationChange = {
  fieldId: string
  label: string
  before: number
  after: number
}

export type PropagationDiff = {
  causeFieldId: string
  causeLabel: string
  changes: PropagationChange[]
}

type ReturnState = {
  fields: Record<string, Field>
  fieldOrder: string[]
  events: ActivityEvent[]
}

type LedgerStore = {
  returns: Record<string, ReturnState>
  lastPropagation: PropagationDiff | null
  ensureReturn: (returnId: string) => void
  verifyField: (returnId: string, fieldId: string) => void
  acceptSuggestion: (returnId: string, fieldId: string) => void
  overrideValue: (returnId: string, fieldId: string, newValue: number) => void
  approveField: (returnId: string, fieldId: string) => void
  rejectApproval: (returnId: string, fieldId: string) => void
  resolveConflict: (returnId: string, fieldId: string, sourceIndex: number) => void
  confirmFlagged: (returnId: string, fieldId: string) => void
  logEvent: (returnId: string, event: Omit<ActivityEvent, 'at' | 'actor'> & { actor?: string }) => void
  clearPropagation: () => void
}

function nowIso(): string {
  return new Date().toISOString()
}

/** Evaluates a formula like "line-9 - line-10" left to right over field values. */
function evalFormula(formula: string, fields: Record<string, Field>): number {
  const tokens = formula.split(/\s+/)
  let acc = fields[tokens[0]]?.value ?? 0
  for (let i = 1; i < tokens.length - 1; i += 2) {
    const op = tokens[i]
    const operand = fields[tokens[i + 1]]?.value ?? 0
    acc = op === '-' ? acc - operand : acc + operand
  }
  return acc
}

/** Recomputes every calculated field until stable; returns what changed. */
function recompute(fields: Record<string, Field>): PropagationChange[] {
  const changes = new Map<string, PropagationChange>()
  for (let pass = 0; pass < 10; pass++) {
    let dirty = false
    for (const f of Object.values(fields)) {
      if (!f.formula || f.derivedFrom.length === 0) continue
      const next = evalFormula(f.formula, fields)
      if (next !== f.value) {
        const existing = changes.get(f.id)
        changes.set(f.id, {
          fieldId: f.id,
          label: f.formLine,
          before: existing ? existing.before : f.value,
          after: next,
        })
        fields[f.id] = { ...f, value: next }
        dirty = true
      }
    }
    if (!dirty) break
  }
  return [...changes.values()]
}

export const useLedgerStore = create<LedgerStore>((set, get) => {
  const withReturn = (
    returnId: string,
    fn: (state: ReturnState) => Partial<ReturnState> & { propagation?: PropagationDiff | null }
  ) => {
    get().ensureReturn(returnId)
    set((s) => {
      const current = s.returns[returnId]
      const { propagation, ...patch } = fn(current)
      return {
        returns: { ...s.returns, [returnId]: { ...current, ...patch } },
        ...(propagation !== undefined ? { lastPropagation: propagation } : {}),
      }
    })
  }

  const appendEvent = (
    state: ReturnState,
    kind: ActivityEvent['kind'],
    detail: string,
    fieldId?: string,
    actor: string = CURRENT_USER
  ): ActivityEvent[] => [...state.events, { at: nowIso(), actor, kind, detail, fieldId }]

  return {
    returns: {},
    lastPropagation: null,

    ensureReturn: (returnId) => {
      if (get().returns[returnId]) return
      const bundle = getReturnBundle(returnId)
      const fields: Record<string, Field> = {}
      for (const f of bundle.fields) fields[f.id] = f
      set((s) => ({
        returns: {
          ...s.returns,
          [returnId]: {
            fields,
            fieldOrder: bundle.fields.map((f) => f.id),
            events: bundle.events,
          },
        },
      }))
    },

    verifyField: (returnId, fieldId) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        if (!f) return {}
        const updated: Field = {
          ...f,
          status: 'verified',
          verifiedBy: { name: CURRENT_USER, at: nowIso() },
        }
        return {
          fields: { ...state.fields, [fieldId]: updated },
          events: appendEvent(
            state,
            'verified',
            `Verified ${f.formLine} ${f.label} ${f.textValue ?? formatCurrency(f.value)}`,
            fieldId
          ),
        }
      }),

    acceptSuggestion: (returnId, fieldId) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        if (!f) return {}
        const updated: Field = {
          ...f,
          status: 'verified',
          verifiedBy: { name: CURRENT_USER, at: nowIso() },
        }
        return {
          fields: { ...state.fields, [fieldId]: updated },
          events: appendEvent(
            state,
            'verified',
            `Accepted AI suggestion for ${f.formLine} ${f.label} · ${formatCurrency(f.value)}`,
            fieldId
          ),
        }
      }),

    overrideValue: (returnId, fieldId, newValue) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        if (!f || f.value === newValue) return {}
        const previousValue = f.value
        const nextFields: Record<string, Field> = {
          ...state.fields,
          [fieldId]: {
            ...f,
            value: newValue,
            status: 'manual',
            editedBy: { name: CURRENT_USER, at: nowIso(), previousValue },
          },
        }
        const changes = recompute(nextFields)
        const detailSuffix =
          changes.length > 0
            ? ` · ${changes.length} downstream value${changes.length === 1 ? '' : 's'} recomputed`
            : ''
        return {
          fields: nextFields,
          events: appendEvent(
            state,
            'override',
            `Overrode ${f.formLine} ${f.label}: ${formatCurrency(previousValue)} → ${formatCurrency(newValue)}${detailSuffix}`,
            fieldId
          ),
          propagation: {
            causeFieldId: fieldId,
            causeLabel: `${f.formLine} · ${f.label}`,
            changes,
          },
        }
      }),

    approveField: (returnId, fieldId) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        if (!f) return {}
        const updated: Field = {
          ...f,
          status: 'verified',
          verifiedBy: { name: CURRENT_USER, at: nowIso() },
        }
        return {
          fields: { ...state.fields, [fieldId]: updated },
          events: appendEvent(
            state,
            'approved',
            `Approved ${f.label} ${formatCurrency(f.value)} — dependent calculations unblocked`,
            fieldId
          ),
        }
      }),

    rejectApproval: (returnId, fieldId) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        if (!f) return {}
        const previousValue = f.value
        const nextFields: Record<string, Field> = {
          ...state.fields,
          [fieldId]: {
            ...f,
            value: 0,
            status: 'manual',
            editedBy: { name: CURRENT_USER, at: nowIso(), previousValue },
          },
        }
        const changes = recompute(nextFields)
        return {
          fields: nextFields,
          events: appendEvent(
            state,
            'override',
            `Rejected ${f.label} — removed ${formatCurrency(previousValue)} from the return`,
            fieldId
          ),
          propagation: {
            causeFieldId: fieldId,
            causeLabel: `${f.formLine} · ${f.label}`,
            changes,
          },
        }
      }),

    resolveConflict: (returnId, fieldId, sourceIndex) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        const chosen = f?.sources[sourceIndex]
        if (!f || !chosen) return {}
        const previousValue = f.value
        const nextFields: Record<string, Field> = {
          ...state.fields,
          [fieldId]: {
            ...f,
            value: chosen.value,
            status: 'verified',
            conflict: false,
            chosenSourceIndex: sourceIndex,
            verifiedBy: { name: CURRENT_USER, at: nowIso() },
          },
        }
        const changes = recompute(nextFields)
        return {
          fields: nextFields,
          events: appendEvent(
            state,
            'override',
            `Resolved conflict on ${f.formLine} ${f.label}: picked ${formatCurrency(chosen.value)} (${chosen.label})${previousValue !== chosen.value ? ` over ${formatCurrency(previousValue)}` : ''}`,
            fieldId
          ),
          propagation:
            changes.length > 0
              ? {
                  causeFieldId: fieldId,
                  causeLabel: `${f.formLine} · ${f.label}`,
                  changes,
                }
              : undefined,
        }
      }),

    confirmFlagged: (returnId, fieldId) =>
      withReturn(returnId, (state) => {
        const f = state.fields[fieldId]
        if (!f) return {}
        const updated: Field = {
          ...f,
          status: 'verified',
          verifiedBy: { name: CURRENT_USER, at: nowIso() },
        }
        return {
          fields: { ...state.fields, [fieldId]: updated },
          events: appendEvent(
            state,
            'verified',
            `Confirmed ${f.formLine} ${f.label} ${formatCurrency(f.value)} against the original document`,
            fieldId
          ),
        }
      }),

    logEvent: (returnId, event) =>
      withReturn(returnId, (state) => ({
        events: [
          ...state.events,
          { at: nowIso(), actor: event.actor ?? CURRENT_USER, kind: event.kind, detail: event.detail, fieldId: event.fieldId },
        ],
      })),

    clearPropagation: () => set({ lastPropagation: null }),
  }
})

/** True when a calculated field has a needs_approval operand anywhere below it. */
export function findApprovalBlocker(
  field: Field,
  fields: Record<string, Field>
): Field | null {
  for (const id of field.derivedFrom) {
    const dep = fields[id]
    if (!dep) continue
    if (dep.status === 'needs_approval') return dep
    const nested = findApprovalBlocker(dep, fields)
    if (nested) return nested
  }
  return null
}
