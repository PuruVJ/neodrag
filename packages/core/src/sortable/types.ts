import type { LengthAdapter, SizeInput } from '../length-runtime.ts';
import type { DragPluginList, DropPluginList } from '../types.ts';
import type { SortableStrategyInput, SortingStrategy } from './strategy/types.ts';

export type SortablePreset = 'vertical' | 'horizontal' | 'grid';
export type SortableStrategy = SortablePreset;
export type SortableMode = 'insert' | 'swap';
export type SortablePreviewMode = 'visual' | 'state';
export type SortableCollision = 'closestCenter' | 'pointerWithin';

export interface SortableTransition {
	duration: number;
	easing: string;
}

export interface OverlayOptions {
	className?: string;
	zIndex?: number;
}

export interface SortablePreviewMeta {
	from: number;
	to: number;
	item: unknown;
	mode: SortableMode;
}

export interface SortableIntentMeta<T> {
	from: number;
	to: number;
	item: T;
	mode: SortableMode;
}

export interface SortableReorderMeta<T> {
	from: number;
	to: number;
	item: T;
	mode?: SortableMode;
	phase?: 'preview' | 'commit';
}

export type GroupSourcePreview = 'freeze' | 'reflow';

export interface SortableTransferMeta {
	fromIndex: number;
	toIndex: number;
	sourceId: symbol;
	phase: 'preview' | 'commit';
}

export interface SortableOptions<T> {
	items: () => readonly T[];
	keyBy: (item: T) => string;
	onReorder: (next: T[], meta: SortableReorderMeta<T>) => void;
	onSortPreview?: (next: T[], meta: SortablePreviewMeta) => void;
	preview?: SortablePreviewMode;
	onIntentChange?: (intent: SortableIntentMeta<T>) => void;
	strategy?: SortableStrategyInput | (() => SortableStrategyInput);
	mode?: SortableMode;
	keyboard?: boolean;
	group?: string;
	groupSourcePreview?: GroupSourcePreview;
	onTransfer?: (item: T, meta: SortableTransferMeta) => void;
	edgeThreshold?: SizeInput;
	foreignProximity?: SizeInput;
	length?: LengthAdapter;
	transition?: SortableTransition | null;
	releaseDuration?: number;
	collision?: SortableCollision;
	onVisualReleaseEnd?: () => void;
	overlay?: boolean | OverlayOptions;
	itemPlugins?: (key: string, item: T | undefined) => DragPluginList;
	containerPlugins?: () => DropPluginList;
}

export type { SortableStrategyInput, SortingStrategy };
