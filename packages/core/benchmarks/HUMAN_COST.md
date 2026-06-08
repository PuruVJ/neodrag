# Human behavior — automated engine cost

## Run

```bash
cd packages/core
pnpm bench:cost
```

Writes `benchmarks/reports/human-cost.json` with per-scenario:

- **Wall time** — median/mean/p99 from `performance.now()` around the full gesture (includes test harness + DOM).
- **Engine spans** — inclusive timings from `Neodrag({ profile: true })` instrumentation in `src/engine.ts`.

## Reading the report

| Field            | Meaning                                             |
| ---------------- | --------------------------------------------------- |
| `wall`           | End-to-end scenario duration                        |
| `topSpans`       | Largest engine spans by total ms (nested/inclusive) |
| `attributedMs`   | Sum of span totals (often > wall when spans nest)   |
| `unattributedMs` | `wall − attributed` (harness, layout, gaps)         |

Typical drag steady-state hotspots (see `hot/steady-drag-loop`):

- `interaction.move` — full pointermove pipeline
- `runDrag` — plugin drag chain
- `syncTransform` — apply transform to DOM
- `applyDragDelta` — delta math
- `session.syncPointer` — session pointer sync

Drop/sortable scenarios add `drop.update`, `drop.hook`, `drop.flush`.

## Baseline

After reviewing output:

```bash
cp benchmarks/reports/human-cost.json benchmarks/reports/human-cost-baseline.json
```

`bench:cost` fails if median wall regresses >20% vs baseline.

## vs CDP profiling

`pnpm bench:profile` uses Chromium CDP sampling (coarse for sub-ms gestures). **`bench:cost` is the primary automated breakdown** for human scenarios.
