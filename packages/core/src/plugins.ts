import {
	get_node_style,
	ReadonlyToShallowMutable,
	set_node_dataset,
	set_node_key_style,
} from './utils.ts';

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
	effect: (fn: () => void) => void;
	propose: (x: number | null, y: number | null) => void;
	cancel: () => void;
	preventStart: () => void;
}

export interface Plugin<State = any> {
	name: string;
	priority?: number;
	liveUpdate?: boolean;
	cancelable?: boolean;
	setup?: (ctx: PluginContext) => State;
	shouldDrag?: (ctx: PluginContext, state: State, event: PointerEvent) => boolean;
	dragStart?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	drag?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	dragEnd?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	cleanup?: (ctx: PluginContext, state: State) => void;
	args?: any;
}

interface BasePluginStructure {
	name: string;
	priority?: number;
	liveUpdate?: boolean;
	cancelable?: boolean;
}

interface PluginStructure<ArgsTuple extends any[], State> extends BasePluginStructure {
	setup?: (args: ArgsTuple, ctx: PluginContext) => State;
	shouldDrag?: (args: ArgsTuple, ctx: PluginContext, state: State, event: PointerEvent) => boolean;
	dragStart?: (args: ArgsTuple, ctx: PluginContext, state: State, event: PointerEvent) => void;
	drag?: (args: ArgsTuple, ctx: PluginContext, state: State, event: PointerEvent) => void;
	dragEnd?: (args: ArgsTuple, ctx: PluginContext, state: State, event: PointerEvent) => void;
	cleanup?: (args: ArgsTuple, ctx: PluginContext, state: State) => void;
}

export function unstable_definePlugin<ArgsTuple extends any[], State = void>(
	structure: PluginStructure<ArgsTuple, State>,
	defaultArgs?: ArgsTuple,
) {
	const base_plugin = {
		name: structure.name,
		priority: structure.priority,
		liveUpdate: structure.liveUpdate,
		cancelable: structure.cancelable,
	} as Plugin;

	if (structure.setup) {
		base_plugin.setup = function (this: Plugin<State> & { args: ArgsTuple }, ctx: PluginContext) {
			return structure.setup?.(this.args, ctx);
		};
	}

	if (structure.shouldDrag) {
		base_plugin.shouldDrag = function (
			this: Plugin<State> & { args: ArgsTuple },
			ctx: PluginContext,
			state: State,
			event: PointerEvent,
		) {
			return structure.shouldDrag?.(this.args, ctx, state, event) ?? true;
		};
	}

	if (structure.dragStart) {
		base_plugin.dragStart = function (
			this: Plugin<State> & { args: ArgsTuple },
			ctx: PluginContext,
			state: State,
			event: PointerEvent,
		) {
			structure.dragStart?.(this.args, ctx, state, event);
		};
	}

	if (structure.drag) {
		base_plugin.drag = function (
			this: Plugin<State> & { args: ArgsTuple },
			ctx: PluginContext,
			state: State,
			event: PointerEvent,
		) {
			structure.drag?.(this.args, ctx, state, event);
		};
	}

	if (structure.dragEnd) {
		base_plugin.dragEnd = function (
			this: Plugin<State> & { args: ArgsTuple },
			ctx: PluginContext,
			state: State,
			event: PointerEvent,
		) {
			structure.dragEnd?.(this.args, ctx, state, event);
		};
	}

	if (structure.cleanup) {
		base_plugin.cleanup = function (
			this: Plugin<State> & { args: ArgsTuple },
			ctx: PluginContext,
			state: State,
		) {
			structure.cleanup?.(this.args, ctx, state);
		};
	}

	let last_args: ArgsTuple;
	let memoized_plugin: Plugin<State> & { args: ArgsTuple };

	return (...args: ArgsTuple): Plugin<State> & { args: ArgsTuple } => {
		const final_args = args.length ? args : defaultArgs ?? ([] as unknown as ArgsTuple);

		if (memoized_plugin && last_args === final_args) {
			return memoized_plugin;
		}

		last_args = final_args;
		// ATTENTION: YOu may want to avoid using spread and just mutate the memoized_plugin
		// Past Puru has already done it, creates weird issues.
		memoized_plugin = { ...base_plugin, args: final_args };
		return memoized_plugin;
	};
}

export const ignoreMultitouch = unstable_definePlugin(
	{
		name: 'neodrag:ignoreMultitouch',

		setup() {
			return {
				active_pointers: new Set<number>(),
			};
		},

		dragStart(args, ctx, state, event) {
			ctx.effect(() => {
				state.active_pointers.add(event.pointerId);

				if (args && state.active_pointers.size > 1) {
					event.preventDefault();
				}
			});
		},

		drag(args, ctx, state) {
			if (args && state.active_pointers.size > 1) {
				ctx.cancel();
			}
		},

		dragEnd(_args, _ctx, state, event) {
			state.active_pointers.delete(event.pointerId);
		},
	},
	[true] as [value?: boolean],
);

export const stateMarker = unstable_definePlugin({
	name: 'neodrag:stateMarker',
	cancelable: false,

	setup(_args, ctx) {
		set_node_dataset(ctx.rootNode, 'neodrag', '');
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', '0');

		return {
			count: 0,
		};
	},

	dragStart(_args, ctx) {
		ctx.effect(() => {
			set_node_dataset(ctx.rootNode, 'neodrag-state', 'dragging');
		});
	},

	dragEnd(_args, ctx, state) {
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', ++state.count);
	},
});

// Degree of Freedom X and Y
export const axis = unstable_definePlugin<[value?: 'x' | 'y']>({
	name: 'neodrag:axis',

	drag([value], ctx) {
		// Let dragging go on if axis is undefined
		if (!value) return;

		ctx.propose(value === 'x' ? ctx.proposed.x : null, value === 'y' ? ctx.proposed.y : null);
	},
});

export const applyUserSelectHack = unstable_definePlugin(
	{
		name: 'neodrag:applyUserSelectHack',
		cancelable: false,

		setup() {
			return {
				body_user_select_val: '',
			};
		},

		dragStart([value], ctx, state) {
			ctx.effect(() => {
				if (value) {
					state.body_user_select_val = get_node_style(document.body, 'user-select');
					set_node_key_style(document.body, 'user-select', 'none');
				}
			});
		},

		dragEnd([value], _, state) {
			if (value) {
				set_node_key_style(document.body, 'user-select', state.body_user_select_val);
			}
		},
	},
	[true] as [value?: boolean],
);

function snap_to_grid(
	[x_snap, y_snap]: [number, number],
	pending_x: number | null,
	pending_y: number | null,
) {
	const calc = (val: number, snap: number) => (snap === 0 ? 0 : Math.ceil(val / snap) * snap);

	const x = pending_x ? calc(pending_x, x_snap) : pending_x;
	const y = pending_y ? calc(pending_y, y_snap) : pending_y;

	return [x, y] as const;
}
export const grid = unstable_definePlugin<[x: number, y: number]>({
	name: 'neodrag:grid',

	drag([x, y], ctx) {
		ctx.propose(...snap_to_grid([x, y], ctx.proposed.x!, ctx.proposed.y!));
	},
});

export const disabled = unstable_definePlugin({
	name: 'neodrag:disabled',
	shouldDrag() {
		return false;
	},
});

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

export const transform = unstable_definePlugin<
	[func?: (args: { offsetX: number; offsetY: number; rootNode: HTMLElement | SVGElement }) => void],
	{ is_svg: boolean }
>({
	name: 'neodrag:transform',
	priority: -1000,
	cancelable: false,
	liveUpdate: true,

	setup([func], ctx) {
		// Special handling for root SVG elements
		if (ctx.rootNode instanceof SVGSVGElement) {
			throw new Error(
				'Dragging the root SVG element directly is not recommended. ' +
					'Instead, either:\n' +
					'1. Wrap your SVG in a div and make the div draggable\n' +
					'2. Use viewBox manipulation if you want to pan the SVG canvas\n' +
					'3. Or if you really need to transform the SVG element, use CSS transforms',
			);
		}

		const is_svg = ctx.rootNode instanceof SVGElement;

		if (is_svg) {
			// For SVG elements, get initial transform
			const element = ctx.rootNode as SVGGraphicsElement;
			const current_transform = get_current_transform(element);
			ctx.offset.x = current_transform.x;
			ctx.offset.y = current_transform.y;
		}

		// Apply initial transform if needed
		if (ctx.offset.x !== 0 || ctx.offset.y !== 0) {
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
				ctx.rootNode.style.translate = `${ctx.offset.x}px ${ctx.offset.y}px`;
			}
		}

		return { is_svg: is_svg };
	},

	drag([func], ctx, state) {
		ctx.effect(() => {
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
				ctx.rootNode.style.translate = `${ctx.offset.x}px ${ctx.offset.y}px`;
			}
		});
	},
});

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
		return (ctx) => BoundsFrom.element(document.documentElement, padding)(ctx);
	},

	parent(padding?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	}): BoundFromFunction {
		return (ctx) => BoundsFrom.element(ctx.root_node.parentNode as HTMLElement, padding)(ctx);
	},
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
export const bounds = unstable_definePlugin<
	[
		value: BoundFromFunction,
		shouldRecompute?: (ctx: { readonly hook: 'dragStart' | 'drag' | 'dragEnd' }) => boolean,
	],
	{
		bounds: [[number, number], [number, number]];
	}
>(
	{
		name: 'neodrag:bounds',

		setup([value], ctx) {
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
			};
		},

		dragStart([value, shouldRecompute], ctx, state) {
			if (shouldRecompute?.({ hook: 'dragStart' })) {
				state.bounds = value({ root_node: ctx.rootNode });
			}
		},

		drag([value, shouldRecompute], ctx, state) {
			if (!ctx.isDragging) return;
			if (shouldRecompute?.({ hook: 'drag' })) {
				state.bounds = value({ root_node: ctx.rootNode });
			}

			const bound_coords = state.bounds;
			const element_width = ctx.cachedRootNodeRect.width;
			const element_height = ctx.cachedRootNodeRect.height;

			// Convert absolute bounds to allowed movement bounds
			// Need to consider:
			// 1. Current accumulated offset (ctx.offset)
			// 2. Where user grabbed the element (pointer_offset)
			// 3. Element dimensions
			const allowed_movement_x1 = bound_coords[0][0] - ctx.offset.x; // max left
			const allowed_movement_y1 = bound_coords[0][1] - ctx.offset.y; // max top
			const allowed_movement_x2 = bound_coords[1][0] - element_width - ctx.offset.x; // max right
			const allowed_movement_y2 = bound_coords[1][1] - element_height - ctx.offset.y; // max bottom

			// Now clamp the proposed delta movement to our allowed movement bounds
			ctx.propose(
				ctx.proposed.x != null
					? clamp(ctx.proposed.x, allowed_movement_x1, allowed_movement_x2)
					: ctx.proposed.x,
				ctx.proposed.y != null
					? clamp(ctx.proposed.y, allowed_movement_y1, allowed_movement_y2)
					: ctx.proposed.y,
			);
		},

		dragEnd([value, shouldRecompute], context, state) {
			if (shouldRecompute?.({ hook: 'dragEnd' })) {
				state.bounds = value({ root_node: context.rootNode });
			}
		},
	},
	[
		() => [
			[0, 0],
			[0, 0],
		],
		(ctx) => ctx.hook === 'dragStart',
	],
);

export const threshold = unstable_definePlugin<
	[{ delay?: number; distance?: number }?],
	{
		start_time: number;
		_options: {
			delay: number;
			distance: number;
		};
	}
>(
	{
		name: 'neodrag:threshold',

		setup([options]) {
			const _options = { ...(options ?? {}) } as {
				delay: number;
				distance: number;
			};
			_options.delay ??= 0;
			_options.distance ??= 0;

			return {
				start_time: 0,
				_options,
			};
		},

		shouldDrag(_args, _ctx, state) {
			state.start_time = Date.now();
			return true;
		},

		drag(_args, ctx, state, event) {
			if (ctx.isDragging) return;

			// First check if we're still on the draggable element
			if (!ctx.currentlyDraggedNode.contains(event.target as Node)) {
				ctx.preventStart();
				return;
			}

			if (state._options.delay) {
				const elapsed = Date.now() - state.start_time;
				if (elapsed < state._options.delay) {
					ctx.preventStart();
					return;
				}
			}

			if (state._options.distance) {
				const delta_x = event.clientX - ctx.initial.x;
				const delta_y = event.clientY - ctx.initial.y;
				const distance = delta_x ** 2 + delta_y ** 2;
				if (distance < state._options.distance ** 2) {
					ctx.preventStart();
					return;
				}
			}
		},
	},
	[{}],
);

export type DragEventData = Readonly<{
	/** How much element moved from its original position horizontally */
	offset: Readonly<{ x: number; y: number }>;

	/** The node on which the draggable is applied */
	rootNode: HTMLElement | SVGElement;

	/** The element being dragged */
	currentNode: HTMLElement | SVGElement;
}>;

export const events = unstable_definePlugin<
	[
		events: {
			onDragStart?: (data: DragEventData) => void;
			onDrag?: (data: DragEventData) => void;
			onDragEnd?: (data: DragEventData) => void;
		},
	],
	ReadonlyToShallowMutable<DragEventData>
>(
	{
		name: 'neodrag:events',
		cancelable: false,

		setup(_args, ctx) {
			return {
				offset: ctx.offset,
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
			} as DragEventData;
		},

		dragStart([options], ctx, state) {
			ctx.effect(() => {
				state.offset = ctx.offset;
				state.currentNode = ctx.currentlyDraggedNode;
				options.onDragStart?.(state);
			});
		},

		drag([options], ctx, state) {
			ctx.effect(() => {
				state.offset = ctx.offset;
				state.currentNode = ctx.currentlyDraggedNode;

				options.onDrag?.(state);
			});
		},

		dragEnd([options], ctx, state) {
			ctx.effect(() => {
				state.offset = ctx.offset;
				state.currentNode = ctx.currentlyDraggedNode;

				options.onDragEnd?.(state);
			});
		},
	},
	[{}],
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
		(elements: NodeListOf<Element> | Element[]) =>
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
			elements.forEach((el) => {
				const rect = el.getBoundingClientRect();

				data.push({
					element: el,
					top: rect.top - root_rect.top,
					right: rect.right - root_rect.left,
					bottom: rect.bottom - root_rect.top,
					left: rect.left - root_rect.left,
					area: rect.width * rect.height,
				});
			});

			return data;
		},
};

const is_point_in_zone = (x: number, y: number, zone: ControlZone, root_rect: DOMRect) => {
	const relative_x = x - root_rect.left;
	const relative_y = y - root_rect.top;

	return (
		relative_x >= zone.left &&
		relative_x <= zone.right &&
		relative_y >= zone.top &&
		relative_y <= zone.bottom
	);
};

export const controls = unstable_definePlugin<
	[
		options: {
			allow?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			block?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			priority?: 'allow' | 'block';
		},
	],
	{
		allow_zones: ControlZone[];
		block_zones: ControlZone[];
	}
>({
	name: 'neodrag:controls',

	setup([options], ctx) {
		return {
			allow_zones: (options.allow?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area),
			block_zones: options.block?.(ctx.rootNode) ?? [],
		};
	},

	shouldDrag([options], ctx, state, event) {
		const { clientX, clientY } = event;
		const root_rect = ctx.rootNode.getBoundingClientRect();
		const priority = options.priority ?? 'block';

		if (state.allow_zones.length > 0) {
			const active_zone = state.allow_zones.find((zone) =>
				is_point_in_zone(clientX, clientY, zone, root_rect),
			);

			if (!active_zone) return false;

			const in_block_zone = state.block_zones.some((zone) =>
				is_point_in_zone(clientX, clientY, zone, root_rect),
			);

			// If in both, priority decides
			if (in_block_zone) {
				if (priority === 'block') return false;
			}

			ctx.currentlyDraggedNode = active_zone.element as HTMLElement;
			return true;
		}

		return !state.block_zones.some((zone) => is_point_in_zone(clientX, clientY, zone, root_rect));
	},
});

export const position = unstable_definePlugin(
	{
		name: 'neodrag:position',
		priority: 1000,
		liveUpdate: true,

		setup([options], ctx) {
			if (options.default) {
				ctx.offset.x = options.default.x ?? ctx.offset.x;
				ctx.offset.y = options.default.y ?? ctx.offset.y;
				ctx.initial.x = options.default.x ?? ctx.initial.x;
				ctx.initial.y = options.default.y ?? ctx.initial.y;
			}

			if (options.current) {
				ctx.offset.x = options.current.x ?? ctx.offset.x;
				ctx.offset.y = options.current.y ?? ctx.offset.y;
			}
		},

		drag([options], ctx) {
			// Only intervene if position has changed externally
			if (
				ctx.isDragging &&
				options.current &&
				(options.current.x !== ctx.offset.x || options.current.y !== ctx.offset.y)
			) {
				ctx.propose(options.current.x - ctx.offset.x, options.current.y - ctx.offset.y);
				ctx.cancel();
			}
		},
	},
	[{}] as [
		options: {
			current?: { x: number; y: number };
			default?: { x: number; y: number };
		},
	],
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
	{
		name: 'neodrag:touch-action',
		cancelable: false,
		liveUpdate: true,

		setup([mode], ctx) {
			const original_touch_action = get_node_style(ctx.rootNode, 'touch-action');
			set_node_key_style(ctx.rootNode, 'touch-action', mode!);

			return { original_touch_action };
		},

		dragEnd(_args, ctx, state) {
			// Restore original touch-action
			set_node_key_style(ctx.rootNode, 'touch-action', state.original_touch_action || 'auto');
		},
	},
	['manipulation'] as [mode?: TouchActionMode],
);

// Scroll-lock plugin that prevents scrolling while dragging
export const scrollLock = unstable_definePlugin(
	{
		name: 'neodrag:scrollLock',

		setup([options]) {
			const defaults = {
				lockAxis: 'both',
				container: window,
				allowScrollbar: false,
			};

			const config = { ...defaults, ...options };

			return {
				config,
				originalStyles: new Map<
					HTMLElement,
					{
						userSelect: string;
						touchAction: string;
						overflow: string;
					}
				>(),
				containerRect: null as DOMRect | null,
				lastContainerCheck: 0,
			};
		},

		dragStart(_args, ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			// Reset cache
			state.containerRect = null;
			state.lastContainerCheck = 0;

			ctx.effect(() => {
				// Store original styles
				if (container instanceof HTMLElement) {
					state.originalStyles.set(container, {
						userSelect: get_node_style(container, 'user-select'),
						touchAction: get_node_style(container, 'touch-action'),
						overflow: get_node_style(container, 'overflow'),
					});

					// Apply scroll locking styles
					set_node_key_style(container, 'user-select', 'none');

					if (!state.config.allowScrollbar) {
						set_node_key_style(container, 'overflow', 'hidden');
					}

					if (state.config.lockAxis === 'x' || state.config.lockAxis === 'both') {
						set_node_key_style(container, 'touch-action', 'pan-y');
					} else if (state.config.lockAxis === 'y') {
						set_node_key_style(container, 'touch-action', 'pan-x');
					}
				} else {
					// For window, we need to lock the body
					const body = document.body;
					state.originalStyles.set(body, {
						userSelect: get_node_style(body, 'user-select'),
						touchAction: get_node_style(body, 'touch-action'),
						overflow: get_node_style(body, 'overflow'),
					});

					set_node_key_style(body, 'user-select', 'none');

					if (!state.config.allowScrollbar) {
						set_node_key_style(body, 'overflow', 'hidden');
					}

					if (state.config.lockAxis === 'x' || state.config.lockAxis === 'both') {
						set_node_key_style(body, 'touch-action', 'pan-y');
					} else if (state.config.lockAxis === 'y') {
						set_node_key_style(body, 'touch-action', 'pan-x');
					}
				}
			});
		},

		dragEnd(_args, ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			ctx.effect(() => {
				const target = container instanceof HTMLElement ? container : document.body;
				const originalStyles = state.originalStyles.get(target);

				if (originalStyles) {
					set_node_key_style(target, 'user-select', originalStyles.userSelect);
					set_node_key_style(target, 'touch-action', originalStyles.touchAction);
					set_node_key_style(target, 'overflow', originalStyles.overflow);
				}

				state.originalStyles.delete(target);
			});

			// Clear cache
			state.containerRect = null;
			state.lastContainerCheck = 0;
		},

		cleanup(_args, _ctx, state) {
			// Restore any remaining original styles
			for (const [element, styles] of state.originalStyles) {
				set_node_key_style(element, 'user-select', styles.userSelect);
				set_node_key_style(element, 'touch-action', styles.touchAction);
				set_node_key_style(element, 'overflow', styles.overflow);
			}
			state.originalStyles.clear();
		},
	},
	[{}] as [
		options: {
			lockAxis?: 'x' | 'y' | 'both'; // Which axes to lock scrolling on
			container?: HTMLElement | (() => HTMLElement); // Custom container to lock
			allowScrollbar?: boolean; // Whether to allow scrollbar interaction
		},
	],
);
