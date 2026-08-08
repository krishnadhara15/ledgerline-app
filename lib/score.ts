import type { TaxReturn } from './types'
import { daysUntil } from './format'

export type ScoreResult = {
  score: number
  reasons: string[]
}

/**
 * Ranks a return for the "Today" queue. Higher = more urgent.
 *
 *   score =
 *     deadlineProximity * 3.0 +   // days-to-deadline, inverted and clamped
 *     daysBlocked      * 1.5 +
 *     (clientJustReplied ? 2.0 : 0) +  // strike while they're responsive
 *     reviewerIdleDays * 1.2 +
 *     complexity       * 0.5
 *
 * Returns the reasons in plain words so the ranking is inspectable in the UI
 * ("Why is this first?").
 */
export function scoreReturn(r: TaxReturn): ScoreResult {
  const reasons: string[] = []

  // Deadline proximity: 14+ days out contributes 0; due today contributes 14.
  const days = daysUntil(r.deadline)
  const deadlineProximity = Math.max(0, 14 - Math.max(0, days))
  if (days < 0) reasons.push(`Deadline passed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`)
  else if (days === 0) reasons.push('Deadline is today')
  else if (days <= 7) reasons.push(`Deadline in ${days} day${days === 1 ? '' : 's'}`)

  if (r.daysBlocked > 0)
    reasons.push(`Blocked ${r.daysBlocked} day${r.daysBlocked === 1 ? '' : 's'}`)

  if (r.clientJustReplied) reasons.push('Client replied this morning')

  if (r.reviewerIdleDays > 0)
    reasons.push(
      `Untouched by reviewer for ${r.reviewerIdleDays} day${r.reviewerIdleDays === 1 ? '' : 's'}`
    )

  if (r.complexity === 3) reasons.push('High-complexity return')

  if (r.openFlags > 0)
    reasons.push(`${r.openFlags} open flag${r.openFlags === 1 ? '' : 's'} need answers`)

  const score =
    deadlineProximity * 3.0 +
    r.daysBlocked * 1.5 +
    (r.clientJustReplied ? 2.0 : 0) +
    r.reviewerIdleDays * 1.2 +
    r.complexity * 0.5

  return { score: Math.round(score * 10) / 10, reasons }
}
