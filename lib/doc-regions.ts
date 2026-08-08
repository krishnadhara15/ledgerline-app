/**
 * Region coordinates (percentages of an 8.5x11 page) shared between the
 * FakeDocument renderer and the SourceRefs in mock data. Because both sides
 * read the same constants, highlight overlays always land exactly on the
 * rendered number.
 */
export type Region = { x: number; y: number; w: number; h: number }

export const W2_REGIONS = {
  ein: { x: 5, y: 15, w: 26, h: 4 },
  employer: { x: 5, y: 21.5, w: 40, h: 4 },
  employee: { x: 5, y: 34.5, w: 40, h: 4 },
  wagesBox1: { x: 51, y: 15, w: 21, h: 4 },
  fedTaxBox2: { x: 74.5, y: 15, w: 20, h: 4 },
  ssWagesBox3: { x: 51, y: 23, w: 21, h: 4 },
  ssTaxBox4: { x: 74.5, y: 23, w: 20, h: 4 },
  medicareWagesBox5: { x: 51, y: 31, w: 21, h: 4 },
  medicareTaxBox6: { x: 74.5, y: 31, w: 20, h: 4 },
} as const satisfies Record<string, Region>

export const INT_REGIONS = {
  payer: { x: 5, y: 15, w: 42, h: 5 },
  recipient: { x: 5, y: 30, w: 42, h: 4 },
  interestBox1: { x: 70, y: 24, w: 24, h: 4.5 },
  taxExemptBox8: { x: 70, y: 33, w: 24, h: 4.5 },
} as const satisfies Record<string, Region>

export const DIV_REGIONS = {
  payer: { x: 5, y: 15, w: 42, h: 5 },
  payerTin: { x: 5, y: 27, w: 24, h: 4 },
  ordinaryBox1a: { x: 70, y: 22, w: 24, h: 4.5 },
  qualifiedBox1b: { x: 70, y: 31, w: 24, h: 4.5 },
} as const satisfies Record<string, Region>

export const FOREIGN_REGIONS = {
  holder: { x: 8, y: 24, w: 50, h: 4 },
  interestLine: { x: 62, y: 44, w: 30, h: 4.5 },
  fxNote: { x: 8, y: 56, w: 60, h: 4 },
} as const satisfies Record<string, Region>

export const RECEIPT_REGIONS = {
  org: { x: 10, y: 12, w: 60, h: 5 },
  date: { x: 10, y: 34, w: 34, h: 5 },
  amount: { x: 56, y: 46, w: 34, h: 7 },
  signature: { x: 52, y: 74, w: 38, h: 6 },
} as const satisfies Record<string, Region>
