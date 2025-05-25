import { get_node_style, is_null, set_node_dataset, set_node_key_style } from './utils.ts';

export interface PluginContext {
	delta: { x: number; y: number };
	proposed: { x: number | null; y: number | null };
	offset: { x: number; y: number };
	initial: { x: number; y: number };
	isDragging: boolean;
	isInteracting: boolean;
	rootNode: HTMLElement | SVGElement;
	lastEvent: PointerEvent | null;
	cachedRootNodeRect: DOMRect;
	currentlyDraggedNode: HTMLElement | SVGElement;
	effect: {
		immediate: (fn: () => void) => void;
		paint: (fn: () => void) => void;
	};
	propose: (x: number | null, y: number | null) => void;
	cancel: () => void;
	preventStart: () => void;
	setForcedPosition: (x: number, y: number) => void;
}

export interface Plugin<State = any> {
	name: string;
	priority?: number;
	liveUpdate?: boolean;
	cancelable?: boolean;
	setup?: (ctx: PluginContext) => State;
	shouldStart?: (ctx: PluginContext, state: State, event: PointerEvent) => boolean;
	start?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	drag?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	end?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	cleanup?: (ctx: PluginContext, state: State) => void;
}

// Type definitions for the new plugin system
export type PluginResolver = () => (Plugin | Compartment<any>)[];
export type PluginInput = Plugin[] | PluginResolver;

export class Compartment<T extends Plugin = Plugin> {
	#current: T | undefined;
	#subscribers: Set<(plugin: T | undefined) => void>;
	#updating: boolean = false;

	constructor(initial?: () => T) {
		this.#current = initial ? initial() : undefined;
		this.#subscribers = new Set();
	}

	get current(): T | undefined {
		return this.#current;
	}

	set current(plugin: T | undefined) {
		if (plugin === this.#current) return;

		// Prevent recursive updates
		if (this.#updating) return;

		this.#updating = true;
		this.#current = plugin;

		// Notify subscribers with the new plugin (which could be undefined)
		this.#subscribers.forEach((callback) => callback(plugin));

		this.#updating = false;
	}

	subscribe(callback: (plugin: T | undefined) => void) {
		this.#subscribers.add(callback);
		return () => this.#subscribers.delete(callback);
	}
}

export function resolve_plugins(
	items: (Plugin | Compartment)[],
	compartments: Map<Compartment, Plugin | undefined>,
): Plugin[] {
	return items
		.map((item) => {
			if (item instanceof Compartment) {
				const current = item.current;
				compartments.set(item, current);
				return current;
			}
			return item;
		})
		.filter((plugin): plugin is Plugin => plugin !== undefined); // Filter out undefined
}

export function unstable_definePlugin<State, Args extends unknown[]>(
	fn: (...args: Args) => Plugin<State>,
) {
	return fn;
}

export const ignoreMultitouch = unstable_definePlugin((value: boolean = true) => ({
	name: 'neodrag:ignoreMultitouch',

	setup() {
		return {
			active_pointers: new Set<number>(),
		};
	},

	start(ctx, state, event) {
		ctx.effect.paint(() => {
			state.active_pointers.add(event.pointerId);

			if (value && state.active_pointers.size > 1) {
				event.preventDefault();
			}
		});
	},

	drag(ctx, state) {
		if (value && state.active_pointers.size > 1) {
			ctx.cancel();
		}
	},

	end(_ctx, state, event) {
		state.active_pointers.delete(event.pointerId);
	},
}));

export const stateMarker = unstable_definePlugin(() => ({
	name: 'neodrag:stateMarker',
	cancelable: false,

	setup(ctx) {
		set_node_dataset(ctx.rootNode, 'neodrag', '');
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', '0');

		return {
			count: 0,
		};
	},

	start(ctx) {
		ctx.effect.paint(() => {
			set_node_dataset(ctx.rootNode, 'neodrag-state', 'dragging');
		});
	},

	end(ctx, state) {
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', ++state.count);
	},
}));

// Degree of Freedom X and Y
export const axis = unstable_definePlugin((value: 'x' | 'y' | undefined | null) => ({
	name: 'neodrag:axis',

	drag(ctx) {
		// Let dragging go on if axis is undefined
		if (!value) return;

		ctx.propose(value === 'x' ? ctx.proposed.x : null, value === 'y' ? ctx.proposed.y : null);
	},
}));

export const applyUserSelectHack = unstable_definePlugin(
	(value: boolean | undefined | null = true) => ({
		name: 'neodrag:applyUserSelectHack',
		cancelable: false,

		setup() {
			return {
				body_user_select_val: '',
			};
		},

		start(ctx, state) {
			ctx.effect.paint(() => {
				if (value) {
					state.body_user_select_val =
						get_node_style(document.body, 'user-select') ??
						// Safari sucks. It doesn't work with getPropertyValue or setProperty if it has prefix,
						// And safari never implemened unvendored user-select
						document.body.style.webkitUserSelect ??
						'';

					set_node_key_style(document.body, 'user-select', 'none');
					document.body.style.webkitUserSelect = 'none';
				}
			});
		},

		end(_ctx, state) {
			if (value) {
				set_node_key_style(document.body, 'user-select', state.body_user_select_val);
				document.body.style.webkitUserSelect = state.body_user_select_val;
			}
		},
	}),
);

const calc = (val: number, snap: number) => (snap === 0 ? 0 : Math.ceil(val / snap) * snap);

function snap_to_grid(
	snaps: [number | null | undefined, number | null | undefined] | undefined | null,
	pending_x: number | null,
	pending_y: number | null,
) {
	const x = pending_x && snaps?.[0] ? calc(pending_x, snaps?.[0]) : pending_x;
	const y = pending_y && snaps?.[1] ? calc(pending_y, snaps?.[1]) : pending_y;

	return [x, y] as const;
}

export const grid = unstable_definePlugin(
	(values: [x: number | null | undefined, y: number | null | undefined] | undefined | null) => ({
		name: 'neodrag:grid',

		drag(ctx) {
			ctx.propose(...snap_to_grid(values, ctx.proposed.x, ctx.proposed.y));
		},
	}),
);

export const disabled = unstable_definePlugin((value: boolean = true) => ({
	name: 'neodrag:disabled',
	shouldStart() {
		return value;
	},
}));

function get_current_transform(element: SVGGraphicsElement) {
	const transform = element.transform.baseVal;
	if (transform.numberOfItems === 0) {
		const svg = element.ownerSVGElement;
		if (!svg) return { x: 0, y: 0 };

		const matrix = svg.createSVGTransform().matrix;
		transform.insertItemBefore(svg.createSVGTransformFromMatrix(matrix), 0);
	}

	const matrix = transform.consolidate()?.matrix;
	return matrix ? { x: matrix.e, y: matrix.f } : { x: 0, y: 0 };
}

export const transform = unstable_definePlugin(
	(
		func?: (args: { offsetX: number; offsetY: number; rootNode: HTMLElement | SVGElement }) => void,
	) => ({
		name: 'neodrag:transform',
		priority: -1000,
		cancelable: false,
		liveUpdate: true,

		setup(ctx) {
			const is_svg = ctx.rootNode instanceof SVGElement;

			if (is_svg) {
				// For SVG elements, get initial transform
				const element = ctx.rootNode as SVGGraphicsElement;
				const current_transform = get_current_transform(element);
				ctx.offset.x = current_transform.x;
				ctx.offset.y = current_transform.y;
			}

			// Apply initial transform if needed

			if (func) {
				func({
					offsetX: ctx.offset.x,
					offsetY: ctx.offset.y,
					rootNode: ctx.rootNode,
				});
			} else if (is_svg) {
				const element = ctx.rootNode as SVGGraphicsElement;
				const svg = element.ownerSVGElement;
				if (!svg) throw new Error("Root Node's ownerSVGElement is null");

				const translation = svg.createSVGTransform();
				translation.setTranslate(ctx.offset.x, ctx.offset.y);

				const transform = element.transform.baseVal;

				transform.clear();
				transform.appendItem(translation);
			} else {
				ctx.rootNode.style.translate = `${ctx.offset.x}px ${ctx.offset.y}px 0.0001px`;
			}

			return { is_svg: is_svg };
		},

		drag(ctx, state) {
			ctx.effect.paint(() => {
				if (func) {
					return func({
						offsetX: ctx.offset.x,
						offsetY: ctx.offset.y,
						rootNode: ctx.rootNode,
					});
				}

				if (state?.is_svg) {
					const element = ctx.rootNode as SVGGraphicsElement;
					const svg = element.ownerSVGElement;
					if (!svg) return;

					const translation = svg.createSVGTransform();

					translation.setTranslate(ctx.offset.x, ctx.offset.y);

					const transform = element.transform.baseVal;
					transform.clear();
					transform.appendItem(translation);
					// debugger;
				} else {
					ctx.rootNode.style.translate = `${ctx.offset.x}px ${ctx.offset.y}px 0.0001px`;
				}
			});
		},
	}),
);

type BoundFromFunction = (data: {
	root_node: HTMLElement | SVGElement;
}) => [[x1: number, y1: number], [x2: number, y2: number]];

export const BoundsFrom = {
	element(
		element: HTMLElement,
		padding?: { top?: number; left?: number; right?: number; bottom?: number },
	): BoundFromFunction {
		return () => {
			const rect = element.getBoundingClientRect();

			if (rect.left === 0 && rect.right === 0 && rect.top === 0 && rect.bottom === 0) {
				throw new Error(
					'bounds element has no dimensions. This may happen due to display:contents',
				);
			}

			return [
				[rect.left + (padding?.left ?? 0), rect.top + (padding?.top ?? 0)],
				[rect.right - (padding?.right ?? 0), rect.bottom - (padding?.bottom ?? 0)],
			];
		};
	},

	selector(
		selector: string,
		padding?: {
			top?: number;
			left?: number;
			right?: number;
			bottom?: number;
		},
		root?: HTMLElement,
	): BoundFromFunction {
		return (ctx) => {
			const element = (root ?? document).querySelector<HTMLElement>(selector);
			if (!element)
				throw new Error(`bounds selector ${selector} did not match any elements in the DOM`);

			return BoundsFrom.element(element, padding)(ctx);
		};
	},

	viewport(padding?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	}): BoundFromFunction {
		return (_ctx) => {
			// The viewport bounds are always relative to the current visible area,
			// regardless of scroll position. The viewport always starts at (0,0)
			// and extends to the window's inner dimensions.
			const bounds = {
				top: 0 + (padding?.top ?? 0),
				left: 0 + (padding?.left ?? 0),
				right: window.innerWidth - (padding?.right ?? 0),
				bottom: window.innerHeight - (padding?.bottom ?? 0),
			};

			// Validate bounds
			if (bounds.right <= bounds.left || bounds.bottom <= bounds.top) {
				throw new Error(
					'Viewport bounds are invalid after applying padding. Check your padding values.',
				);
			}

			return [
				[bounds.left, bounds.top],
				[bounds.right, bounds.bottom],
			];
		};
	},

	parent(padding?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	}): BoundFromFunction {
		return (ctx) => {
			// console.log(
			// 	(ctx.root_node.parentNode as HTMLElement).getBoundingClientRect(),
			// 	BoundsFrom.element(ctx.root_node.parentNode as HTMLElement, padding)(ctx),
			// );
			return BoundsFrom.element(ctx.root_node.parentNode as HTMLElement, padding)(ctx);
		};
	},
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
export const bounds = unstable_definePlugin(
	(
		value: BoundFromFunction = () => [
			[0, 0],
			[0, 0],
		],
		shouldRecompute: (ctx: { readonly hook: 'dragStart' | 'drag' | 'dragEnd' }) => boolean = (
			ctx,
		) => ctx.hook === 'dragStart',
	) => ({
		name: 'neodrag:bounds',

		setup(ctx) {
			const bounds = value({ root_node: ctx.rootNode });
			const element_width = ctx.cachedRootNodeRect.width;
			const element_height = ctx.cachedRootNodeRect.height;

			if (
				bounds[1][0] - bounds[0][0] < element_width ||
				bounds[1][1] - bounds[0][1] < element_height
			) {
				throw new Error(
					'Bounds dimensions cannot be smaller than the draggable element dimensions',
				);
			}

			return {
				bounds,
				initialElementPosition: {
					x: ctx.cachedRootNodeRect.left - ctx.offset.x,
					y: ctx.cachedRootNodeRect.top - ctx.offset.y,
				},
			};
		},

		start(ctx, state) {
			if (shouldRecompute?.({ hook: 'dragStart' })) {
				state.bounds = value({ root_node: ctx.rootNode });

				// Update the initial position on drag start
				state.initialElementPosition = {
					x: ctx.cachedRootNodeRect.left - ctx.offset.x,
					y: ctx.cachedRootNodeRect.top - ctx.offset.y,
				};
			}
		},

		drag(ctx, state) {
			if (!ctx.isDragging) return;
			if (shouldRecompute?.({ hook: 'drag' })) {
				state.bounds = value({ root_node: ctx.rootNode });
			}

			const bound_coords = state.bounds;
			const element_width = ctx.cachedRootNodeRect.width;
			const element_height = ctx.cachedRootNodeRect.height;

			// These are the viewport-coordinate limits of where the element can move
			const min_viewport_x = bound_coords[0][0];
			const min_viewport_y = bound_coords[0][1];
			const max_viewport_x = bound_coords[1][0] - element_width;
			const max_viewport_y = bound_coords[1][1] - element_height;

			// Get the element's initial viewport position before any dragging started
			// Using our stored initialElementPosition
			const initial_viewport_position = state.initialElementPosition;

			// Calculate what the minimum and maximum offsets would be
			const min_offset_x = min_viewport_x - initial_viewport_position.x;
			const min_offset_y = min_viewport_y - initial_viewport_position.y;
			const max_offset_x = max_viewport_x - initial_viewport_position.x;
			const max_offset_y = max_viewport_y - initial_viewport_position.y;

			// Calculate what the offset would be after this drag
			const proposed_offset_x = ctx.offset.x + (ctx.proposed.x ?? 0);
			const proposed_offset_y = ctx.offset.y + (ctx.proposed.y ?? 0);

			// Clamp the offset
			const clamped_offset_x = clamp(proposed_offset_x, min_offset_x, max_offset_x);
			const clamped_offset_y = clamp(proposed_offset_y, min_offset_y, max_offset_y);

			// Calculate what delta is needed to achieve the clamped offset
			const required_delta_x = clamped_offset_x - ctx.offset.x;
			const required_delta_y = clamped_offset_y - ctx.offset.y;

			// Propose the adjusted delta
			ctx.propose(
				ctx.proposed.x !== null ? required_delta_x : null,
				ctx.proposed.y !== null ? required_delta_y : null,
			);
		},

		end(context, state) {
			if (shouldRecompute?.({ hook: 'dragEnd' })) {
				state.bounds = value({ root_node: context.rootNode });
			}
		},
	}),
);

export const threshold = unstable_definePlugin(
	(options?: { delay?: number; distance?: number } | null) => ({
		name: 'neodrag:threshold',

		setup() {
			// Behavior: If options is null, then threshold plugin does nothing
			// If options is undefined, then threshold plugin uses default options
			// If options is {}, then threshold plugin uses default options
			// If options is { delay: 10, distance: 5 }, then threshold plugin uses the provided options
			const enabled = !is_null(options);

			if (!enabled) return { enabled };

			const _options = { ...(options ?? {}) } as {
				delay: number;
				distance: number;
			};
			_options.delay ??= 0;
			_options.distance ??= 3;

			if (_options.delay < 0) throw new Error('delay must be >= 0');
			if (_options.distance < 0) throw new Error('distance must be >= 0');

			return {
				enabled,
				start_time: 0,
				start_position: { x: 0, y: 0 },
				options: _options,
			};
		},

		shouldStart(_ctx, state, event) {
			if (state.enabled) {
				state.start_time = Date.now();
				state.start_position.x = event.clientX;
				state.start_position.y = event.clientY;
			}

			return true;
		},

		drag(ctx, state, event) {
			if (!state.enabled) return;
			if (ctx.isDragging) return;

			// First check if we're still on the draggable element
			if (!ctx.currentlyDraggedNode.contains(event.target as Node)) {
				ctx.preventStart();
				return;
			}

			if (state.options.delay) {
				const elapsed = Date.now() - state.start_time;
				if (elapsed < state.options.delay) {
					ctx.preventStart();
					return;
				}
			}

			if (state.options.distance) {
				const delta_x = event.clientX - state.start_position.x;
				const delta_y = event.clientY - state.start_position.y;
				const distance = delta_x ** 2 + delta_y ** 2;
				if (distance <= state.options.distance ** 2) {
					ctx.preventStart();
					return;
				}
			}
		},
	}),
);

export type DragEventData = Readonly<{
	/** How much element moved from its original position horizontally */
	offset: Readonly<{ x: number; y: number }>;

	/** The node on which the draggable is applied */
	rootNode: HTMLElement | SVGElement;

	/** The element being dragged */
	currentNode: HTMLElement | SVGElement;

	/** The pointer event that triggered the drag */
	event: PointerEvent;
}>;

export const events = unstable_definePlugin(
	(
		events: {
			onDragStart?: (data: DragEventData) => void;
			onDrag?: (data: DragEventData) => void;
			onDragEnd?: (data: DragEventData) => void;
		} = {},
	) => ({
		name: 'neodrag:events',
		cancelable: false,
		liveUpdate: false,

		setup(ctx) {
			return {
				offset: ctx.offset,
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
				event: ctx.lastEvent as PointerEvent,
			};
		},

		start(ctx, state, event) {
			ctx.effect.immediate(() => {
				state.offset = ctx.offset;
				state.currentNode = ctx.currentlyDraggedNode;
				state.event = event;
				events.onDragStart?.(state);
			});
		},

		drag(ctx, state, event) {
			ctx.effect.immediate(() => {
				state.offset = ctx.offset;
				state.currentNode = ctx.currentlyDraggedNode;
				state.event = event;

				events.onDrag?.(state);
			});
		},

		end(ctx, state, event) {
			ctx.effect.immediate(() => {
				state.offset = ctx.offset;
				state.currentNode = ctx.currentlyDraggedNode;
				state.event = event;

				events.onDragEnd?.(state);
			});
		},
	}),
);

type ControlZone = {
	element: Element;
	top: number;
	right: number;
	bottom: number;
	left: number;
	area: number;
};

export const ControlFrom = {
	selector(selector: string): (root: Element) => ControlZone[] {
		return (root: Element) => ControlFrom.elements(root.querySelectorAll(selector))(root);
	},

	elements:
		(elements: NodeListOf<Element> | (Element | null | undefined)[]) =>
		(root: Element): ControlZone[] => {
			const root_rect = root.getBoundingClientRect();

			const data: {
				element: Element;
				top: number;
				right: number;
				bottom: number;
				left: number;
				area: number;
			}[] = [];

			for (const el of Array.from(elements)) {
				if (!el) continue;

				const rect = el.getBoundingClientRect();

				data.push({
					element: el,
					top: rect.top - root_rect.top,
					right: rect.right - root_rect.left,
					bottom: rect.bottom - root_rect.top,
					left: rect.left - root_rect.left,
					area: rect.width * rect.height,
				});
			}

			return data;
		},
};

// Helper to check if a zone is nested within another zone
function is_nested(inner: ControlZone, outer: ControlZone) {
	return (
		inner.area < outer.area &&
		inner.left >= outer.left &&
		inner.right <= outer.right &&
		inner.top >= outer.top &&
		inner.bottom <= outer.bottom
	);
}

// Helper function to find all zones containing a point, sorted by area (smallest first)
function find_containing_zones(ctx: PluginContext, event: PointerEvent, zones: ControlZone[]) {
	return zones
		.filter((zone) => is_point_in_zone(event.clientX, event.clientY, zone, ctx.cachedRootNodeRect))
		.sort((a, b) => a.area - b.area);
}

function is_point_in_zone(x: number, y: number, zone: ControlZone, root_rect: DOMRect) {
	const relative_x = x - root_rect.left;
	const relative_y = y - root_rect.top;

	return (
		relative_x >= zone.left &&
		relative_x <= zone.right &&
		relative_y >= zone.top &&
		relative_y <= zone.bottom
	);
}

export const controls = unstable_definePlugin(
	(
		options?: {
			allow?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			block?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			priority?: 'allow' | 'block';
		} | null,
	) => ({
		name: 'neodrag:controls',

		setup(ctx) {
			// Sort zones by area (smallest to largest) to handle nesting properly
			return {
				allow_zones: (options?.allow?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area),
				block_zones: (options?.block?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area),
				priority: options?.priority ?? 'allow',
			};
		},

		shouldStart(ctx, state, event) {
			// Find all containing zones for the click point
			const containing_allow_zones = find_containing_zones(ctx, event, state.allow_zones);
			const containing_block_zones = find_containing_zones(ctx, event, state.block_zones);

			// If there are any allow zones defined, only allow dragging within them
			if (state.allow_zones.length > 0 && containing_allow_zones.length === 0) {
				return false;
			}

			// If no zones contain the point and no allow zones are defined,
			// default behavior based on priority
			if (containing_allow_zones.length === 0 && containing_block_zones.length === 0) {
				return state.allow_zones.length === 0 && state.priority === 'allow';
			}

			// Find the most specific (smallest) zone that should determine the behavior
			let final_zone: ControlZone | null = null;
			let is_allow = false;

			// Interleave allow and block zones based on nesting
			let i = 0,
				j = 0;
			while (i < containing_allow_zones.length || j < containing_block_zones.length) {
				const allow_zone = containing_allow_zones[i];
				const block_zone = containing_block_zones[j];

				if (!allow_zone) {
					final_zone = block_zone;
					is_allow = false;
					break;
				}

				if (!block_zone) {
					final_zone = allow_zone;
					is_allow = true;
					break;
				}

				// Compare zones based on nesting
				if (is_nested(allow_zone, block_zone)) {
					final_zone = allow_zone;
					is_allow = true;
					break;
				}

				if (is_nested(block_zone, allow_zone)) {
					final_zone = block_zone;
					is_allow = false;
					break;
				}

				// If not nested, use the smaller area
				if (allow_zone.area <= block_zone.area) {
					final_zone = allow_zone;
					is_allow = true;
					i++;
				} else {
					final_zone = block_zone;
					is_allow = false;
					j++;
				}
			}

			// If we found a final determining zone
			if (final_zone) {
				if (is_allow) {
					ctx.currentlyDraggedNode = final_zone.element as HTMLElement;
					return true;
				}
				return false;
			}

			// Default to priority if no zones were found, but only if no allow zones are defined
			return state.allow_zones.length === 0 && state.priority === 'allow';
		},
	}),
);

export const position = unstable_definePlugin(
	(
		options: {
			current?: { x: number; y: number } | null;
			default?: { x: number; y: number } | null;
		} | null = null,
	) => ({
		name: 'neodrag:position',
		priority: 1000,
		liveUpdate: true,

		setup(ctx) {
			if (!ctx.isInteracting) {
				const x = options?.current?.x ?? options?.default?.x ?? ctx.offset.x;
				const y = options?.current?.y ?? options?.default?.y ?? ctx.offset.y;

				// ✅ Only set if position actually changed
				if (x !== ctx.offset.x || y !== ctx.offset.y) {
					ctx.setForcedPosition(x, y);
				}
			}
		},
	}),
);

type TouchActionMode =
	// Keyword values
	| 'auto'
	| 'none'
	| 'pan-x'
	| 'pan-left'
	| 'pan-right'
	| 'pan-y'
	| 'pan-up'
	| 'pan-down'
	| 'pinch-zoom'
	| 'manipulation'

	// Global values
	| 'inherit'
	| 'initial'
	| 'revert'
	| 'revert-layer'
	| 'unset';

export const touchAction = unstable_definePlugin(
	(mode: TouchActionMode | false | null = 'manipulation') => ({
		name: 'neodrag:touch-action',
		cancelable: false,
		liveUpdate: true,

		setup(ctx) {
			if (mode !== false && mode !== null) {
				set_node_key_style(ctx.rootNode, 'touch-action', mode ?? 'manipulation');
			}
		},
	}),
);

// Scroll-lock plugin that prevents scrolling while dragging
export const scrollLock = unstable_definePlugin(
	(
		options: {
			lockAxis?: 'x' | 'y' | 'both'; // Which axes to lock scrolling on
			container?: HTMLElement | (() => HTMLElement); // Custom container to lock
			allowScrollbar?: boolean; // Whether to allow scrollbar interaction
		} | null = {},
	) => ({
		name: 'neodrag:scrollLock',

		setup() {
			const defaults = {
				lock_axis: 'both',
				container: document.documentElement,
				allow_scrollbar: false,
			};

			const config = { ...defaults, ...options };

			return {
				config,
				original_styles: new Map<
					HTMLElement,
					{
						user_select: string;
						touch_action: string;
						overflow: string;
					}
				>(),
				container_rect: null as DOMRect | null,
				last_container_check: 0,
			};
		},

		start(ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			// Reset cache
			state.container_rect = null;
			state.last_container_check = 0;

			ctx.effect.paint(() => {
				// Store original styles
				if (container instanceof HTMLElement) {
					state.original_styles.set(container, {
						user_select: get_node_style(container, 'user-select'),
						touch_action: get_node_style(container, 'touch-action'),
						overflow: get_node_style(container, 'overflow'),
					});

					// Apply scroll locking styles
					set_node_key_style(container, 'user-select', 'none');

					if (!state.config.allow_scrollbar) {
						set_node_key_style(container, 'overflow', 'hidden');
					}

					if (state.config.lock_axis === 'x' || state.config.lock_axis === 'both') {
						set_node_key_style(container, 'touch-action', 'pan-y');
					} else if (state.config.lock_axis === 'y') {
						set_node_key_style(container, 'touch-action', 'pan-x');
					}
				} else {
					// For window, we need to lock the body
					const body = document.body;
					state.original_styles.set(body, {
						user_select: get_node_style(body, 'user-select'),
						touch_action: get_node_style(body, 'touch-action'),
						overflow: get_node_style(body, 'overflow'),
					});

					set_node_key_style(body, 'user-select', 'none');

					if (!state.config.allow_scrollbar) {
						set_node_key_style(body, 'overflow', 'hidden');
					}

					if (state.config.lock_axis === 'x' || state.config.lock_axis === 'both') {
						set_node_key_style(body, 'touch-action', 'pan-y');
					} else if (state.config.lock_axis === 'y') {
						set_node_key_style(body, 'touch-action', 'pan-x');
					}
				}
			});
		},

		end(ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			ctx.effect.paint(() => {
				const target = container instanceof HTMLElement ? container : document.body;
				const originalStyles = state.original_styles.get(target);

				if (originalStyles) {
					set_node_key_style(target, 'user-select', originalStyles.user_select);
					set_node_key_style(target, 'touch-action', originalStyles.touch_action);
					set_node_key_style(target, 'overflow', originalStyles.overflow);
				}

				state.original_styles.delete(target);
			});

			// Clear cache
			state.container_rect = null;
			state.last_container_check = 0;
		},

		cleanup(_ctx, state) {
			// Restore any remaining original styles
			for (const [element, styles] of state.original_styles) {
				set_node_key_style(element, 'user-select', styles.user_select);
				set_node_key_style(element, 'touch-action', styles.touch_action);
				set_node_key_style(element, 'overflow', styles.overflow);
			}
			state.original_styles.clear();
		},
	}),
);
