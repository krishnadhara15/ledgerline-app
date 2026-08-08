# Ledgerline

Live: [url] · Video: [url]

A return-review platform for a CPA firm where AI does the tedious reading and humans keep
judgment — and every number on a return is one click away from the exact spot on the paper
it came from.

## Challenges covered

01 Source Document Traceability · 07 Actionable Dashboard · 08 Clickable vs. Editable · 10 Trustworthy AI
(Deep linking from 04 and status chips from 06 appear incidentally; not claimed as full coverage.)

## Real vs. simulated

**Genuinely wired up:** traceability graph incl. recursive tracing (Line 11 → Line 9 → Line 1a → W-2)
· real scoring function with reasons exposed in the UI ("Why is this first?") · correction flow with
downstream propagation diff through `derivedFrom` · six-state grammar across four screens
(return lines, document annotations, dashboard, `/legend`) · cold-load deep links for the selected
field, the active tab, and every dashboard filter

**Simulated:** no OCR or parsing — documents are rendered components with hardcoded coordinates ·
no model — confidence and reasoning are hand-authored fixtures · no auth or persistence — refresh resets

## Running locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build — must pass with zero errors
```

Mock data is generated with a fixed faker seed (`GENERATED_SEED` in `lib/mock-data.ts`),
so every load shows identical data.

### Where to look first

- `/dashboard` — ranked "Today" band; row 1 deep-links straight into the dividend conflict
- `/returns/ret-chen-1040?field=line-3b` — the hero return, cold-loaded mid-conflict
- `/returns/ret-okafor-1040` — the designed empty state
- `/legend` — the interaction grammar, with live examples

## Decisions

1. **Documents are React components, not PDFs.** Region coordinates live in one shared file (`lib/doc-regions.ts`) used by both the fake form and every field's source refs, so highlights can't drift. Tradeoff: this is a demo contract for OCR — a real pipeline would emit the same `{docId, page, region, value}` shape.
2. **Correction is a normal edit, not a special "override AI" flow.** Enter commits, status becomes manual, downstream calculated fields recompute, and the original AI read stays in the trail. Framing the human as the authority keeps trust intact when the model is wrong.
3. **Ranking exposes its reasons.** The dashboard score is a small weighted function (`lib/score.ts`) that returns plain-language reasons for the UI. Partners can argue about weights, not a black box.

## Not built / what I'd do next

- Persist state and add real auth so corrections survive refresh and map to a preparer identity
- Swap the fake document renderer for real scanned pages once OCR emits the same region contract
