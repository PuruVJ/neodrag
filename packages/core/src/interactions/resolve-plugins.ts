import type { DragPlugin, DragPluginList, DropPlugin, DropPluginList, PluginSlot } from './types.ts';

export function isReactiveSlot<T>(slot: PluginSlot<T>): slot is () => T | T[] {
	return typeof slot === 'function';
}

export function hasReactiveSlots<T>(slots: readonly PluginSlot<T>[]): boolean {
	return slots.some(isReactiveSlot);
}

function flattenSlotValue<T>(value: T | T[]): T[] {
	return Array.isArray(value) ? value : [value];
}

export function resolvePluginList<T extends { key: symbol }>(
	slots: readonly PluginSlot<T>[],
	staticCache?: (T | undefined)[],
	reactiveOnly = false,
	invokeReactiveSlots = true,
): T[] {
	const out: T[] = [];

	for (let i = 0; i < slots.length; i++) {
		const slot = slots[i]!;
		if (isReactiveSlot(slot)) {
			if (!invokeReactiveSlots) continue;
			out.push(...flattenSlotValue(slot()));
		} else if (!reactiveOnly) {
			if (staticCache) staticCache[i] = slot;
			out.push(slot);
		} else {
			out.push(staticCache?.[i] ?? slot);
		}
	}

	return out;
}

export function resolveDragPluginList(slots: DragPluginList, reactiveOnly = false): DragPlugin[] {
	return resolvePluginList(slots, undefined, reactiveOnly);
}

export function resolveDropPluginList(slots: DropPluginList, reactiveOnly = false): DropPlugin[] {
	return resolvePluginList(slots, undefined, reactiveOnly);
}

export class PluginListResolver<T extends { key: symbol }> {
	#slots: PluginSlot<T>[];
	#staticCache: (T | undefined)[] = [];

	constructor(slots: PluginSlot<T>[]) {
		this.#slots = slots;
	}

	get slots() {
		return this.#slots;
	}

	hasReactive() {
		return hasReactiveSlots(this.#slots);
	}

	setSlots(slots: PluginSlot<T>[]) {
		this.#slots = slots;
		this.#staticCache = [];
	}

	resolveFull(): T[] {
		this.#staticCache = [];
		return resolvePluginList(this.#slots, this.#staticCache, false);
	}

	resolveAttach(): T[] {
		this.#staticCache = [];
		return resolvePluginList(this.#slots, this.#staticCache, false, false);
	}

	resolveReactive(): T[] {
		if (!this.hasReactive()) return this.resolveFull();
		return resolvePluginList(this.#slots, this.#staticCache, true);
	}
}

export function resolvedPluginsUnchanged<T>(prev: readonly T[], next: readonly T[]): boolean {
	if (prev.length !== next.length) return false;
	for (let i = 0; i < next.length; i++) {
		if (prev[i] !== next[i]) return false;
	}
	return true;
}

