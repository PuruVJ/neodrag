import { unstable_definePlugin } from '@neodrag/core/plugins';

// Types
interface ActiveDragInfo {
	original_element: HTMLElement | SVGElement;
	ghost_element: HTMLElement | SVGElement | null;
	data: any;
	type?: string;
	start_time: number;
}

interface DropZoneInstance {
	element: HTMLElement | SVGElement;
	id: string;
	options: DropZoneOptions;
	is_active: boolean;
	rect: DOMRect;
	last_updated: number;
}

interface DropResult {
	accepted: boolean;
	dropZone?: DropZoneInstance;
	data?: any;
	reason?: string;
}

interface CollisionInfo {
	dropZone: DropZoneInstance | null;
	overlap: number; // 0-1, percentage of overlap
	distance: number; // pixels from center
}

// Main DropZoneManager Class
export class DropZoneManager {
	#active_drag: ActiveDragInfo | null = null;
	#drop_zones = new Map<string, DropZoneInstance>();
	#current_drop_zone: DropZoneInstance | null = null;
	#options: DropZoneOptions;
	#rect_cache = new Map<string, { rect: DOMRect; timestamp: number }>();
	readonly #RECT_CACHE_DURATION = 16; // ~1 frame at 60fps

	constructor(options: DropZoneOptions) {
		this.#options = {
			tolerance: 'pointer',
			accept: () => true,
			canDrop: () => true,
			...options,
		};
	}

	// Drop Zone Registration
	register_drop_zone(element: HTMLElement, options: Partial<DropZoneOptions> = {}): string {
		const id = this.#generate_id();
		const instance: DropZoneInstance = {
			element,
			id,
			options: { ...this.#options, ...options },
			is_active: false,
			rect: element.getBoundingClientRect(),
			last_updated: performance.now(),
		};

		this.#drop_zones.set(id, instance);

		// Add visual indicators
		element.classList.add('neodrag-drop-zone');
		element.dataset.neodragDropZone = id;

		return id;
	}

	unregister_drop_zone(id: string): void {
		const instance = this.#drop_zones.get(id);
		if (instance) {
			instance.element.classList.remove(
				'neodrag-drop-zone',
				'neodrag-drop-zone-active',
				'neodrag-drop-zone-invalid',
			);
			delete instance.element.dataset.neodragDropZone;
			this.#drop_zones.delete(id);
		}
	}

	// Drag Lifecycle
	start_drag(dragInfo: Omit<ActiveDragInfo, 'start_time'>): void {
		this.#active_drag = {
			...dragInfo,
			start_time: performance.now(),
		};

		// Invalidate rect cache
		this.#rect_cache.clear();

		// Notify all compatible drop zones
		this.#drop_zones.forEach((dropZone) => {
			if (this.#can_accept_drag(dropZone, this.#active_drag!)) {
				dropZone.is_active = true;
				dropZone.element.classList.add('neodrag-drop-zone-active');
				dropZone.options.onDragStart?.(this.#active_drag!);
			}
		});
	}

	update_drag_position(clientX: number, clientY: number): CollisionInfo {
		if (!this.#active_drag) {
			return { dropZone: null, overlap: 0, distance: 0 };
		}

		// Find best drop zone match
		const collision = this.#find_best_drop_zone(clientX, clientY);
		const new_drop_zone = collision.dropZone;

		// Handle drop zone transitions
		if (new_drop_zone !== this.#current_drop_zone) {
			// Leave previous drop zone
			if (this.#current_drop_zone) {
				this.#current_drop_zone.element.classList.remove('neodrag-drop-zone-hover');
				this.#current_drop_zone.options.onDragLeave?.(this.#active_drag);
			}

			// Enter new drop zone
			if (new_drop_zone) {
				const canDrop = this.#can_drop(new_drop_zone, this.#active_drag);
				new_drop_zone.element.classList.add('neodrag-drop-zone-hover');
				new_drop_zone.element.classList.toggle('neodrag-drop-zone-invalid', !canDrop);
				new_drop_zone.options.onDragEnter?.(this.#active_drag);
			}

			this.#current_drop_zone = new_drop_zone;
		}

		// Continuous drag over
		if (this.#current_drop_zone) {
			this.#current_drop_zone.options.onDragOver?.({
				...this.#active_drag,
				clientX,
				clientY,
				overlap: collision.overlap,
			});
		}

		return collision;
	}

	end_drag(clientX: number, clientY: number): DropResult {
		if (!this.#active_drag) {
			return { accepted: false, reason: 'no-active-drag' };
		}

		const collision = this.#find_best_drop_zone(clientX, clientY);
		const dropZone = collision.dropZone;

		let result: DropResult;

		if (dropZone && this.#can_drop(dropZone, this.#active_drag)) {
			// Successful drop
			result = {
				accepted: true,
				dropZone,
				data: this.#active_drag.data,
			};

			dropZone.options.onDrop?.({
				originalElement: this.#active_drag.original_element,
				ghostElement: this.#active_drag.ghost_element,
				dropZone: dropZone.element,
				data: this.#active_drag.data,
				clientX,
				clientY,
				overlap: collision.overlap,
			});
		} else {
			// Invalid drop
			result = {
				accepted: false,
				reason: dropZone ? 'validation-failed' : 'no-drop-zone',
			};

			this.#options.onInvalidDrop?.(this.#active_drag);
		}

		// Cleanup
		this.#cleanup();
		return result;
	}

	// Collision Detection
	#find_best_drop_zone(clientX: number, clientY: number): CollisionInfo {
		if (!this.#active_drag) {
			return { dropZone: null, overlap: 0, distance: 0 };
		}

		let best_match: CollisionInfo = { dropZone: null, overlap: 0, distance: Infinity };

		for (const dropZone of this.#drop_zones.values()) {
			if (!dropZone.is_active) continue;

			const collision = this.#calculate_collision(dropZone, clientX, clientY);

			if (collision.overlap > 0 || collision.distance < 50) {
				// 50px tolerance
				// Prefer higher overlap, then closer distance
				if (
					collision.overlap > best_match.overlap ||
					(collision.overlap === best_match.overlap && collision.distance < best_match.distance)
				) {
					best_match = collision;
				}
			}
		}

		return best_match;
	}

	#calculate_collision(
		dropZone: DropZoneInstance,
		clientX: number,
		clientY: number,
	): CollisionInfo {
		const rect = this.#get_cached_rect(dropZone);
		const tolerance = dropZone.options.tolerance || this.#options.tolerance;

		let overlap = 0;
		let distance = 0;

		switch (tolerance) {
			case 'pointer':
				// Check if pointer is inside drop zone
				const isInside =
					clientX >= rect.left &&
					clientX <= rect.right &&
					clientY >= rect.top &&
					clientY <= rect.bottom;
				overlap = isInside ? 1 : 0;
				distance = this.#distance_to_rect(clientX, clientY, rect);
				break;

			case 'intersect':
				// Check if dragged element intersects with drop zone
				if (this.#active_drag?.ghost_element) {
					const ghostRect = this.#active_drag.ghost_element.getBoundingClientRect();
					overlap = this.#calculate_rect_overlap(ghostRect, rect);
					distance = this.#distance_between_rects(ghostRect, rect);
				}
				break;

			case 'touch':
				// Check if dragged element touches drop zone
				if (this.#active_drag?.ghost_element) {
					const ghostRect = this.#active_drag.ghost_element.getBoundingClientRect();
					const touches = this.#rects_touch(ghostRect, rect);
					overlap = touches ? 0.1 : 0; // Minimal overlap for touch
					distance = this.#distance_between_rects(ghostRect, rect);
				}
				break;
		}

		return {
			dropZone: overlap > 0 ? dropZone : null,
			overlap,
			distance,
		};
	}

	// Geometric Calculations
	#calculate_rect_overlap(rect1: DOMRect, rect2: DOMRect): number {
		const overlapX = Math.max(
			0,
			Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left),
		);
		const overlapY = Math.max(
			0,
			Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top),
		);
		const overlapArea = overlapX * overlapY;
		const rect1Area = rect1.width * rect1.height;

		return rect1Area > 0 ? overlapArea / rect1Area : 0;
	}

	#rects_touch(rect1: DOMRect, rect2: DOMRect): boolean {
		return !(
			rect1.right < rect2.left ||
			rect1.left > rect2.right ||
			rect1.bottom < rect2.top ||
			rect1.top > rect2.bottom
		);
	}

	#distance_to_rect(x: number, y: number, rect: DOMRect): number {
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		return Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
	}

	#distance_between_rects(rect1: DOMRect, rect2: DOMRect): number {
		const center1_x = rect1.left + rect1.width / 2;
		const center1_y = rect1.top + rect1.height / 2;
		const center2_x = rect2.left + rect2.width / 2;
		const center2_y = rect2.top + rect2.height / 2;

		return Math.sqrt((center1_x - center2_x) ** 2 + (center1_y - center2_y) ** 2);
	}

	// Validation
	#can_accept_drag(dropZone: DropZoneInstance, dragInfo: ActiveDragInfo): boolean {
		const accept = dropZone.options.accept || this.#options.accept;

		if (typeof accept === 'string') {
			return dragInfo.type === accept;
		}
		if (Array.isArray(accept)) {
			return accept.includes(dragInfo.type || '');
		}
		if (typeof accept === 'function') {
			return accept(dragInfo.data);
		}

		return true;
	}

	#can_drop(dropZone: DropZoneInstance, dragInfo: ActiveDragInfo): boolean {
		const can_drop = dropZone.options.canDrop || this.#options.canDrop;
		return typeof can_drop === 'function' ? can_drop(dragInfo.data) : true;
	}

	// Performance Optimization
	#get_cached_rect(dropZone: DropZoneInstance): DOMRect {
		const now = performance.now();
		const cached = this.#rect_cache.get(dropZone.id);

		if (cached && now - cached.timestamp < this.#RECT_CACHE_DURATION) {
			return cached.rect;
		}

		const rect = dropZone.element.getBoundingClientRect();
		this.#rect_cache.set(dropZone.id, { rect, timestamp: now });
		return rect;
	}

	// Cleanup
	#cleanup(): void {
		// Leave current drop zone
		if (this.#current_drop_zone) {
			this.#current_drop_zone.element.classList.remove('neodrag-drop-zone-hover');
			this.#current_drop_zone.options.onDragLeave?.(this.#active_drag!);
		}

		// Deactivate all drop zones
		this.#drop_zones.forEach((dropZone) => {
			dropZone.is_active = false;
			dropZone.element.classList.remove(
				'neodrag-drop-zone-active',
				'neodrag-drop-zone-hover',
				'neodrag-drop-zone-invalid',
			);
		});

		// Clear state
		this.#active_drag = null;
		this.#current_drop_zone = null;
		this.#rect_cache.clear();
	}

	// Utilities
	#generate_id(): string {
		return `neodrag-drop-${Math.random().toString(36).substr(2, 9)}`;
	}

	// Public API for debugging
	get_active_drop_zones(): DropZoneInstance[] {
		return Array.from(this.#drop_zones.values()).filter((dz) => dz.is_active);
	}

	get_current_drop_zone(): DropZoneInstance | null {
		return this.#current_drop_zone;
	}

	get_active_drag(): ActiveDragInfo | null {
		return this.#active_drag;
	}
}

// Option Interfaces
interface DropZoneOptions {
	tolerance?: 'pointer' | 'intersect' | 'touch';
	accept?: string | string[] | ((data: any) => boolean);
	canDrop?: (data: any) => boolean;

	// Event handlers
	onDragStart?: (dragInfo: ActiveDragInfo) => void;
	onDragEnter?: (dragInfo: ActiveDragInfo) => void;
	onDragOver?: (
		dragInfo: ActiveDragInfo & { clientX: number; clientY: number; overlap: number },
	) => void;
	onDragLeave?: (dragInfo: ActiveDragInfo) => void;
	onDrop?: (dropInfo: {
		originalElement: HTMLElement | SVGElement;
		ghostElement: HTMLElement | SVGElement | null;
		dropZone: HTMLElement | SVGElement;
		data: any;
		clientX: number;
		clientY: number;
		overlap: number;
	}) => void;
	onInvalidDrop?: (dragInfo: ActiveDragInfo) => void;
}

// Types
interface CreateDropZoneOptions {
	// Collision detection
	tolerance?: 'pointer' | 'intersect' | 'touch';

	// Filtering what can be dropped
	accept?: string | string[] | ((data: any) => boolean);
	canDrop?: (data: any) => boolean;

	// Ghost configuration
	useGhost?: boolean;
	handlePositioning?: boolean; // Whether neodrag should handle positioning

	// Event handlers
	onDragEnter?: (data: DragEventData) => void;
	onDragOver?: (data: DragOverEventData) => void;
	onDragLeave?: (data: DragEventData) => void;
	onDrop?: (data: DropEventData) => void;
	onInvalidDrop?: (data: InvalidDropEventData) => void;

	// Visual feedback
	dragOverClass?: string;
	canDropClass?: string;
	invalidDropClass?: string;
}

interface DragPluginOptions {
	data?: any;
	type?: string;

	// Ghost configuration
	createGhost?: (
		element: HTMLElement | SVGElement,
		event: PointerEvent,
	) => HTMLElement | SVGElement;
	ghostOffset?: { x: number; y: number };

	// Element styling during drag
	onDragStart?: (element: HTMLElement | SVGElement) => void;
	onDragEnd?: (element: HTMLElement | SVGElement) => void;

	// Drop result callbacks
	onValidDrop?: (result: DropResult) => void;
	onInvalidDrop?: (result: InvalidDropResult) => void;
}

interface DragEventData {
	originalElement: HTMLElement | SVGElement;
	ghostElement: HTMLElement | SVGElement | null;
	data: any;
	type?: string;
}

interface DragOverEventData extends DragEventData {
	clientX: number;
	clientY: number;
	overlap: number;
}

interface DropEventData extends DragEventData {
	dropZone: HTMLElement | SVGElement;
	clientX: number;
	clientY: number;
	overlap: number;
	targetIndex?: number; // For sortable lists
}

interface InvalidDropEventData extends DragEventData {
	reason: string;
	attemptedDropZone?: HTMLElement;
}

interface InvalidDropResult {
	accepted: false;
	reason: string;
	data: any;
}

// Main createDropZone function
export function createDropZone(options: CreateDropZoneOptions = {}) {
	// Create the manager with enhanced options
	const manager = new DropZoneManager({
		tolerance: options.tolerance || 'pointer',
		accept: options.accept || (() => true),
		canDrop: options.canDrop || (() => true),

		onDragStart: (dragInfo) => {
			options.onDragEnter?.({
				originalElement: dragInfo.original_element,
				ghostElement: dragInfo.ghost_element,
				data: dragInfo.data,
				type: dragInfo.type,
			});
		},

		onDragEnter: (dragInfo) => {
			options.onDragEnter?.({
				originalElement: dragInfo.original_element,
				ghostElement: dragInfo.ghost_element,
				data: dragInfo.data,
				type: dragInfo.type,
			});
		},

		onDragOver: (dragInfo) => {
			options.onDragOver?.({
				originalElement: dragInfo.original_element,
				ghostElement: dragInfo.ghost_element,
				data: dragInfo.data,
				type: dragInfo.type,
				clientX: dragInfo.clientX,
				clientY: dragInfo.clientY,
				overlap: dragInfo.overlap,
			});
		},

		onDragLeave: (dragInfo) => {
			options.onDragLeave?.({
				originalElement: dragInfo.original_element,
				ghostElement: dragInfo.ghost_element,
				data: dragInfo.data,
				type: dragInfo.type,
			});
		},

		onDrop: (dropInfo) => {
			// Calculate target index for sortable lists
			const targetIndex = calculate_insertion_index(dropInfo.dropZone, dropInfo.clientY);

			options.onDrop?.({
				originalElement: dropInfo.originalElement,
				ghostElement: dropInfo.ghostElement,
				dropZone: dropInfo.dropZone,
				data: dropInfo.data,
				clientX: dropInfo.clientX,
				clientY: dropInfo.clientY,
				overlap: dropInfo.overlap,
				targetIndex,
			});
		},

		onInvalidDrop: (dragInfo) => {
			options.onInvalidDrop?.({
				originalElement: dragInfo.original_element,
				ghostElement: dragInfo.ghost_element,
				data: dragInfo.data,
				type: dragInfo.type,
				reason: 'validation-failed',
			});
		},
	});

	// Create the drag plugin
	const dragPlugin = unstable_definePlugin((dragOptions: DragPluginOptions = {}) => ({
		name: 'neodrag:drop-participant',
		priority: 50, // Run after positioning but before transforms

		setup(ctx) {
			return {
				original_element: ctx.rootNode,
				ghost_element: null as HTMLElement | SVGElement | null,
				is_ghosting: options.useGhost || !!dragOptions.createGhost,
				should_handle_positioning: options.handlePositioning !== false,
				drag_data: dragOptions.data,
				drag_type: dragOptions.type,
				ghost_offset: dragOptions.ghostOffset || { x: 0, y: 0 },
			};
		},

		start(ctx, state, event) {
			// Create ghost if configured
			if (state.is_ghosting) {
				const ghost = dragOptions.createGhost
					? dragOptions.createGhost(state.original_element, event)
					: create_default_ghost(state.original_element);

				// Position ghost at cursor with offset
				position_ghost_at_cursor(ghost, event, ctx.cachedRootNodeRect, state.ghost_offset);

				// Add to DOM
				document.body.appendChild(ghost);
				state.ghost_element = ghost;

				// Override default positioning if using ghost
				if (!state.should_handle_positioning) {
					ctx.propose(null, null);
				}
			}

			// Apply drag start styling
			dragOptions.onDragStart?.(state.original_element);

			// Register with drop zone manager
			manager.start_drag({
				original_element: state.original_element,
				ghost_element: state.ghost_element,
				data: state.drag_data,
				type: state.drag_type,
			});
		},

		drag(ctx, state, event) {
			// Update ghost position
			if (state.ghost_element) {
				position_ghost_at_cursor(
					state.ghost_element,
					event,
					ctx.cachedRootNodeRect,
					state.ghost_offset,
				);

				// Don't move original if using ghost
				if (!state.should_handle_positioning) {
					ctx.propose(null, null);
				}
			}

			// Update drop zone manager
			manager.update_drag_position(event.clientX, event.clientY);
		},

		end(_ctx, state, event) {
			// Attempt drop
			const dropResult = manager.end_drag(event.clientX, event.clientY);

			// Handle drop result
			if (dropResult.accepted) {
				const result: DropResult = {
					accepted: true,
					dropZone: dropResult.dropZone,
					data: state.drag_data,
				};

				dragOptions.onValidDrop?.(result);
			} else {
				const result: InvalidDropResult = {
					accepted: false,
					reason: dropResult.reason || 'unknown',
					data: state.drag_data,
				};

				dragOptions.onInvalidDrop?.(result);
			}

			// Cleanup ghost
			if (state.ghost_element) {
				document.body.removeChild(state.ghost_element);
				state.ghost_element = null;
			}

			// Restore original element
			dragOptions.onDragEnd?.(state.original_element);
		},

		cleanup(_ctx, state) {
			// Emergency cleanup if drag is cancelled
			if (state.ghost_element && state.ghost_element.parentNode) {
				state.ghost_element.parentNode.removeChild(state.ghost_element);
			}
		},
	}));

	// Create the droppable attachment
	const droppable = (element: HTMLElement) => {
		// Add visual classes
		const base_classes = ['neodrag-drop-zone'];
		if (options.dragOverClass) base_classes.push(options.dragOverClass);
		if (options.canDropClass) base_classes.push(options.canDropClass);
		if (options.invalidDropClass) base_classes.push(options.invalidDropClass);

		element.classList.add(...base_classes);

		// Register with manager
		const drop_zone_id = manager.register_drop_zone(element, {
			tolerance: options.tolerance,
			accept: options.accept,
			canDrop: options.canDrop,
		});

		// Return cleanup function
		return {
			destroy: () => {
				manager.unregister_drop_zone(drop_zone_id);
				element.classList.remove(...base_classes);
			},
		};
	};

	return [dragPlugin, droppable] as const;
}

// Helper functions
function create_default_ghost(element: HTMLElement | SVGElement): HTMLElement | SVGElement {
	const ghost = element.cloneNode(true) as HTMLElement;

	// Default ghost styling
	ghost.style.position = 'fixed';
	ghost.style.pointerEvents = 'none';
	ghost.style.zIndex = '9999';
	ghost.style.opacity = '0.8';
	ghost.style.transform = 'rotate(3deg) scale(0.95)';
	ghost.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
	ghost.style.transition = 'none';

	// Remove any IDs to avoid duplicates
	remove_ids(ghost);

	return ghost;
}

function position_ghost_at_cursor(
	ghost: HTMLElement | SVGElement,
	event: PointerEvent,
	original_rect: DOMRect,
	offset: { x: number; y: number },
): void {
	const x = event.clientX - original_rect.width / 2 + offset.x;
	const y = event.clientY - original_rect.height / 2 + offset.y;

	ghost.style.left = x + 'px';
	ghost.style.top = y + 'px';
}

function remove_ids(element: HTMLElement): void {
	if (element.id) element.id = '';

	const children = element.querySelectorAll('[id]');
	children.forEach((child) => {
		(child as HTMLElement).id = '';
	});
}

function calculate_insertion_index(dropZone: HTMLElement | SVGElement, client_y: number): number {
	const children = Array.from(dropZone.children) as (HTMLElement | SVGElement)[];

	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		const rect = child.getBoundingClientRect();
		const middle = rect.top + rect.height / 2;

		if (client_y < middle) {
			return i;
		}
	}

	return children.length;
}

// Export types for consumers
export type {
	CreateDropZoneOptions,
	DragPluginOptions,
	DropEventData,
	DragEventData,
	DropResult,
	InvalidDropResult,
};
