import type { Rng } from './rng.ts';
import { createRng, randomSeed } from './rng.ts';
import type { ElementLike } from './targets.ts';
import { keysFromList, resolveElement } from './targets.ts';

export type InvariantPack = 'drag' | 'drop' | 'sortable' | 'resize' | 'all';

export type FuzzContext = {
	seed: number;
	rng: Rng;
	runIndex: number;
};

export type FuzzGestureFn = (ctx: FuzzContext) => Promise<void>;

export type FuzzOptions = {
	seeds?: number[];
	count?: number;
	gesture: FuzzGestureFn;
	invariants?: InvariantPack | InvariantPack[];
	onBefore?: () => void | Promise<void>;
	onAfter?: () => void | Promise<void>;
};

export type FuzzFailure = {
	seed: number;
	runIndex: number;
	message: string;
};

export type FuzzResult = {
	runs: number;
	failures: FuzzFailure[];
};

export type DragInvariantContext = {
	element: Element;
};

export type SortableInvariantContext = {
	list: Element;
	keysBefore: string[];
};

function parseTranslatePx(tr: string): { x: number; y: number } | null {
	const m1 = tr.match(/translate\(\s*([-\d.]+)px\s*,\s*([-\d.]+)px\s*\)/);
	if (m1) return { x: parseFloat(m1[1]!), y: parseFloat(m1[2]!) };
	const m2 = tr.match(/translate:\s*([-\d.]+)px\s+([-\d.]+)px/);
	if (m2) return { x: parseFloat(m2[1]!), y: parseFloat(m2[2]!) };
	return null;
}

export async function assertDragInvariants(ctx: DragInvariantContext): Promise<void> {
	const style = getComputedStyle(ctx.element);
	const tr = style.translate || style.transform || 'none';
	if (tr.includes('NaN') || tr.includes('Infinity')) {
		throw new Error(`Invalid transform: ${tr}`);
	}
	const parsed = parseTranslatePx(tr);
	if (parsed && (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.y))) {
		throw new Error(`Non-finite translate: ${parsed.x}, ${parsed.y}`);
	}
}

export async function assertSortableInvariants(ctx: SortableInvariantContext): Promise<void> {
	const keysAfter = [...ctx.list.querySelectorAll('[data-sortable-key]')].map((n) =>
		n.getAttribute('data-sortable-key'),
	);
	if (keysAfter.length !== ctx.keysBefore.length) {
		throw new Error(
			`Sortable length changed: ${ctx.keysBefore.length} -> ${keysAfter.length}`,
		);
	}
	const before = [...ctx.keysBefore].sort().join(',');
	const after = [...(keysAfter.filter(Boolean) as string[])].sort().join(',');
	if (before !== after) {
		throw new Error(`Sortable keys not a permutation: before=[${before}] after=[${after}]`);
	}
}

export async function assertResizeInvariants(el: Element): Promise<void> {
	const w = parseFloat(getComputedStyle(el).width);
	const h = parseFloat(getComputedStyle(el).height);
	if (!Number.isFinite(w) || !Number.isFinite(h) || w < 0 || h < 0) {
		throw new Error(`Invalid resize dimensions: ${w}x${h}`);
	}
}

function resolveSeeds(opts: FuzzOptions): number[] {
	if (opts.seeds?.length) return opts.seeds;
	const count = opts.count ?? 10;
	const base = randomSeed();
	const out: number[] = [];
	const rng = createRng(base);
	for (let i = 0; i < count; i++) {
		out.push(rng.int(0xffffffff));
	}
	return out;
}

export async function fuzz(opts: FuzzOptions): Promise<FuzzResult> {
	const seeds = resolveSeeds(opts);
	const failures: FuzzFailure[] = [];

	for (let runIndex = 0; runIndex < seeds.length; runIndex++) {
		const seed = seeds[runIndex]!;
		const rng = createRng(seed);
		try {
			await opts.onBefore?.();
			await opts.gesture({ seed, rng, runIndex });
			await opts.onAfter?.();
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			failures.push({ seed, runIndex, message });
			console.error(`[neodrag/fuzz] FAILED seed=${seed} run=${runIndex}: ${message}`);
			console.error(`[neodrag/fuzz] Replay with: seed ${seed}`);
		}
	}

	return { runs: seeds.length, failures };
}

export function createSortableFuzzGesture(
	item: ElementLike,
	list: ElementLike,
	gesture: (item: Element, list: Element, ctx: FuzzContext) => Promise<void>,
): FuzzGestureFn {
	return async (ctx) => {
		const listEl = await resolveElement(list);
		const itemEl = await resolveElement(item);
		const keysBefore = await keysFromList(list);
		await gesture(itemEl, listEl, ctx);
		await assertSortableInvariants({ list: listEl, keysBefore });
	};
}

export function createDragFuzzGesture(
	item: ElementLike,
	gesture: (item: Element, ctx: FuzzContext) => Promise<void>,
): FuzzGestureFn {
	return async (ctx) => {
		const itemEl = await resolveElement(item);
		await gesture(itemEl, ctx);
		await assertDragInvariants({ element: itemEl });
	};
}
