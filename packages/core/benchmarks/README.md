# Core benchmarks

Chromium-only (Vitest browser). Measures real `performance.now()` in a layout + compositor + pointer pipeline.

## Commands (`packages/core`)

| Script | What it runs | Baseline file |
|--------|----------------|---------------|
| `pnpm bench` | Drag hot path (12-step drag, idle, sortable index/over) | `reports/baseline.json` |
| `pnpm bench:baseline` | Promote `latest.json` → `baseline.json` | — |
| `pnpm bench:lifecycle` | **Init vs update** matrix (construct, install, attach, reconcile, remount) | `reports/lifecycle-baseline.json` |
| `pnpm bench:lifecycle:baseline` | Promote lifecycle latest → baseline | — |
| `pnpm bench:init-cost` | Engine spans: `bind.install` vs `bind.diff` vs drag (`profile: true`) | — |
| `pnpm bench:cost` | Human scenarios + wall time + span breakdown | `reports/human-cost-baseline.json` |
| `pnpm bench:profile` | CDP CPU profiles (manual review) | `reports/human-profile.json` |
| `pnpm test:bench:guard` | All `benchmarks/browser/**/*.test.ts` (budgets + baselines where configured) | — |

Compile first: `pnpm compile` from `packages/core`.

## Suites

### `perf.suite.test.ts` (CI via `pnpm bench`)

- Steady-state drag (default vs minimal plugins)
- Sub-threshold pending moves
- Idle pointermove (node vs delegate)
- Sortable index (querySelector vs Map)
- Sortable over while dragging

Fails if median regresses **>15%** vs `baseline.json`.

### `lifecycle.perf.suite.test.ts`

Focused on **install vs update**:

- `Neodrag` / `DragNeodrag` construct
- `engine.draggable` (minimal + default), batch 32 installs
- `Draggable.attach` / `Draggable.update`
- `handle.update` stable (no-op) vs position ref churn
- Reconcile in-place vs destroy+remount
- Update during active drag
- `engine.droppable`

Fails if median regresses **>12%** vs `lifecycle-baseline.json`.

### Guard-only (no baseline update)

- `reactive.perf.suite.test.ts`, `mount-vs-reconcile.perf.test.ts`, `reactive-update-churn.perf.test.ts`
- `two-way-binding.perf.test.ts`, `scale.perf.test.ts`, `sortable-drag.perf.test.ts`, `drop-target.perf.test.ts`
- Behavioral guards (`behavioral.guard`, `drop-behavior.guard`, `human-expectations`)

## Interpreting results

- Sub-millisecond medians are common; prefer **mean** and **p99** for init/update suites.
- Use `pnpm bench:init-cost` to see whether time is in `bind.install` (cold attach) or `bind.diff` (reactive churn).
- Enable `profile: true` on `Neodrag` for custom span capture (`takeCostProfile()`).

## Recent engine optimizations (init/update)

- `diffPluginFlat`: reuse `host.byKey` + `Set` (no per-diff `Map` clone)
- `mergePluginsByKey`: return defaults array when `user.length === 0`
- `PluginListResolver`: cache static `resolveFull` / `resolveAttach` arrays
- `bind.diff` cost span on drag reconcile
