import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Sortable } from '../../src/sortable/sortable.ts';
import { mockRect } from './_browser.ts';

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(undefined)));
async function frames(n: number) {
	for (let i = 0; i < n; i++) await nextFrame();
}

/**
 * A sortable peer modeling an ASYNC-render framework (Svelte 5 / Vue 3): `onReorder` updates the
 * `items` data array synchronously, but the DOM `render()` is deferred to the next animation frame
 * (coalesced) — so the `data-neodrag-sortable-key` attributes lag the data by a frame, exactly the window
 * in which a same-tick second remote op would read stale DOM.
 *
 * `sync: true` flips it to a synchronous renderer (DOM patched in `onReorder`), like a real page
 * that re-renders eagerly — used to prove the first op still applies without waiting.
 */
function asyncPeer(ids: string[], id = 'list', sync = false) {
	const container = document.createElement('ul');
	const items = ids.map((k) => ({ id: k }));
	let scheduled = false;
	const render = () => {
		container.innerHTML = '';
		items.forEach((it, i) => {
			const li = document.createElement('li');
			li.setAttribute('data-neodrag-sortable-key', it.id);
			container.appendChild(li);
			mockRect(li, { left: 0, top: i * 50, right: 100, bottom: i * 50 + 50 });
		});
	};
	render();
	document.body.appendChild(container);

	const dnd = new Interactions({ defaultSensors: false });
	const sortable = new Sortable();
	dnd.use(sortable);
	const handle = sortable.bind(container, {
		items,
		id,
		onReorder: (next) => {
			items.length = 0;
			items.push(...(next as { id: string }[]));
			if (sync) {
				render();
			} else if (!scheduled) {
				scheduled = true;
				requestAnimationFrame(() => {
					scheduled = false;
					render();
				});
			}
		},
	});

	return {
		container,
		handle,
		order: () => items.map((it) => it.id),
		domOrder: () =>
			Array.from(container.querySelectorAll('[data-neodrag-sortable-key]'), (n) => n.getAttribute('data-neodrag-sortable-key')),
	};
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('sortable remote-op bursts on async-render frameworks', () => {
	it('two ops in one tick converge (the second must not read stale DOM)', async () => {
		const p = asyncPeer(['a', 'b', 'c', 'd']);
		// One synchronous tick: two anchor moves. Applied sequentially the result is deterministic —
		// op1 (a after c): [b,c,a,d]; op2 (d after b): [b,d,c,a].
		p.handle.applyExternal({ type: 'move', target: 'list', itemId: 'a', afterId: 'c' });
		p.handle.applyExternal({ type: 'move', target: 'list', itemId: 'd', afterId: 'b' });
		await frames(5);
		expect(p.order()).toEqual(['b', 'd', 'c', 'a']);
		expect(p.domOrder()).toEqual(['b', 'd', 'c', 'a']); // DOM caught up to the data
	});

	it('a duplicate op inside a burst is idempotent', async () => {
		const p = asyncPeer(['a', 'b', 'c', 'd']);
		p.handle.applyExternal({ type: 'move', target: 'list', itemId: 'a', afterId: 'c' });
		p.handle.applyExternal({ type: 'move', target: 'list', itemId: 'a', afterId: 'c' }); // same op again
		await frames(5);
		// Sending 'a after c' once or twice lands the same order.
		const once = asyncPeer(['a', 'b', 'c', 'd']);
		once.handle.applyExternal({ type: 'move', target: 'list', itemId: 'a', afterId: 'c' });
		await frames(5);
		expect(p.order()).toEqual(once.order());
	});

	it('a synchronous renderer applies the first op immediately (no frame wait)', async () => {
		const p = asyncPeer(['a', 'b', 'c', 'd'], 'list', true);
		p.handle.applyExternal({ type: 'move', target: 'list', itemId: 'a', afterId: 'c' });
		expect(p.order()).toEqual(['b', 'c', 'a', 'd']); // visible synchronously — first op is never deferred
		p.handle.applyExternal({ type: 'move', target: 'list', itemId: 'd', afterId: 'b' });
		await frames(5);
		expect(p.order()).toEqual(['b', 'd', 'c', 'a']);
		expect(p.domOrder()).toEqual(['b', 'd', 'c', 'a']);
	});
});
