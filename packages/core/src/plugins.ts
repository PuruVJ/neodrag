import { get_node_style, is_null, set_node_dataset, set_node_key_style } from './utils.ts';
import { BoundsFrom, validateBounds, type BoundFromFunction } from './lib/bounds-from.ts';
import { clamp } from './lib/math.ts';
import { defineDragPlugin, defineDropPlugin, type DragCtx, type DragPlugin, type DropCtx } from './types.ts';

const THRESHOLD_KEY = Symbol('neodrag.threshold');
const STATE_MARKER_KEY = Symbol('neodrag.stateMarker');
const IGNORE_MULTITOUCH_KEY = Symbol('neodrag.ignoreMultitouch');
const APPLY_USER_SELECT_KEY = Symbol('neodrag.applyUserSelectHack');
const TOUCH_ACTION_KEY = Symbol('neodrag.touchAction');
const AXIS_KEY = Symbol('neodrag.axis');
const GRID_KEY = Symbol('neodrag.grid');
const BOUNDS_KEY = Symbol('neodrag.bounds');
const POSITION_KEY = Symbol('neodrag.position');
const DISABLED_KEY = Symbol('neodrag.disabled');
const CONTROLS_KEY = Symbol('neodrag.controls');
const EVENTS_KEY = Symbol('neodrag.events');
const DRAG_DATA_KEY = Symbol('neodrag.dragData');
const ACCEPTS_KEY = Symbol('neodrag.accepts');
const HIGHLIGHT_KEY = Symbol('neodrag.highlight');
const ON_DROP_KEY = Symbol('neodrag.onDrop');
const SCROLL_LOCK_KEY = Symbol('neodrag.scrollLock');
const GHOST_KEY = Symbol('neodrag.ghost');

type MultitouchState = { active_pointers: Set<number> };
type StateMarkerState = { count: number };
type UserSelectState = { body_user_select_val: string };

export const ignoreMultitouch: DragPlugin<MultitouchState> = {
	key: IGNORE_MULTITOUCH_KEY,

	init() {
		return { active_pointers: new Set<number>() };
	},

	start(ctx, state, event) {
		ctx.effect(() => {
			state.active_pointers.add(event.pointerId);
			if (state.active_pointers.size > 1) event.preventDefault();
		});
	},

	drag(ctx, state) {
		if (state.active_pointers.size > 1) ctx.cancel();
	},

	end(_ctx, state, event) {
		state.active_pointers.delete(event.pointerId);
	},
};

export const stateMarker: DragPlugin<StateMarkerState> = {
	key: STATE_MARKER_KEY,
	phase: 'post',
	skipOnCancel: true,

	init(ctx) {
		set_node_dataset(ctx.rootNode, 'neodrag', '');
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', '0');
		return { count: 0 };
	},

	start(ctx) {
		ctx.effect(() => set_node_dataset(ctx.rootNode, 'neodrag-state', 'dragging'));
	},

	end(ctx, state) {
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', String(++state.count));
	},
};

export const applyUserSelectHack: DragPlugin<UserSelectState> = {
	key: APPLY_USER_SELECT_KEY,
	phase: 'post',
	skipOnCancel: true,

	init() {
		return { body_user_select_val: '' };
	},

	start(ctx, state) {
		ctx.effect(() => {
			state.body_user_select_val =
				get_node_style(document.body, 'user-select') ??
				document.body.style.webkitUserSelect ??
				'';
			set_node_key_style(document.body, 'user-select', 'none');
			document.body.style.webkitUserSelect = 'none';
		});
	},

	end(_ctx, state) {
		set_node_key_style(document.body, 'user-select', state.body_user_select_val);
		document.body.style.webkitUserSelect = state.body_user_select_val;
	},
};

export const touchAction: DragPlugin = {
	key: TOUCH_ACTION_KEY,
	phase: 'pre',

	init(ctx) {
		ctx.effect(() => set_node_key_style(ctx.rootNode, 'touch-action', 'none'));
	},
};

export const axis = defineDragPlugin((value?: 'x' | 'y' | null) => ({
	key: AXIS_KEY,
	phase: 'resolve',

	drag(ctx) {
		if (!value) return;
		if (value === 'x') return { y: 0 };
		return { x: 0 };
	},
}));

const snap = (val: number, step: number) => (step === 0 ? 0 : Math.round(val / step) * step);

export const grid = defineDragPlugin(
	(values?: [x: number | null | undefined, y: number | null | undefined] | null) => ({
		key: GRID_KEY,
		phase: 'resolve',

		drag(ctx) {
			if (!values) return;
			const patch: { x?: number; y?: number } = {};
			if (values[0] != null && values[0] > 0) patch.x = snap(ctx.proposed.x, values[0]);
			if (values[1] != null && values[1] > 0) patch.y = snap(ctx.proposed.y, values[1]);
			if (patch.x !== undefined || patch.y !== undefined) return patch;
		},
	}),
);

export { BoundsFrom };

type BoundsHook = 'init' | 'start' | 'drag';

function recomputeBounds(
	value: BoundFromFunction,
	ctx: { rootNode: HTMLElement | SVGElement; cachedRootNodeRect: DOMRect },
) {
	const bounds = value({ rootNode: ctx.rootNode });
	validateBounds(bounds, ctx.cachedRootNodeRect.width, ctx.cachedRootNodeRect.height);
	return bounds;
}

export const bounds = defineDragPlugin(
	(
		value: BoundFromFunction = () => [
			[0, 0],
			[0, 0],
		],
		shouldRecompute: (ctx: { hook: BoundsHook }) => boolean = (ctx) => ctx.hook === 'start',
	) => ({
		key: BOUNDS_KEY,
		phase: 'resolve',

		init(ctx) {
			const boundsCoords = shouldRecompute({ hook: 'init' })
				? recomputeBounds(value, ctx)
				: ([
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]]);
			return {
				bounds: boundsCoords,
				initialX: ctx.cachedRootNodeRect.left - ctx.offset.x,
				initialY: ctx.cachedRootNodeRect.top - ctx.offset.y,
			};
		},

		start(ctx, state) {
			if (!shouldRecompute({ hook: 'start' })) return;
			state.bounds = recomputeBounds(value, ctx);
			state.initialX = ctx.cachedRootNodeRect.left - ctx.offset.x;
			state.initialY = ctx.cachedRootNodeRect.top - ctx.offset.y;
		},

		drag(ctx, state) {
			if (!ctx.isDragging) return;
			if (shouldRecompute({ hook: 'drag' })) {
				state.bounds = recomputeBounds(value, ctx);
			}

			const w = ctx.cachedRootNodeRect.width;
			const h = ctx.cachedRootNodeRect.height;
			const b = state.bounds;
			const minOx = b[0][0] - state.initialX;
			const minOy = b[0][1] - state.initialY;
			const maxOx = b[1][0] - w - state.initialX;
			const maxOy = b[1][1] - h - state.initialY;
			const px = ctx.offset.x + ctx.proposed.x;
			const py = ctx.offset.y + ctx.proposed.y;

			return {
				x: clamp(px, minOx, maxOx) - ctx.offset.x,
				y: clamp(py, minOy, maxOy) - ctx.offset.y,
			};
		},
	}),
);

export type PositionOptions = {
	current?: { x: number; y: number } | null;
	default?: { x: number; y: number } | null;
};

function applyPosition(
	ctx: {
		isInteracting: boolean;
		offset: { x: number; y: number };
		setForcedPosition: (x: number, y: number) => void;
	},
	opts: PositionOptions | null,
) {
	if (ctx.isInteracting) return;
	const x = opts?.current?.x ?? opts?.default?.x ?? ctx.offset.x;
	const y = opts?.current?.y ?? opts?.default?.y ?? ctx.offset.y;
	if (x !== ctx.offset.x || y !== ctx.offset.y) ctx.setForcedPosition(x, y);
}

export const position = defineDragPlugin((options: PositionOptions | null = null) => ({
	key: POSITION_KEY,
	phase: 'pre',

	init(ctx) {
		applyPosition(ctx, options);
	},

	update(ctx) {
		applyPosition(ctx, options);
	},
}));

export type DragEventData = Readonly<{
	offset: Readonly<{ x: number; y: number }>;
	rootNode: HTMLElement | SVGElement;
	visualNode: HTMLElement | SVGElement;
	event: PointerEvent;
}>;

function eventPayload(ctx: DragCtx, e: PointerEvent): DragEventData {
	return {
		offset: { x: ctx.offset.x, y: ctx.offset.y },
		rootNode: ctx.rootNode,
		visualNode: ctx.session.visual.node,
		event: e,
	};
}

export const events = defineDragPlugin(
	(handlers: {
		onDragStart?: (data: DragEventData) => void;
		onDrag?: (data: DragEventData) => void;
		onDragEnd?: (data: DragEventData) => void;
	} = {}) => ({
		key: EVENTS_KEY,
		phase: 'post',
		skipOnCancel: true,

		start(ctx, _s, e) {
			handlers.onDragStart?.(eventPayload(ctx, e));
		},

		drag(ctx, _s, e) {
			handlers.onDrag?.(eventPayload(ctx, e));
		},

		end(ctx, _s, e) {
			handlers.onDragEnd?.(eventPayload(ctx, e));
		},
	}),
);

export type DisabledInput = boolean | (() => boolean);

function readDisabled(input: DisabledInput): boolean {
	return typeof input === 'function' ? input() : input;
}

export const disabled = defineDragPlugin((isDisabled: DisabledInput = true) => ({
	key: DISABLED_KEY,
	phase: 'pre',

	start() {
		return !readDisabled(isDisabled);
	},
}));

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
		return (root) => ControlFrom.elements(root.querySelectorAll(selector))(root);
	},

	elements(elements: NodeListOf<Element> | (Element | null | undefined)[]): (root: Element) => ControlZone[] {
		return (root) => {
			const root_rect = root.getBoundingClientRect();
			const data: ControlZone[] = [];
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
		};
	},
};

function is_nested(inner: ControlZone, outer: ControlZone) {
	return (
		inner.area < outer.area &&
		inner.left >= outer.left &&
		inner.right <= outer.right &&
		inner.top >= outer.top &&
		inner.bottom <= outer.bottom
	);
}

function is_point_in_zone(x: number, y: number, zone: ControlZone, root_rect: DOMRect) {
	const rx = x - root_rect.left;
	const ry = y - root_rect.top;
	return rx >= zone.left && rx <= zone.right && ry >= zone.top && ry <= zone.bottom;
}

function find_containing_zones(event: PointerEvent, zones: ControlZone[], root_rect: DOMRect) {
	const out: ControlZone[] = [];
	for (let i = 0; i < zones.length; i++) {
		const z = zones[i]!;
		if (is_point_in_zone(event.clientX, event.clientY, z, root_rect)) out.push(z);
	}
	out.sort((a, b) => a.area - b.area);
	return out;
}

function resolve_zone(
	allow: ControlZone[],
	block: ControlZone[],
	allow_defined: boolean,
	priority: 'allow' | 'block' = 'allow',
): { zone: ControlZone | null; is_allow: boolean } {
	if (allow_defined && allow.length === 0) return { zone: null, is_allow: false };
	if (allow.length === 0 && block.length === 0) return { zone: null, is_allow: allow_defined ? false : true };

	let i = 0;
	let j = 0;
	while (i < allow.length || j < block.length) {
		const a = allow[i];
		const b = block[j];
		if (!a) return { zone: b!, is_allow: false };
		if (!b) return { zone: a, is_allow: true };
		if (is_nested(a, b)) return { zone: a, is_allow: true };
		if (is_nested(b, a)) return { zone: b, is_allow: false };
		if (a.area === b.area && priority === 'block') {
			j++;
			return { zone: b, is_allow: false };
		}
		if (a.area <= b.area) {
			i++;
			return { zone: a, is_allow: true };
		}
		j++;
		return { zone: b, is_allow: false };
	}
	return { zone: null, is_allow: allow_defined ? false : true };
}

export const controls = defineDragPlugin(
	(
		options?: {
			allow?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			block?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
			priority?: 'allow' | 'block';
		} | null,
		shouldRecompute: (ctx: { hook: 'init' | 'start' | 'drag' }) => boolean = (ctx) =>
			ctx.hook === 'init',
	) => ({
		key: CONTROLS_KEY,
		phase: 'pre',

		init(ctx) {
			const compute = () => {
				const allow = (options?.allow?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area);
				const block = (options?.block?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area);
				return { allow, block };
			};
			const { allow, block } = compute();
			return {
				allow,
				block,
				priority: options?.priority ?? 'allow',
				compute,
			};
		},

		start(ctx, state, event) {
			if (shouldRecompute({ hook: 'start' })) {
				const next = state.compute();
				state.allow = next.allow;
				state.block = next.block;
			}

			const allow_zones = find_containing_zones(event, state.allow, ctx.cachedRootNodeRect);
			const block_zones = find_containing_zones(event, state.block, ctx.cachedRootNodeRect);
			const { zone, is_allow } = resolve_zone(
				allow_zones,
				block_zones,
				state.allow.length > 0,
				state.priority,
			);

			if (!zone) return is_allow;

			return is_allow;
		},
	}),
);

export const dragData = defineDragPlugin(<T,>(getData: () => T) => ({
	key: DRAG_DATA_KEY,
	phase: 'pre',

	start(ctx) {
		ctx.session.data = getData();
	},
}));

export const threshold = defineDragPlugin((options?: { delay?: number; distance?: number } | null) => {
	const enabled = !is_null(options);
	const resolved = enabled
		? {
				delay: options?.delay ?? 0,
				distance: options?.distance ?? 3,
			}
		: null;

	if (resolved) {
		if (resolved.delay < 0) throw new Error('delay must be >= 0');
		if (resolved.distance < 0) throw new Error('distance must be >= 0');
	}

	return {
		key: THRESHOLD_KEY,
		phase: 'pre' as const,

		init() {
			return {
				enabled,
				started: false,
				start_time: 0,
				start_x: 0,
				start_y: 0,
				options: resolved,
			};
		},

		start(ctx, state, event) {
			if (!state.enabled) return true;
			if (ctx.isDragging) return true;

			if (!ctx.rootNode.contains(event.target as Node)) {
				ctx.cancel();
				return false;
			}

			if (!state.started) {
				state.started = true;
				state.start_time = Date.now();
				state.start_x = event.clientX;
				state.start_y = event.clientY;
			}

			if (state.options?.delay) {
				if (Date.now() - state.start_time < state.options.delay) return false;
			}

			if (state.options?.distance) {
				const dx = event.clientX - state.start_x;
				const dy = event.clientY - state.start_y;
				if (dx * dx + dy * dy <= state.options.distance ** 2) return false;
			}

			return true;
		},

		end(_ctx, state) {
			state.started = false;
		},
	};
});

export const scrollLock = defineDragPlugin(
	(
		options: {
			lockAxis?: 'x' | 'y' | 'both';
			container?: HTMLElement | (() => HTMLElement);
			allowScrollbar?: boolean;
		} | null = {},
	) => ({
		key: SCROLL_LOCK_KEY,
		phase: 'pre',

		init() {
			return {
				config: {
					lockAxis: options?.lockAxis ?? 'both',
					container: options?.container ?? document.documentElement,
					allowScrollbar: options?.allowScrollbar ?? false,
				},
				originalStyles: new Map<
					HTMLElement,
					{ userSelect: string; touchAction: string; overflow: string }
				>(),
			};
		},

		start(ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			ctx.effect(() => {
				const target = container instanceof HTMLElement ? container : document.body;
				state.originalStyles.set(target, {
					userSelect: get_node_style(target, 'user-select'),
					touchAction: get_node_style(target, 'touch-action'),
					overflow: get_node_style(target, 'overflow'),
				});

				set_node_key_style(target, 'user-select', 'none');

				if (!state.config.allowScrollbar) {
					set_node_key_style(target, 'overflow', 'hidden');
				}

				if (state.config.lockAxis === 'x' || state.config.lockAxis === 'both') {
					set_node_key_style(target, 'touch-action', 'pan-y');
				} else if (state.config.lockAxis === 'y') {
					set_node_key_style(target, 'touch-action', 'pan-x');
				}
			});
		},

		end(ctx, state) {
			const container =
				typeof state.config.container === 'function'
					? state.config.container()
					: state.config.container;

			ctx.effect(() => {
				const target = container instanceof HTMLElement ? container : document.body;
				const original = state.originalStyles.get(target);
				if (original) {
					set_node_key_style(target, 'user-select', original.userSelect);
					set_node_key_style(target, 'touch-action', original.touchAction);
					set_node_key_style(target, 'overflow', original.overflow);
				}
				state.originalStyles.delete(target);
			});
		},

		destroy(_ctx, state) {
			for (const [element, styles] of state.originalStyles) {
				set_node_key_style(element, 'user-select', styles.userSelect);
				set_node_key_style(element, 'touch-action', styles.touchAction);
				set_node_key_style(element, 'overflow', styles.overflow);
			}
			state.originalStyles.clear();
		},
	}),
);

export const ghost = defineDragPlugin((options: { opacity?: number } = {}) => ({
	key: GHOST_KEY,
	phase: 'pre',

	init() {
		return {
			ghostElement: null as HTMLElement | SVGElement | null,
		};
	},

	start(ctx, state) {
		const clone = ctx.rootNode.cloneNode(true) as HTMLElement | SVGElement;
		const rect = ctx.rootNode.getBoundingClientRect();
		state.ghostElement = clone;

		clone.classList.add('neodrag-ghost');
		(clone as HTMLElement).style.opacity = String(options.opacity ?? 0.5);
		clone.style.position = 'fixed';
		clone.style.pointerEvents = 'none';
		clone.style.zIndex = '9999';
		clone.style.margin = '0';
		clone.style.top = `${rect.top}px`;
		clone.style.left = `${rect.left}px`;
		clone.style.width = `${rect.width}px`;
		clone.style.height = `${rect.height}px`;
		clone.style.transform = '';
		(clone as HTMLElement).style.translate = '';

		document.body.appendChild(clone);
		ctx.setVisual(clone);
	},

	end(_ctx, state) {
		state.ghostElement?.remove();
		state.ghostElement = null;
	},

	destroy(ctx, state) {
		state.ghostElement?.remove();
		state.ghostElement = null;
		ctx.setVisual(ctx.rootNode);
	},
}));

export const accepts = defineDropPlugin(
	<T,>(predicate: (data: T) => boolean) => ({
		key: ACCEPTS_KEY,
		phase: 'pre',

		enter(ctx) {
			const data = ctx.session.data as T;
			if (!predicate(data)) return false;
		},
	}),
);

export const highlight = defineDropPlugin(
	(options: { overClass?: string } = {}) => ({
		key: HIGHLIGHT_KEY,
		phase: 'post',

		init() {
			return { overClass: options.overClass ?? 'neodrag-drop-over' };
		},

		enter(ctx, state) {
			ctx.effect(() => ctx.rootNode.classList.add(state.overClass));
		},

		leave(ctx, state) {
			ctx.rootNode.classList.remove(state.overClass);
		},

		destroy(ctx, state) {
			ctx.rootNode.classList.remove(state.overClass);
		},
	}),
);

export const onDrop = defineDropPlugin(<T,>(handler: (data: T, ctx: DropCtx) => void) => ({
	key: ON_DROP_KEY,
	phase: 'post',

	drop(ctx) {
		handler(ctx.session.data as T, ctx);
	},
}));

export {
	hasReactiveSlots,
	resolvePluginList,
	PluginListResolver,
} from './resolve-plugins.ts';
export {
	defineDragPlugin,
	defineDropPlugin,
	pluginKeyLabel,
	type DragPlugin as Plugin,
	type DragPluginList,
	type DropPluginList,
	type PluginSlot,
	type DragCtx as PluginContext,
} from './types.ts';
