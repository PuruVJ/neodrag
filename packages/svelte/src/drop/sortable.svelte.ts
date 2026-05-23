import { registerSortableItem } from '@neodrag/core/drop/plugins';
import { Attachment } from 'svelte/attachments';

/**
 * Svelte action to register an element as a sortable item
 * Usage: {@attach sortableItem(containerElement)}
 * 
 * @param container The container element that has the sortable drop plugin
 * @returns An attachment that registers the element as sortable
 */
export const sortableItem = (container: HTMLElement): Attachment<HTMLElement> => 
	(element) => registerSortableItem(element, container);

/**
 * Alternative approach using a selector to find the container
 * Usage: {@attach sortableItemBySelector('.sortable-container')}
 */
export const sortableItemBySelector = (containerSelector: string): Attachment<HTMLElement> => 
	(element) => {
		const container = element.closest(containerSelector) as HTMLElement;
		if (!container) {
			console.warn(`sortableItemBySelector: Container not found for selector "${containerSelector}"`);
			return () => {};
		}
		return registerSortableItem(element, container);
	};