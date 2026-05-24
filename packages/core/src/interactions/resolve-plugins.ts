import type { DragPlugin, DragPluginInput, DropPlugin, DropPluginInput, PluginInput } from './types.ts';

export function resolvePlugins<T>(input: PluginInput<T>): T[] {
	return typeof input === 'function' ? input() : input;
}

export function resolveDragPlugins(input: DragPluginInput): DragPlugin[] {
	return resolvePlugins(input);
}

export function resolveDropPlugins(input: DropPluginInput): DropPlugin[] {
	return resolvePlugins(input);
}
