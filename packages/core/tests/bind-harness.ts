import type { Neodrag } from '../src/index.ts';
import type { DragPlugin } from '../src/types.ts';

export function stableDraggable(
	engine: Neodrag,
	pluginsFor: (id: string) => DragPlugin[],
) {
	const cache = new Map<string, (node: HTMLElement) => () => void>();
	return (id: string) => {
		let bind = cache.get(id);
		if (!bind) {
			bind = (node) => {
				const handle = engine.draggable(node, pluginsFor(id), { threshold: null });
				return () => handle.destroy();
			};
			cache.set(id, bind);
		}
		return bind;
	};
}

export function stableDroppable(
	engine: Neodrag,
	plugins: () => import('../src/types.ts').DropPlugin[],
) {
	let bind: ((node: HTMLElement) => () => void) | undefined;
	return () => {
		if (!bind) {
			bind = (node) => {
				const handle = engine.droppable(node, plugins());
				return () => handle.destroy();
			};
		}
		return bind;
	};
}
