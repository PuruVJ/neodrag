# Human behavior — CPU profile analysis

**Primary automated breakdown:** `pnpm bench:cost` → [`HUMAN_COST.md`](./HUMAN_COST.md) and `benchmarks/reports/human-cost.json` (engine instrumentation, per-span ms/%).

CDP sampling (`pnpm bench:profile`) → `benchmarks/reports/human-profile.json` (coarse for sub-ms gestures).

## How to run

```bash
cd packages/core
pnpm bench:cost      # recommended
pnpm bench:profile   # optional CDP stacks
```

Uses Vitest Browser `cdp()` → `Profiler.start/stop` (Playwright Chromium only). Each scenario is repeated inside one profile window so stacks accumulate.

## Important limitation

Neodrag pointer gestures are **sub-millisecond per event** in the bench environment. CDP’s sampler often reports **~94–97% `(idle)`** because the CPU finishes between samples. That does **not** mean the library is idle during drag — it means sampling is too coarse for this workload.

For deep inspection:

1. **Hot-path profiles** in the suite (`hot · …`) loop many drags inside one profile window.
2. Open `benchmarks/reports/human-profile.json` and filter `topTotal` (inclusive time) for `src/engine.ts`, `src/plugins.ts`.
3. Record a **Chrome Performance** trace manually while dragging in the playground (best stack detail).

## Per human behavior (what actually runs)

### Drag

| Test | Dominant work (code path) | Profile signal |
|------|---------------------------|----------------|
| **move by delta** | `pointer` → sensor `pointerdown/move/up` → `#onInteractionMove` → threshold → `#runStart` once → `#runDrag` × steps → `syncLiveViews` → `#syncDragTransform` → default plugins (`stateMarker`, `applyUserSelectHack`, `touchAction`) | `#runDrag`, `#applyDragDelta`, `DragInstance` ctor on cold runs |
| **disabled** | `disabled` `start` returns false on commit → no transform | Mostly `getBoundingClientRect`, test harness |
| **axis x** | `axis` `drag` zeroes `proposed.y` | Plugin init on first bind (`#initOneDragPlugin`) |
| **bounds parent** | `bounds` `drag` clamps `proposed` using parent rect; extra layout reads | `recomputeBounds`, `#runDrag` |

### Drop

| Test | Dominant work | Profile signal |
|------|---------------|----------------|
| **onDrop once** | Drag + `DropTargetTracker` RAF → `elementFromPoint` / hit-test → `accepts` → `onDrop` on release | `droppable`, `DropInstance`, `#installDropPlugins`, sensor `disarm` |
| **highlight over** | `over` hooks + classList on zone during drag | `setProperty`, `#runDropHook`, DOM style |

### Sortable

| Test | Dominant work | Profile signal |
|------|---------------|----------------|
| **reorder** | Sortable plugins + drop tracker + 3 draggables; index recompute on move | `#destroyDrag`, `DropTargetTracker.flush`, `getBoundingClientRect` |
| **tiny nudge** | Threshold + no index change | Same as drag, less drop churn |

### Engine sharing

| Test | Dominant work | Profile signal |
|------|---------------|----------------|
| **two draggables** | Two `DragInstance`s, shared engine plugins; two full gesture pipelines | `#destroyDrag` when tearing down repeated runs |

## Where time goes (when not idle)

Across hot/full profiles, non-idle self time clusters in:

1. **Test harness** — `pointer`, `dragSteps`, `dispatchEvent`, `getBoundingClientRect` (~20–30% in hot drag).
2. **Engine interaction pipeline** — `#onInteractionMove`, `#runDrag`, `#runStart`, `#beginSession`, `syncLiveViews`, `#syncDragTransform`.
3. **Sensors** — `PointerSensor` listen/disarm, `pointerToInput`.
4. **Plugins (default stack)** — `init`/`start`/`drag`/`end` on first bind; per-move `bounds`/`axis` math is cheap vs DOM.
5. **Drop** — `elementFromPoint`, `composedPath`, hit expansion, `effects.flush` in drop plugins.
6. **Lifecycle** — `DragInstance` / `DropInstance` construction, `#install*Plugins`, `#destroyDrag` dominate **full** scenario repeats, not steady drag.

## Wrappers

Framework packages are **not** on the hot path during bench gestures (core `Neodrag` + `engine.draggable` directly). React’s `createSyncPlugin` only runs when using `useDraggable` state sync — not measured here.

## Next steps for finer data

- Engine **User Timing** marks around `#onInteractionMove` / `#runDrag` / drop tracker (export via `performance.getEntriesByType('measure')`).
- Lower-level: `--js-flags=--prof` on Chromium launching Vitest (whole-process V8 profile).
