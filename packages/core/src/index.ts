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

// Tier-2 `use: []` extensions (magnetic, scrollLock, touchAction, controls, …) and
// the opt-in collaborative / CRDT layer. Tree-shaken away unless actually imported.
export * from './extend/index.ts';
export * from './collab/index.ts';
