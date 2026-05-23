import { DROP_DEFAULTS, DropFactory } from '@neodrag/core/drop';
import type { DropPlugin } from '@neodrag/core/drop';
import { Attachment } from 'svelte/attachments';

const factory = new DropFactory(DROP_DEFAULTS);

export const dropWrapper = (factory: DropFactory) => {
	return (plugins?: DropPlugin[]): Attachment<HTMLElement> =>
		(element) =>
			factory.droppable(element, plugins || []);
};

export const droppable = dropWrapper(factory);

export const dropInstances = factory.instances;

// Re-export drop plugins
export * from '@neodrag/core/drop/plugins';

// Export Svelte-specific utilities
export { sortableItem, sortableItemBySelector } from './sortable.svelte.ts';