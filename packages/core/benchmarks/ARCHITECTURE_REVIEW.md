# Neodrag core — potato-mode architecture review (2026-05-26)

Scope: `@neodrag/core` engine, plugins, sensors, bindings; framework wrappers (Svelte/React/Vue/Solid/Vanilla).

Benchmarks: Chromium suite (`pnpm bench`) vs `benchmarks/reports/baseline.json`.

## Executive summary

| Area | Verdict |
|------|---------|
| Plugin system | Powerful but heavy; threshold gating now engine-internal (good) |
| `engine.ts` (~1.5k lines) | Triplicated drag/drop/resize paths — largest consolidation opportunity |
| `DragCtx` | Was double-getter indirection; **flattened to `live` view objects** (benchmarked) |
| Pending interaction | Was syncing drop host every sub-threshold move; **deferred sync** (benchmarked) |
| Framework wrappers | Svelte thin; React carries state-sync plugin + hook complexity |
| Sensors | Class + `registerSensor` is appropriate weight |

## Benchmarked changes (this pass)

### 1. Defer session sync until threshold passes

**Before:** Every pending `pointermove` called `syncDragSessionPointer` (active session + drop host + `lastInput`).

**After:** Pending moves only set `inst.lastInput`; full sync runs when threshold passes or when already dragging.

| Benchmark | Baseline mean | After mean | Δ |
|-----------|---------------|------------|---|
| pending · sub-threshold × 20 | 0.1285 ms | ~0.10–0.14 ms | median flat (noise at mean) |
| steady-state · default drag | 0.0937 ms | ~0.099 ms | no regression vs baseline |
| sortable over · 40 items | 0.2965 ms | ~0.32 ms | no regression vs baseline |

### 2. Flat `DragCtx` live views (no nested getters)

**Before:** `ctx.delta.x` → ctx getter → `#liveDelta` → per-axis getter → scalar.

**After:** Mutable `inst.live.delta` synced at hot-path boundaries; `dragCtx.delta` is a direct reference.

| Benchmark | Baseline mean | After mean | Δ |
|-----------|---------------|------------|---|
| steady-state · default drag | 0.0937 ms | 0.0937 ms | flat (within noise) |
| empty plugin list drag | 0.1010 ms | 0.1010 ms | flat |

No regressions on idle pointermove or sortable benches.

## Heavy abstractions (do not remove without dedicated benches)

### A. Triplicated plugin host lifecycle (~400 LOC)

`#install*`, `#diff*`, `#init*`, `#destroy*` duplicated for drag, drop, resize in `engine.ts`.

**Proposal:** Generic `PluginHost<P>` used by `DragInstance`, `DropInstance`, `ResizeInstance`.

**Risk:** High — touches all binding update paths. **Bench:** reactive suite + plugin diff tests.

### B. `EffectScheduler` + `ctx.effect()`

Plugins schedule DOM writes via rAF batching. Engine transform sync is already direct (`#syncDragTransform`).

**Proposal:** Keep for plugin compatibility; do not route engine transform through effects.

### C. React `createSyncPlugin` + `useDraggableBinding`

Injects a post-phase plugin and re-merges plugin list each render.

**Proposal:** Optional `useDraggableState` using engine callbacks instead of plugin slot (framework-only change).

**Bench:** `reactive.perf.suite.test.ts`.

### D. `disabled` / `controls` still use `start` as gate

Now run once on commit (after threshold). Further win: `shouldStart` hook + small gate chain.

**Bench:** human-expectations controls tests.

### E. `keyboardDrag` plugin + `KeyboardMoveSensor` + WeakMap registry

Config in plugin, input in sensor — coupling smell.

**Proposal:** Keyboard options on `Draggable({ keyboardDrag })` like threshold.

### F. Session state machine vs `isDragging`

`session.state` can desync during edge cases; prefer `isDragging` for behavior.

**Proposal:** Simplify machine or drive UI from `isDragging` only.

## Wrapper weight comparison

| Package | Lines (main entry) | Notes |
|---------|-------------------|--------|
| Svelte | ~43 | `Attachment` + `$effect` flush — minimal |
| React | ~341 | Sync plugin, refs, layout effects |
| Vue/Solid/Vanilla | Similar patterns | Re-export core + thin hooks |

**Recommendation:** Document “core `Draggable` first”; hooks are optional sugar.

## What is intentionally lean

- **Sensors:** `SensorBase` + engine `registerSensor` — no per-node listeners
- **Threshold:** Engine-internal, per-binding option (no plugin slot)
- **Pointer capture / delegation:** Single engine delegate
- **Drop tracker:** RAF coalescing, reused `#nextOverSet`

## Follow-up PRs (benchmark required each)

1. Unify plugin host install/diff (drag/drop/resize)
2. `shouldStart` gate hook; void-only `start`
3. Resize `live` views (mirror drag)
4. Keyboard options on `Draggable` (drop registry)
5. React state without sync plugin
