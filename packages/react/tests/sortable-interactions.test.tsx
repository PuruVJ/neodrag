/**
 * Real-browser sortable interaction parity for the React wrapper — the React port of
 * `packages/svelte/tests/sortable.test.svelte.ts` + `transfer-source-removal.test.svelte.ts`.
 * Drives real pointer gestures through useSortable → engine → React re-render, exercising the
 * `{...row(item.id)}` spread (which doubles as React's list `key`). Geometry matches the Svelte
 * harnesses byte-for-byte so the drag deltas are shared across all four frameworks' suites.
 */
import { useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { getElementCoords, pointerDrag, pointerRelease, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import { useSortable, type TransferOp } from '../src/sortable.ts';

type Item = { id: string };

const ROW_STYLE = {
	boxSizing: 'border-box' as const,
	width: 120,
	height: 40,
	margin: 0,
	lineHeight: '40px',
	textAlign: 'center' as const,
	background: '#ccd',
	border: '1px solid #557',
	touchAction: 'none' as const,
	userSelect: 'none' as const,
};

let host: HTMLDivElement;
let root: Root;

async function mount(node: React.ReactNode) {
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	root.render(node);
	await new Promise((r) => requestAnimationFrame(() => r(undefined)));
	await new Promise((r) => setTimeout(r, 0));
	await waitForEffects();
}

const order = (testid: string) => host.querySelector(`[data-testid="${testid}"]`)!.getAttribute('data-order');
const row = (id: string) => host.querySelector(`[data-testid="row-${id}"]`) as HTMLElement;

beforeEach(() => startCursorTracking());
afterEach(() => {
	stopCursorTracking();
	root.unmount();
	host.remove();
});

// ── single list ────────────────────────────────────────────────────────────
function SortableHarness() {
	const [items, setItems] = useState<Item[]>([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
	const [reorders, setReorders] = useState(0);
	const { ref, row: bindRow } = useSortable<Item>({
		items,
		axis: 'y',
		animation: 200,
		onReorder: (next) => {
			setReorders((n) => n + 1);
			setItems(next as Item[]);
		},
	});
	return (
		<ul
			data-testid="list"
			data-order={items.map((i) => i.id).join(',')}
			data-reorders={reorders}
			ref={ref}
			style={{ position: 'absolute', top: 60, left: 60, margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}
		>
			{items.map((item) => (
				<li data-testid={`row-${item.id}`} {...bindRow(item.id)} style={ROW_STYLE}>
					{item.id}
				</li>
			))}
		</ul>
	);
}

describe('@neodrag/react sortable — real-browser interactions', () => {
	test('reorder commits and leaves no stuck transforms (FLIP path)', async () => {
		await mount(<SortableHarness />);
		await pointerDrag(row('a'), { deltaX: 0, deltaY: 90 }, { steps: 8 });
		await waitForEffects();
		await waitForEffects();
		expect(order('list')).toBe('b,c,a');
		for (const id of ['a', 'b', 'c']) expect(row(id).style.translate).toBe('');
	});

	test('dropping in place fires no reorder', async () => {
		await mount(<SortableHarness />);
		await pointerDrag(row('a'), { deltaX: 0, deltaY: 8 }, { steps: 3 });
		await waitForEffects();
		expect(order('list')).toBe('a,b,c');
		expect(host.querySelector('[data-testid="list"]')!.getAttribute('data-reorders')).toBe('0');
	});
});

// ── two grouped lists (kanban + add-only) ───────────────────────────────────
function makeBoard(addOnly: boolean) {
	return function Board() {
		const [a, setA] = useState<Item[]>([{ id: 'a0' }, { id: 'a1' }]);
		const [b, setB] = useState<Item[]>([{ id: 'b0' }, { id: 'b1' }]);

		const into = (which: 'a' | 'b', op: TransferOp<Item>) => {
			if (addOnly) {
				// ONLY add to the target — the engine must remove from the source via its onReorder.
				if (which === 'a') setA((cur) => [...cur.slice(0, op.to), op.item as Item, ...cur.slice(op.to)]);
				else setB((cur) => [...cur.slice(0, op.to), op.item as Item, ...cur.slice(op.to)]);
				return;
			}
			const item = op.item as Item;
			setA((cur) => cur.filter((x) => x.id !== item.id));
			setB((cur) => cur.filter((x) => x.id !== item.id));
			if (which === 'a') setA((cur) => [...cur.slice(0, op.to), item, ...cur.slice(op.to)]);
			else setB((cur) => [...cur.slice(0, op.to), item, ...cur.slice(op.to)]);
		};

		const listA = useSortable<Item>({ items: a, id: 'a', group: 'k', axis: 'y', animation: 200, onReorder: (n) => setA(n as Item[]), onTransfer: (op) => into('a', op) });
		const listB = useSortable<Item>({ items: b, id: 'b', group: 'k', axis: 'y', animation: 200, onReorder: (n) => setB(n as Item[]), onTransfer: (op) => into('b', op) });

		const col = (which: 'a' | 'b', items: Item[], bind: typeof listA, left: number) => (
			<ul
				data-testid={`list${which.toUpperCase()}`}
				data-order={items.map((i) => i.id).join(',')}
				ref={bind.ref}
				style={{ position: 'absolute', top: 60, left, margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}
			>
				{items.map((item) => (
					<li data-testid={`row-${item.id}`} {...bind.row(item.id)} style={ROW_STYLE}>
						{item.id}
					</li>
				))}
			</ul>
		);

		return (
			<div style={{ position: 'relative', height: 320 }}>
				{col('a', a, listA, 40)}
				{col('b', b, listB, 240)}
			</div>
		);
	};
}

describe('@neodrag/react sortable — cross-list transfer', () => {
	test('cross-list transfer moves the item between lists (no duplicate)', async () => {
		const Board = makeBoard(false);
		await mount(<Board />);
		const a0 = await getElementCoords(row('a0'));
		const b0 = await getElementCoords(row('b0'));
		await pointerDrag(row('a0'), { deltaX: b0.x - a0.x, deltaY: b0.y - 18 - a0.y }, { steps: 12 });
		await waitForEffects();
		await waitForEffects();
		expect(order('listA')).toBe('a1');
		expect(order('listB')!.split(',')).toContain('a0');
		// disjoint id sets — no duplicate across the two lists
		const ids = [...order('listA')!.split(','), ...order('listB')!.split(',')].filter(Boolean);
		expect(new Set(ids).size).toBe(ids.length);
	});

	test('add-only onTransfer still removes from the source (no duplicate)', async () => {
		const Board = makeBoard(true);
		await mount(<Board />);
		await pointerDrag(row('a0'), { deltaX: 200, deltaY: 0 }, { steps: 10, release: false });
		await pointerRelease();
		await waitForEffects();
		expect(order('listA')!.split(',')).not.toContain('a0'); // engine-driven source removal
		const b = order('listB')!.split(',');
		expect(b).toContain('a0');
		expect(b.filter((id) => id === 'a0')).toHaveLength(1); // exactly once
	});
});
