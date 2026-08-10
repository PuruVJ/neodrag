// The new neodrag v3 public surface — class-based, options-only, capability-composed.
export { Interactions } from './engine.ts';
export type {
	Capability,
	InteractionsOptions,
	DndNode,
	InteractionSession,
	ResolvedTarget,
} from './types.ts';
export { applyTranslate, clearTranslate } from './transform.ts';
export { sharedCapability, sharedEngine } from './shared.ts';
export {
	parseLength,
	formatLength,
	pxToUnit,
	pxToAuthored,
	readAuthoredAxis,
	CSS_LENGTH_PATTERN,
	type CssLengthUnit,
	type LengthAxis,
	type ParsedLength,
} from './units.ts';

export * from './drag/index.ts';
export * from './drop/index.ts';
export * from './resize/index.ts';
export * from './sortable/index.ts';

// Tier-2 `use: []` extensions (magnetic, scrollLock, touchAction, controls, …). Tree-shaken away
// unless imported. The opt-in collaborative layer (`Room`, …) is NOT re-exported here — it ships
// only under the `@neodrag/core/collab` subpath, so a non-collab app never pulls the CRDT plumbing.
export * from './extend/index.ts';
