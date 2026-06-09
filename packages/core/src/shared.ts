import { Interactions } from './engine.ts';
import type { Capability } from './types.ts';

/**
 * Process-wide shared engine for the ergonomic single-element classes (`Draggable`,
 * `Droppable`, …). All of them register into ONE `Interactions` so capabilities can observe each
 * other (drop watches drag). Keyed by capability class, so importing only `Draggable`
 * references only `Drag` — `Drop`/`Resize` stay out of the bundle (tree-shaking).
 */
let engine: Interactions | null = null;
const capabilities = new Map<unknown, Capability>();

export function sharedEngine(): Interactions {
	return (engine ??= new Interactions());
}

export function sharedCapability<T extends Capability>(token: unknown, make: () => T): T {
	let cap = capabilities.get(token) as T | undefined;
	if (!cap) {
		cap = make();
		capabilities.set(token, cap);
		sharedEngine().use(cap);
	}
	return cap;
}
