import type { SizeInput } from './length-runtime.ts';
import { SIZE_BOUNDS_PLUGIN_KEY, sizeBounds } from './resize/plugins.ts';
import type { PluginSlot } from './types.ts';
import type { ResizePlugin, ResizePluginList } from './resize/types.ts';

export type ResizeDimensions = {
	width?: SizeInput;
	height?: SizeInput;
};

export type ResizeSizeInput = ResizeDimensions | SizeInput;

export type ResizeSizeBoundsInput = {
	minSize?: ResizeSizeInput;
	maxSize?: ResizeSizeInput;
	parent?: boolean | HTMLElement;
};

export type ResolvedResizeSizeBounds = {
	minWidth?: SizeInput;
	maxWidth?: SizeInput;
	minHeight?: SizeInput;
	maxHeight?: SizeInput;
	parent?: boolean | HTMLElement;
};

function expandSizeInput(value: ResizeSizeInput): ResizeDimensions {
	if (typeof value === 'number' || typeof value === 'string') {
		return { width: value, height: value };
	}
	return value;
}

export function resolveResizeSizeBounds(
	input?: ResizeSizeBoundsInput,
): ResolvedResizeSizeBounds | undefined {
	if (!input) return undefined;

	const min = input.minSize != null ? expandSizeInput(input.minSize) : undefined;
	const max = input.maxSize != null ? expandSizeInput(input.maxSize) : undefined;

	const resolved: ResolvedResizeSizeBounds = {};
	if (min?.width != null) resolved.minWidth = min.width;
	if (min?.height != null) resolved.minHeight = min.height;
	if (max?.width != null) resolved.maxWidth = max.width;
	if (max?.height != null) resolved.maxHeight = max.height;
	if (input.parent != null) resolved.parent = input.parent;

	if (
		resolved.minWidth == null &&
		resolved.maxWidth == null &&
		resolved.minHeight == null &&
		resolved.maxHeight == null &&
		resolved.parent == null
	) {
		return undefined;
	}

	return resolved;
}

function isSizeBoundsPlugin(plugin: ResizePlugin): boolean {
	return plugin.key === SIZE_BOUNDS_PLUGIN_KEY;
}

function stripSizeBoundsFromResolved(plugins: ResizePlugin[]): ResizePlugin[] {
	return plugins.filter((plugin) => !isSizeBoundsPlugin(plugin));
}

function stripSizeBoundsSlot(slot: PluginSlot<ResizePlugin>): PluginSlot<ResizePlugin> {
	if (typeof slot === 'function') {
		return () => {
			const value = slot();
			const list = Array.isArray(value) ? value : [value];
			return stripSizeBoundsFromResolved(list);
		};
	}
	return slot;
}

export function composeResizePluginList(
	plugins: ResizePluginList,
	bounds?: ResizeSizeBoundsInput,
): ResizePluginList {
	const resolved = resolveResizeSizeBounds(bounds);
	if (!resolved) return plugins;

	const boundPlugin = sizeBounds(resolved);
	const slots: ResizePluginList = [];

	for (const slot of plugins) {
		if (typeof slot !== 'function' && isSizeBoundsPlugin(slot)) continue;
		slots.push(stripSizeBoundsSlot(slot));
	}

	slots.push(boundPlugin);
	return slots;
}
