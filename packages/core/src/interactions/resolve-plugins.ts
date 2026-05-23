import { Compartment } from './compartment.ts';
import type { DragPlugin, DragPluginEntry, DragPluginInput } from './types.ts';

export function resolveDragPlugins(input: DragPluginInput | DragPluginEntry[]): DragPlugin[] {
	const list = typeof input === 'function' ? input() : input;
	const plugins: DragPlugin[] = [];

	for (const item of list) {
		if (item instanceof Compartment) {
			const current = item.current;
			if (current) plugins.push(current);
		} else {
			plugins.push(item);
		}
	}

	return plugins;
}

export function collectCompartments(input: DragPluginInput | DragPluginEntry[]): Compartment[] {
	const list = typeof input === 'function' ? input() : input;
	return list.filter((item): item is Compartment => item instanceof Compartment);
}
