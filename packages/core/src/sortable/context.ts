import type { MeasuredRect } from './strategy/types.ts';
import type { SortableLayoutEntry } from './visual.ts';
import type { SortableMidEntry } from './mids.ts';
import type { SortableOptions, SortablePreset, SortableStrategy } from './types.ts';

export type SortableIntentPluginState = {
	preLayout: SortableLayoutEntry[];
	currentLayout: SortableLayoutEntry[];
	measuredRects: MeasuredRect[];
	displacedKeys: string[];
};

export type SortableCommit<T> = {
	next: T[];
	from: number;
	insertAt: number;
	item: T;
};

export type IntentSessionInit<T> = {
	snapshot: T[];
	dragFrom: number;
	previewTo: number;
	mids: SortableMidEntry[] | null;
	dragAxis: { start: number; end: number } | null;
	dragBand: number;
	targetIndex: number;
	edgeThresholdPx: number;
	slotBoundaries: number[] | null;
	sessionStrategy: SortableStrategy | null;
	sessionPreset: SortablePreset | null;
	layoutStrategy: SortableStrategy | null;
	containerRect: DOMRectReadOnly | null;
	foreignInsertSize?: number;
};

export class IntentSession<T> {
	snapshot: T[];
	dragFrom: number;
	previewTo: number;
	mids: SortableMidEntry[] | null;
	dragAxis: { start: number; end: number } | null;
	dragBand: number;
	targetIndex: number;
	edgeThresholdPx: number;
	slotBoundaries: number[] | null;
	sessionStrategy: SortableStrategy | null;
	sessionPreset: SortablePreset | null;
	layoutStrategy: SortableStrategy | null;
	containerRect: DOMRectReadOnly | null;
	foreignInsertSize?: number;

	constructor(init: IntentSessionInit<T>) {
		this.snapshot = init.snapshot;
		this.dragFrom = init.dragFrom;
		this.previewTo = init.previewTo;
		this.mids = init.mids;
		this.dragAxis = init.dragAxis;
		this.dragBand = init.dragBand;
		this.targetIndex = init.targetIndex;
		this.edgeThresholdPx = init.edgeThresholdPx;
		this.slotBoundaries = init.slotBoundaries;
		this.sessionStrategy = init.sessionStrategy;
		this.sessionPreset = init.sessionPreset;
		this.layoutStrategy = init.layoutStrategy;
		this.containerRect = init.containerRect;
		this.foreignInsertSize = init.foreignInsertSize;
	}
}

export class SortableContext<T> {
	readonly id = Symbol('neodrag.sortable');
	readonly opts: SortableOptions<T>;
	readonly nodesByKey = new Map<string, HTMLElement | SVGElement>();
	containerNode: HTMLElement | SVGElement | null = null;
	intent: IntentSession<T> | null = null;
	intentVisual: SortableIntentPluginState | null = null;
	intentVisualKey: string | null = null;
	foreignIntentVisual: SortableIntentPluginState | null = null;
	lastIntentX = NaN;
	lastIntentY = NaN;
	midsCache: {
		mids: SortableMidEntry[];
		itemsLen: number;
		orderKey: string;
	} | null = null;

	constructor(opts: SortableOptions<T>) {
		this.opts = opts;
	}

	clearIntent(): void {
		this.intent = null;
		this.foreignIntentVisual = null;
		this.lastIntentX = NaN;
		this.lastIntentY = NaN;
	}
}

export class SortableRegistry {
	readonly #byId = new Map<symbol, SortableContext<unknown>>();
	readonly #groups = new Map<string, Set<symbol>>();

	register<T>(ctx: SortableContext<T>): void {
		this.#byId.set(ctx.id, ctx as SortableContext<unknown>);
		const group = ctx.opts.group;
		if (!group) return;
		let set = this.#groups.get(group);
		if (!set) {
			set = new Set();
			this.#groups.set(group, set);
		}
		set.add(ctx.id);
	}

	unregister<T>(ctx: SortableContext<T>): void {
		this.#byId.delete(ctx.id);
		const group = ctx.opts.group;
		if (!group) return;
		this.#groups.get(group)?.delete(ctx.id);
	}

	get<T>(id: symbol): SortableContext<T> | undefined {
		return this.#byId.get(id) as SortableContext<T> | undefined;
	}

	hasForeignGroupMember(group: string, sortableId: symbol): boolean {
		return this.#groups.get(group)?.has(sortableId) ?? false;
	}

	findContextForNode(node: HTMLElement | SVGElement): SortableContext<unknown> | undefined {
		for (const ctx of this.#byId.values()) {
			for (const el of ctx.nodesByKey.values()) {
				if (el === node) return ctx;
			}
		}
		return undefined;
	}

	values(): IterableIterator<SortableContext<unknown>> {
		return this.#byId.values();
	}
}

export const sortableRegistry = new SortableRegistry();

export function registerSortable<T>(ctx: SortableContext<T>): void {
	sortableRegistry.register(ctx);
}

export function unregisterSortable<T>(ctx: SortableContext<T>): void {
	sortableRegistry.unregister(ctx);
}

export function createSortableContext<T>(opts: SortableOptions<T>): SortableContext<T> {
	return new SortableContext(opts);
}

export function clearIntentSession<T>(ctx: SortableContext<T>): void {
	ctx.clearIntent();
}
