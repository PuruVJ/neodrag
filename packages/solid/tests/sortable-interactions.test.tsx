/**
 * Real-browser sortable interaction parity for the Solid wrapper — the Solid port of
 * `packages/svelte/tests/sortable.test.svelte.ts` + `transfer-source-removal.test.svelte.ts`.
 * Drives real pointer gestures through createSortable → engine → Solid re-render, exercising the
 * `{...row(item.id)}` JSX spread over `<For>`. Geometry matches the Svelte harnesses byte-for-byte.
 */
import { createSignal, For, type JSX } from 'solid-js';
import { render } from 'solid-js/web';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { getElementCoords, pointerDrag, pointerRelease, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import { createSortable, type TransferOp } from '../src/sortable.ts';

type Item = { id: string };

const ROW_STYLE: JSX.CSSProperties = {
	'box-sizing': 'border-box',
	width: '120px',
	height: '40px',
	margin: '0',
	'line-height': '40px',
	'text-align': 'center',
	background: '#ccd',
	border: '1px solid #557',
	'touch-action': 'none',
	'user-select': 'none',
};
const listStyle = (left: number): JSX.CSSProperties => ({
	position: 'absolute',
	top: '60px',
	left: `${left}px`,
	margin: '0',
	padding: '0',
	'list-style': 'none',
	display: 'flex',
	'flex-direction': 'column',
});

let host: HTMLDivElement;
let dispose: () => void;

async function mount(comp: () => JSX.Element) {
	host = document.createElement('div');
	document.body.appendChild(host);
	dispose = render(comp, host);
	await waitForEffects();
}

const order = (testid: string) => host.querySelector(`[data-testid="${testid}"]`)!.getAttribute('data-order');
const row = (id: string) => host.querySelector(`[data-testid="row-${id}"]`) as HTMLElement;

beforeEach(() => startCursorTracking());
afterEach(() => {
	stopCursorTracking();
	dispose();
	host.remove();
});

function SortableHarness(props: { onReorderCount: (n: number) => void }) {
	const [items, setItems] = createSignal<Item[]>([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
	let reorders = 0;
	const { ref, row: bindRow } = createSortable<Item>({
		get items() {
			return items();
		},
		axis: 'y',
		animation: 200,
		onReorder: (next) => {
			props.onReorderCount((reorders += 1));
			setItems(next as Item[]);
		},
	});
	return (
		<ul data-testid="list" data-order={items().map((i) => i.id).join(',')} ref={ref} style={listStyle(60)}>
			<For each={items()}>
				{(item) => (
					<li data-testid={`row-${item.id}`} {...bindRow(item.id)} style={ROW_STYLE}>
						{item.id}
					</li>
				)}
			</For>
		</ul>
	);
}

describe('@neodrag/solid sortable — real-browser interactions', () => {
	test('reorder commits and leaves no stuck transforms (FLIP path)', async () => {
		await mount(() => <SortableHarness onReorderCount={() => {}} />);
		await pointerDrag(row('a'), { deltaX: 0, deltaY: 90 }, { steps: 8 });
		await waitForEffects();
		await waitForEffects();
		expect(order('list')).toBe('b,c,a');
		for (const id of ['a', 'b', 'c']) expect(row(id).style.translate).toBe('');
	});

	test('dropping in place fires no reorder', async () => {
		let count = 0;
		await mount(() => <SortableHarness onReorderCount={(n) => (count = n)} />);
		await pointerDrag(row('a'), { deltaX: 0, deltaY: 8 }, { steps: 3 });
		await waitForEffects();
		expect(order('list')).toBe('a,b,c');
		expect(count).toBe(0);
	});
});

function Board(props: { addOnly: boolean }) {
	const [a, setA] = createSignal<Item[]>([{ id: 'a0' }, { id: 'a1' }]);
	const [b, setB] = createSignal<Item[]>([{ id: 'b0' }, { id: 'b1' }]);
	const into = (which: 'a' | 'b', op: TransferOp<Item>) => {
		const item = op.item as Item;
		if (!props.addOnly) {
			setA((cur) => cur.filter((x) => x.id !== item.id));
			setB((cur) => cur.filter((x) => x.id !== item.id));
		}
		if (which === 'a') setA((cur) => [...cur.slice(0, op.to), item, ...cur.slice(op.to)]);
		else setB((cur) => [...cur.slice(0, op.to), item, ...cur.slice(op.to)]);
	};
	const listA = createSortable<Item>({
		get items() {
			return a();
		},
		id: 'a',
		group: 'k',
		axis: 'y',
		animation: 200,
		onReorder: (n) => setA(n as Item[]),
		onTransfer: (op) => into('a', op),
	});
	const listB = createSortable<Item>({
		get items() {
			return b();
		},
		id: 'b',
		group: 'k',
		axis: 'y',
		animation: 200,
		onReorder: (n) => setB(n as Item[]),
		onTransfer: (op) => into('b', op),
	});
	const col = (testid: string, items: () => Item[], bind: typeof listA, left: number) => (
		<ul data-testid={testid} data-order={items().map((i) => i.id).join(',')} ref={bind.ref} style={listStyle(left)}>
			<For each={items()}>
				{(item) => (
					<li data-testid={`row-${item.id}`} {...bind.row(item.id)} style={ROW_STYLE}>
						{item.id}
					</li>
				)}
			</For>
		</ul>
	);
	return (
		<div style={{ position: 'relative', height: '320px' }}>
			{col('listA', a, listA, 40)}
			{col('listB', b, listB, 240)}
		</div>
	);
}

describe('@neodrag/solid sortable — cross-list transfer', () => {
	test('cross-list transfer moves the item between lists (no duplicate)', async () => {
		await mount(() => <Board addOnly={false} />);
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
		await mount(() => <Board addOnly={true} />);
		await pointerDrag(row('a0'), { deltaX: 200, deltaY: 0 }, { steps: 10, release: false });
		await pointerRelease();
		await waitForEffects();
		expect(order('listA')!.split(',')).not.toContain('a0');
		const bIds = order('listB')!.split(',');
		expect(bIds).toContain('a0');
		expect(bIds.filter((id) => id === 'a0')).toHaveLength(1);
	});
});
