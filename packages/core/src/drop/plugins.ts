import type { DropPlugin } from './index.ts';
import { sortable_registry } from '../symbols.ts';

export function unstable_defineDropPlugin<T>(
	plugin: (options?: T) => DropPlugin,
): (options?: T) => DropPlugin {
	return plugin;
}

/**
 * Validates whether a dragged element can be dropped based on selector/function
 */
export const validation = unstable_defineDropPlugin<{
	accepts?: string | ((draggedEl: HTMLElement | SVGElement) => boolean);
}>((options = {}) => ({
	name: 'validation',
	priority: 100,
	
	onEnter(ctx, _) {
		if (!ctx.draggedElement) return;
		
		const { accepts } = options;
		if (!accepts) return;
		
		let isValid = false;
		
		if (typeof accepts === 'string') {
			// Check if dragged element matches selector
			isValid = ctx.draggedElement.matches(accepts);
		} else if (typeof accepts === 'function') {
			// Use custom validation function
			isValid = accepts(ctx.draggedElement);
		}
		
		if (!isValid) {
			ctx.reject();
			return false;
		}
		
		ctx.accept();
	},
}));

/**
 * Adds visual feedback when hovering over drop zone
 */
export const highlight = unstable_defineDropPlugin<{
	activeClass?: string;
	overClass?: string;
}>((options = {}) => ({
	name: 'highlight',
	priority: 50,
	
	setup() {
		const activeClass = options.activeClass || 'neodrag-drop-active';
		const overClass = options.overClass || 'neodrag-drop-over';
		
		return { activeClass, overClass };
	},
	
	onEnter(ctx, state) {
		ctx.effect.paint(() => {
			ctx.dropNode.classList.add(state.overClass);
		});
	},
	
	onLeave(ctx, state) {
		ctx.effect.paint(() => {
			ctx.dropNode.classList.remove(state.overClass);
		});
	},
	
	cleanup(ctx, state) {
		ctx.dropNode.classList.remove(state.activeClass, state.overClass);
	},
}));

/**
 * Manages data transfer between drag and drop
 */
export const data = unstable_defineDropPlugin<{
	onReceive?: (data: any) => void;
}>((options = {}) => ({
	name: 'data',
	priority: 90,
	
	onDrop(ctx) {
		if (options.onReceive && ctx.data) {
			options.onReceive(ctx.data);
		}
	},
}));

/**
 * Makes a drop zone sortable - elements can be reordered within it with real-time feedback
 * Items register themselves explicitly rather than using selectors
 */
export const sortable = unstable_defineDropPlugin<{
	onSort?: (from: number, to: number) => void;
}>((options = {}) => ({
	name: 'sortable',
	priority: 80,
	
	setup(ctx) {
		// Registry of all sortable items in this container
		const itemRegistry = new Set<HTMLElement>();
		
		// Add registry to dropNode using Symbol
		(ctx.dropNode as any)[sortable_registry] = {
			register: (item: HTMLElement) => itemRegistry.add(item),
			unregister: (item: HTMLElement) => itemRegistry.delete(item),
			getItems: () => Array.from(itemRegistry),
		};
		
		return { 
			itemRegistry,
			draggedElement: null as HTMLElement | null,
			originalIndex: -1,
			currentIndex: -1,
			sortableItems: [] as HTMLElement[],
			originalZIndex: '',
		};
	},
	
	onEnter(ctx, state) {
		if (!ctx.draggedElement) return;
		
		// Get all registered sortable items in DOM order
		const allItems = state.itemRegistry;
		state.sortableItems = Array.from(ctx.dropNode.children).filter(child => 
			allItems.has(child as HTMLElement)
		) as HTMLElement[];
		
		// Check if dragged element is a registered sortable item
		if (!state.itemRegistry.has(ctx.draggedElement as HTMLElement)) {
			return;
		}
		
		state.draggedElement = ctx.draggedElement as HTMLElement;
		state.originalIndex = state.sortableItems.indexOf(state.draggedElement);
		state.currentIndex = state.originalIndex;
		
		// Fix stacking - boost z-index and add dragging class
		ctx.effect.paint(() => {
			state.originalZIndex = state.draggedElement!.style.zIndex;
			state.draggedElement!.style.zIndex = '9999';
			state.draggedElement!.classList.add('neodrag-sortable-dragging');
		});
	},
	
	onOver(ctx, state, event) {
		if (!state.draggedElement || state.sortableItems.length === 0) return;
		
		const mouseY = event.clientY;
		
		// Find which item we should insert before based on mouse position
		let newIndex = -1;
		
		for (let i = 0; i < state.sortableItems.length; i++) {
			const item = state.sortableItems[i];
			if (item === state.draggedElement) continue;
			
			const itemRect = item.getBoundingClientRect();
			const itemMiddle = itemRect.top + itemRect.height / 2;
			
			if (mouseY < itemMiddle) {
				newIndex = i;
				break;
			}
		}
		
		// If no item found, insert at end
		if (newIndex === -1) {
			newIndex = state.sortableItems.length - 1;
		}
		
		// Adjust index if we're inserting after the dragged element's original position
		if (newIndex > state.originalIndex) {
			newIndex--;
		}
		
		// Only update if position changed
		if (newIndex !== state.currentIndex && newIndex >= 0) {
			state.currentIndex = newIndex;
			
			// Move the actual dragged element to new position in DOM
			ctx.effect.paint(() => {
				if (newIndex >= state.sortableItems.length - 1) {
					// Insert at end
					ctx.dropNode.appendChild(state.draggedElement!);
				} else {
					// Insert before the item at newIndex
					const referenceItem = state.sortableItems[newIndex];
					if (referenceItem && referenceItem !== state.draggedElement) {
						ctx.dropNode.insertBefore(state.draggedElement!, referenceItem);
					}
				}
			});
		}
	},
	
	onDrop(ctx, state) {
		if (!state.draggedElement) return;
		
		// Restore z-index and remove dragging class
		ctx.effect.paint(() => {
			state.draggedElement!.style.zIndex = state.originalZIndex;
			state.draggedElement!.classList.remove('neodrag-sortable-dragging');
		});
		
		// Fire sort event if position changed
		if (state.currentIndex !== state.originalIndex && state.currentIndex >= 0 && options.onSort) {
			options.onSort(state.originalIndex, state.currentIndex);
		}
	},
	
	onLeave(ctx, state) {
		if (!state.draggedElement) return;
		
		// Restore z-index, remove dragging class, and reset position
		ctx.effect.paint(() => {
			state.draggedElement!.style.zIndex = state.originalZIndex;
			state.draggedElement!.classList.remove('neodrag-sortable-dragging');
			
			// Move element back to original position
			if (state.originalIndex < state.sortableItems.length) {
				const referenceNode = state.sortableItems[state.originalIndex];
				if (referenceNode && referenceNode.parentNode === ctx.dropNode) {
					if (state.originalIndex === 0) {
						ctx.dropNode.insertBefore(state.draggedElement!, ctx.dropNode.firstChild);
					} else {
						ctx.dropNode.insertBefore(state.draggedElement!, referenceNode);
					}
				}
			} else {
				ctx.dropNode.appendChild(state.draggedElement!);
			}
		});
		
		state.currentIndex = state.originalIndex;
	},
	
	cleanup(_, state) {
		if (state.draggedElement) {
			state.draggedElement.style.zIndex = state.originalZIndex;
			state.draggedElement.classList.remove('neodrag-sortable-dragging');
		}
	},
}));

/**
 * Helper function for elements to register as sortable items
 * Call this on elements that should participate in sorting
 */
export function registerSortableItem(element: HTMLElement, container: HTMLElement) {
	const registry = (container as any)[sortable_registry];
	if (registry) {
		registry.register(element);
		
		// Return cleanup function
		return () => registry.unregister(element);
	}
	return () => {}; // no-op if no registry found
}

/**
 * Allows cross-zone dropping between different containers
 */
export const crossZone = unstable_defineDropPlugin<{
	group?: string;
	onTransfer?: (from: HTMLElement, to: HTMLElement) => void;
}>((options = {}) => ({
	name: 'crossZone',
	priority: 85,
	
	setup(ctx) {
		const group = options.group || 'default';
		
		// Add data attribute to identify group
		ctx.dropNode.dataset.neodragDropGroup = group;
		
		return { group };
	},
	
	onEnter(ctx, state) {
		if (!ctx.draggedElement) return;
		
		// Check if dragged element is from same group
		const sourceContainer = ctx.draggedElement.closest('[data-neodrag-drop-group]') as HTMLElement;
		if (!sourceContainer) return;
		
		const sourceGroup = sourceContainer.dataset.neodragDropGroup;
		if (sourceGroup !== state.group) {
			ctx.reject();
			return false;
		}
		
		ctx.accept();
	},
	
	onDrop(ctx) {
		if (!ctx.draggedElement) return;
		
		const sourceContainer = ctx.draggedElement.closest('[data-neodrag-drop-group]') as HTMLElement;
		if (!sourceContainer || sourceContainer === ctx.dropNode) return;
		
		// Transfer element to new container
		ctx.effect.paint(() => {
			ctx.dropNode.appendChild(ctx.draggedElement!);
		});
		
		if (options.onTransfer) {
			options.onTransfer(sourceContainer, ctx.dropNode as HTMLElement);
		}
	},
	
	cleanup(ctx) {
		delete ctx.dropNode.dataset.neodragDropGroup;
	},
}));

/**
 * Provides auto-scrolling when dragging near edges
 */
export const autoScroll = unstable_defineDropPlugin<{
	speed?: number;
	margin?: number;
}>((options = {}) => ({
	name: 'autoScroll',
	priority: 30,
	
	setup() {
		const speed = options.speed || 10;
		const margin = options.margin || 50;
		let scrollInterval: number | null = null;
		
		return { speed, margin, scrollInterval };
	},
	
	onOver(ctx, state, event) {
		const rect = ctx.dropNode.getBoundingClientRect();
		const y = event.clientY;
		
		// Clear existing scroll
		if (state.scrollInterval) {
			clearInterval(state.scrollInterval);
			state.scrollInterval = null;
		}
		
		// Check if near edges
		let scrollDirection = 0;
		if (y < rect.top + state.margin) {
			scrollDirection = -1;
		} else if (y > rect.bottom - state.margin) {
			scrollDirection = 1;
		}
		
		if (scrollDirection !== 0) {
			state.scrollInterval = setInterval(() => {
				ctx.dropNode.scrollTop += scrollDirection * state.speed;
			}, 16) as unknown as number;
		}
	},
	
	onLeave(ctx, state) {
		if (state.scrollInterval) {
			clearInterval(state.scrollInterval);
			state.scrollInterval = null;
		}
	},
	
	cleanup(_, state) {
		if (state.scrollInterval) {
			clearInterval(state.scrollInterval);
		}
	},
}));