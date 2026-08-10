/**
 * Real-browser sortable interaction parity for the Vue wrapper — the Vue port of
 * `packages/svelte/tests/sortable.test.svelte.ts` + `transfer-source-removal.test.svelte.ts`.
 * Drives real pointer gestures through useSortable → engine → Vue re-render, exercising the
 * `row(item.id)` spread into `h('li', …)`. Geometry matches the Svelte harnesses byte-for-byte.
 */
import { createApp, h, ref, type Ref } from 'vue';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { getElementCoords, pointerDrag, pointerRelease, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import { useSortable, type TransferOp } from '../src/sortable.ts';

type Item = { id: string };

const ROW_STYLE = 'box-sizing: border-box; width: 120px; height: 40px; margin: 0; line-height: 40px; text-align: center; background: #ccd; border: 1px solid #557; touch-action: none; user-select: none;';
const LIST_STYLE = (left: number) => `position: absolute; top: 60px; left: ${left}px; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;`;

let host: HTMLDivElement;
let app: ReturnType<typeof createApp>;

async function mount(component: Parameters<typeof createApp>[0]) {
	host = document.createElement('div');
	document.body.appendChild(host);
	app = createApp(component);
	app.mount(host);
	await waitForEffects();
}

const order = (testid: string) => host.querySelector(`[data-testid="${testid}"]`)!.getAttribute('data-order');
const row = (id: string) => host.querySelector(`[data-testid="row-${id}"]`) as HTMLElement;

beforeEach(() => startCursorTracking());
afterEach(() => {
	stopCursorTracking();
	app.unmount();
	host.remove();
});

function listVNode(testid: string, items: Item[], bindRow: (k: string) => object, ref_: Ref<HTMLElement | null>, left: number) {
	return h(
		'ul',
		{ 'data-testid': testid, 'data-order': items.map((i) => i.id).join(','), ref: ref_, style: LIST_STYLE(left) },
		items.map((item) => h('li', { key: item.id, ...bindRow(item.id), 'data-testid': `row-${item.id}`, style: ROW_STYLE }, item.id)),
	);
}

describe('@neodrag/vue sortable — real-browser interactions', () => {
	test('reorder commits and leaves no stuck transforms (FLIP path)', async () => {
		const reorders = ref(0);
		const SortableHarness = {
			setup() {
				const items = ref<Item[]>([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
				const { ref: target, row: bindRow } = useSortable<Item>({
					get items() {
						return items.value;
					},
					axis: 'y',
					animation: 200,
					onReorder: (next) => {
						reorders.value += 1;
						items.value = next as Item[];
					},
				});
				return () => listVNode('list', items.value, bindRow, target, 60);
			},
		};
		await mount(SortableHarness);
		await pointerDrag(row('a'), { deltaX: 0, deltaY: 90 }, { steps: 8 });
		await waitForEffects();
		await waitForEffects();
		expect(order('list')).toBe('b,c,a');
		for (const id of ['a', 'b', 'c']) expect(row(id).style.translate).toBe('');
	});

	test('dropping in place fires no reorder', async () => {
		const reorders = ref(0);
		const SortableHarness = {
			setup() {
				const items = ref<Item[]>([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
				const { ref: target, row: bindRow } = useSortable<Item>({
					get items() {
						return items.value;
					},
					axis: 'y',
					animation: 200,
					onReorder: (next) => {
						reorders.value += 1;
						items.value = next as Item[];
					},
				});
				return () => listVNode('list', items.value, bindRow, target, 60);
			},
		};
		await mount(SortableHarness);
		await pointerDrag(row('a'), { deltaX: 0, deltaY: 8 }, { steps: 3 });
		await waitForEffects();
		expect(order('list')).toBe('a,b,c');
		expect(reorders.value).toBe(0);
	});
});

function boardComponent(addOnly: boolean) {
	return {
		setup() {
			const a = ref<Item[]>([{ id: 'a0' }, { id: 'a1' }]);
			const b = ref<Item[]>([{ id: 'b0' }, { id: 'b1' }]);
			const into = (which: 'a' | 'b', op: TransferOp<Item>) => {
				const item = op.item as Item;
				if (!addOnly) {
					a.value = a.value.filter((x) => x.id !== item.id);
					b.value = b.value.filter((x) => x.id !== item.id);
				}
				if (which === 'a') a.value = [...a.value.slice(0, op.to), item, ...a.value.slice(op.to)];
				else b.value = [...b.value.slice(0, op.to), item, ...b.value.slice(op.to)];
			};
			const listA = useSortable<Item>({
				get items() {
					return a.value;
				},
				id: 'a',
				group: 'k',
				axis: 'y',
				animation: 200,
				onReorder: (n) => (a.value = n as Item[]),
				onTransfer: (op) => into('a', op),
			});
			const listB = useSortable<Item>({
				get items() {
					return b.value;
				},
				id: 'b',
				group: 'k',
				axis: 'y',
				animation: 200,
				onReorder: (n) => (b.value = n as Item[]),
				onTransfer: (op) => into('b', op),
			});
			return () =>
				h('div', { style: 'position: relative; height: 320px;' }, [
					listVNode('listA', a.value, listA.row, listA.ref, 40),
					listVNode('listB', b.value, listB.row, listB.ref, 240),
				]);
		},
	};
}

describe('@neodrag/vue sortable — cross-list transfer', () => {
	test('cross-list transfer moves the item between lists (no duplicate)', async () => {
		await mount(boardComponent(false));
		const a0 = await getElementCoords(row('a0'));
		const b0 = await getElementCoords(row('b0'));
		await pointerDrag(row('a0'), { deltaX: b0.x - a0.x, deltaY: b0.y - 18 - a0.y }, { steps: 12 });
		await waitForEffects();
		await waitForEffects();
		expect(order('listA')).toBe('a1');
		expect(order('listB')!.split(',')).toContain('a0');
		const ids = [...order('listA')!.split(','), ...order('listB')!.split(',')].filter(Boolean);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test('add-only onTransfer still removes from the source (no duplicate)', async () => {
		await mount(boardComponent(true));
		await pointerDrag(row('a0'), { deltaX: 200, deltaY: 0 }, { steps: 10, release: false });
		await pointerRelease();
		await waitForEffects();
		expect(order('listA')!.split(',')).not.toContain('a0');
		const b = order('listB')!.split(',');
		expect(b).toContain('a0');
		expect(b.filter((id) => id === 'a0')).toHaveLength(1);
	});
});
