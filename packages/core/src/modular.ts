export type DragEventData = {
	/** How much element moved from its original position horizontally */
	offsetX: number;

	/** How much element moved from its original position vertically */
	offsetY: number;

	/** The node on which the draggable is applied */
	rootNode: HTMLElement;

	/** The element being dragged */
	currentNode: HTMLElement;
};

export type BaseDragOptions = {
	plugins?: Plugin<any>[];

	/**
	 * Custom transform function. If provided, this function will be used to apply the DOM transformations to the root node to move it.
	 *
	 * @default undefined
	 */
	transform?: ({
		offsetX,
		offsetY,
		rootNode,
	}: {
		offsetX: number;
		offsetY: number;
		rootNode: HTMLElement;
	}) => undefined | void;

	/**
	 * Disables dragging altogether.
	 *
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Threshold for dragging to start. If the user moves the mouse/finger less than this distance, the dragging won't start.
	 *
	 * @default { delay: 0, distance: 3 }
	 */
	threshold?: {
		/**
		 * Threshold in milliseconds for a pointer movement to be considered a drag
		 *
		 * @default 0
		 */
		delay?: number;

		/**
		 * Threshold in pixels for movement to be considered a drag
		 *
		 * @default 3
		 */
		distance?: number;
	};

	/**
	 * Fires when dragging start
	 */
	onDragStart?: (data: DragEventData) => void;

	/**
	 * Fires when dragging is going on
	 */
	onDrag?: (data: DragEventData) => void;

	/**
	 * Fires when dragging ends
	 */
	onDragEnd?: (data: DragEventData) => void;
};

type PluginContext<PrivateStates = any> = {
	readonly delta: { x: number; y: number };

	// Current position (mutable). Only of this drag cycle
	readonly proposed: { x: number | null; y: number | null };

	// Drag status
	readonly isDragging: boolean;

	readonly isInteracting: boolean;

	readonly rootNode: HTMLElement;

	/**
	 * Here for performance reasons. Must be calculated only during dragStart by the core instance, not by any plugin within.
	 */
	cachedRootNodeRect: DOMRect;

	// This will be overriden by controls plugin for eg
	currentlyDraggedNode: HTMLElement;

	// Private state for the plugin
	_: Record<symbol, PrivateStates>;

	// any side-effects within plugins(DOM manipulation etc) must go here. THis is run only after making sure
	// no plugin returned false. Other doesn't run
	effect: (fn: () => void) => void;

	/**
	 * Propose a new position for the draggable. This will be applied to the DOM only after all plugins have run. Highest
	 * priority plugin's proposed value will be used.
	 */
	propose: (coords: { x: number | null; y: number | null }) => void;

	/**
	 * Cancels the drag operation. This applies to all the hooks, any hook cancenling will stop the drag operation.
	 */
	cancel: () => void;
};

type Plugin<PrivateState = any> = {
	// Identifier for the plugin
	name: string;

	/**
	 * Priority decides the order in which the plugins will run. Higher the number, earlier it runs. If priority of two or more plugins are sam
	 * then they run in the order specified in the plugins array
	 */
	priority?: number;

	// Called when plugin is initialized
	setup?: (context: PluginContext<PrivateState>) => void;

	shouldDrag?: (context: PluginContext<PrivateState>) => boolean;

	// Start of drag - return false to prevent drag
	dragStart?: (state: PluginContext<PrivateState>, event: PointerEvent) => void;

	// During drag - return state modifications
	drag?: (context: PluginContext<PrivateState>, event: PointerEvent) => void;

	// End of drag
	dragEnd?: (context: PluginContext<PrivateState>, event: PointerEvent) => void;

	// Cleanup when draggable is destroyed
	cleanup?: () => void;
};

export function draggable(node: HTMLElement, options: BaseDragOptions): void {
	let {
		disabled = false,
		onDrag,
		onDragEnd,
		onDragStart,
		plugins: user_plugins = [],
		threshold = { delay: 0, distance: 3 },
		transform,
	} = options;

	const default_plugins: Plugin[] = [ignoreMultitouch(), classes(), axis(), applyUserSelectHack()];

	let is_interacting = false;
	let is_dragging = false;

	let start_time = 0;
	let meets_time_threshold = false;
	let meets_distance_threshold = false;

	let x_offset = 0,
		y_offset = 0;

	let initial_x = 0,
		initial_y = 0;

	const proposals: { x: number | null; y: number | null } = { x: 0, y: 0 };
	let current_drag_hook_cancelled = false;
	let delta: { x: number; y: number } = { x: 0, y: 0 };

	let cached_root_node_rect = node.getBoundingClientRect();
	let currently_dragged_element = node;

	const effects_to_run = new Set<() => void>();

	const ctx: PluginContext<any> = {
		get proposed() {
			return { x: proposals.x, y: proposals.y };
		},
		get delta() {
			return { x: delta.x, y: delta.y };
		},
		get isDragging() {
			return is_dragging;
		},
		get isInteracting() {
			return is_interacting;
		},
		get rootNode() {
			return node;
		},
		get cachedRootNodeRect() {
			return cached_root_node_rect;
		},
		set cachedRootNodeRect(val) {
			cached_root_node_rect = val;
		},
		get currentlyDraggedNode() {
			return currently_dragged_element;
		},
		set currentlyDraggedNode(val) {
			currently_dragged_element = val;
		},
		_: {},
		effect: (func) => {
			effects_to_run.add(func);
		},
		propose: (proposed) => {
			proposals.x = proposed.x;
			proposals.y = proposed.y;
		},
		cancel() {
			current_drag_hook_cancelled = true;
		},
	};

	const ordered_plugins: Plugin<any>[] = default_plugins
		.concat(user_plugins)
		.toSorted((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

	for (const plugin of default_plugins.concat(user_plugins)) {
		// Initialize private state
		plugin.setup?.(ctx);
	}

	// Run own setup
	// On mobile, touch can become extremely janky without it
	set_style(node, 'touch-action', 'none');

	function apply_transform(transfom_x: number, transform_y: number) {
		if (transform) {
			return transform({ offsetX: transfom_x, offsetY: transform_y, rootNode: node });
		}

		set_style(node, 'translate', `${transfom_x}px ${transform_y}px`);
	}

	function update_state(updates: Partial<PluginContext>) {
		object_assign(ctx, updates);
	}

	function flush_effects() {
		for (const effect of effects_to_run) {
			effect();
		}
		effects_to_run.clear();
	}

	function clear_effects() {
		effects_to_run.clear();
	}

	function run_plugins(hook: 'dragStart' | 'drag' | 'dragEnd' | 'shouldDrag', event: PointerEvent) {
		let should_run = true;

		for (const plugin of ordered_plugins) {
			const handler = plugin[hook];
			if (!handler) continue;

			const result = handler(ctx, event);

			if (result === false) {
				should_run = false;
				break;
			}

			// Check if it was cancelled
			if (current_drag_hook_cancelled) {
				should_run = false;

				// Reset it back to what false
				current_drag_hook_cancelled = false;
				break;
			}
		}

		// TODO: This creates memory again and again in the loop. Hoist these to top-level variables
		return should_run;
	}

	function calculate_inverse_scale() {
		// Calculate the current scale of the node
		let inverse_scale = node.offsetWidth / ctx.cachedRootNodeRect.width;
		if (isNaN(inverse_scale)) inverse_scale = 1;
		return inverse_scale;
	}

	function reset_state() {
		is_dragging = false;
		meets_time_threshold = false;
		meets_distance_threshold = false;
		clear_effects();
	}

	function get_event_data(transform_x: number, transform_y: number) {
		return {
			offsetX: transform_x,
			offsetY: transform_y,
			rootNode: node,
			currentNode: node,
		};
	}

	function call_event(
		eventName: 'neodrag_start' | 'neodrag' | 'neodrag_end',
		fn: typeof onDrag,
		transform_x: number,
		transform_y: number,
	) {
		const data = get_event_data(transform_x, transform_y);
		node.dispatchEvent(new CustomEvent(eventName, { detail: data }));
		fn?.(data);
	}

	function fire_svelte_drag_start_event(transform_x: number, transform_y: number) {
		call_event('neodrag_start', onDragStart, transform_x, transform_y);
	}

	function fire_svelte_drag_end_event(transform_x: number, transform_y: number) {
		call_event('neodrag_end', onDragEnd, transform_x, transform_y);
	}

	function fire_svelte_drag_event(transform_x: number, transform_y: number) {
		call_event('neodrag', onDrag, transform_x, transform_y);
	}

	function try_start_drag(e: PointerEvent) {
		// We now meet all the threshold conditions
		if (
			is_interacting &&
			!is_dragging &&
			meets_distance_threshold &&
			meets_time_threshold &&
			currently_dragged_element
		) {
			delta = { x: 0, y: 0 };

			const should_start_drag = run_plugins('dragStart', e);

			if (!should_start_drag) return clear_effects();

			// Everything worked well. Flush the effects
			flush_effects();

			is_dragging = true;

			fire_svelte_drag_start_event(initial_x, initial_y);

			// if (applyUserSelectHack) {
			// 	// Apply user-select: none on body to prevent misbehavior
			// 	body_original_user_select_val = body_style.userSelect;
			// 	body_style.userSelect = 'none';
			// }
		}
	}

	const listen = window.addEventListener;
	const controller = new AbortController();
	const event_options = { signal: controller.signal, capture: false };

	// Contrary to what you might believe, this doesn't actually start dragging. This sets up the premise for drag
	// Actual dragging is begun by the `try_start_drag` function
	listen(
		'pointerdown',
		(e: PointerEvent) => {
			if (disabled) return;
			if (e.button === 2) return;

			// Run the plugins
			const should_drag = run_plugins('shouldDrag', e);

			// Some plugin blocked dragStart, dont drag at all
			// Also, should_drag doesn't take any effect callbacks, so no need to flush to clear
			if (should_drag === false) return;

			if (!ctx.currentlyDraggedNode.contains(e.target as Node)) return;

			is_interacting = true;
			start_time = Date.now();

			// TODO: Investigate whether this can be turned into a plugin or not
			if (!threshold.delay) {
				meets_time_threshold = true;
			}

			// We will run this by default in the drag_start plugin. But not in any other, the user will have to
			// run it in their own plugin
			ctx.cachedRootNodeRect = node.getBoundingClientRect();

			const inverse_scale = calculate_inverse_scale();

			// Some plugin like axis might not allow dragging in one direction
			if (proposals.x != null) initial_x = e.clientX - x_offset / inverse_scale;
			if (proposals.y != null) initial_y = e.clientY - y_offset / inverse_scale;

			// This should be in the axis plugin, included by default
			// state.initial.x = e.clientX - state.x / inverse_scale;
			// state.initial.y = e.clientY - state.y / inverse_scale;
		},
		event_options,
	);

	listen(
		'pointermove',
		(e: PointerEvent) => {
			if (!is_interacting) return;

			if (!is_dragging) {
				// Time threshold
				if (!meets_time_threshold) {
					const elapsed = Date.now() - start_time;
					if (elapsed >= threshold.delay!) {
						meets_time_threshold = true;
						try_start_drag(e);
					}
				}

				// Distance threshold
				if (!meets_distance_threshold) {
					const delta_x = e.clientX - initial_x;
					const delta_y = e.clientY - initial_y;
					const distance = delta_x ** 2 + delta_y ** 2;

					// We were doing Math.sqrt here but that is slower than just comparing the square of the distance
					if (distance >= threshold.distance! ** 2) {
						meets_distance_threshold = true;
						try_start_drag(e);
					}
				}

				if (!is_dragging) return;
			}

			//if (recomputeBounds.drag) computed_bounds = compute_bound_rect(bounds, node);
			e.preventDefault();

			delta = {
				x: e.clientX - initial_x - x_offset,
				y: e.clientY - initial_y - y_offset,
			};

			// Core proposes delta
			proposals.x = delta.x;
			proposals.y = delta.y;

			// Run the plugins
			const run_result = run_plugins('drag', e);

			if (run_result) flush_effects();
			else return clear_effects();

			// Whatever offset we have had till now since the draggable() was mounted, add proposals to it, as long as they're not null
			const final = {
				x: x_offset + (proposals.x ?? 0),
				y: y_offset + (proposals.y ?? 0),
			};

			fire_svelte_drag_event(final.x, final.y);

			console.log(x_offset);
			// Apply the transform
			apply_transform(final.x, final.y);

			x_offset = final.x;
			y_offset = final.y;
		},
		event_options,
	);

	listen(
		'pointerup',
		(e: PointerEvent) => {
			if (!is_interacting) return;

			if (is_dragging) {
				// Listen for click handler and cancel it
				listen('click', (e) => e.stopPropagation(), {
					once: true,
					signal: controller.signal,
					capture: true,
				});
			}

			// Call the dragEnd hooks
			run_plugins('dragEnd', e);

			if (proposals.x) initial_x = x_offset;
			if (proposals.y) initial_y = y_offset;

			proposals.x = 0;
			proposals.y = 0;

			is_interacting = false;

			reset_state();
		},
		event_options,
	);
}

function object_assign<T extends {}>(target: T, new_val: Partial<T>) {
	Object.assign(target, new_val);
	return target;
}
const set_style = (el: HTMLElement, style: string, value: string) =>
	el.style.setProperty(style, value);

const IGNORE_MULTITOUCH_SYMBOL = Symbol('ignore_multitouch');
function ignoreMultitouch(value = true): Plugin<{ active_pointers: Set<number> }> {
	return {
		name: 'neodrag:ignoreMultitouch',

		setup(ctx) {
			console.log(ctx);
			ctx._[IGNORE_MULTITOUCH_SYMBOL] = { active_pointers: new Set() };
		},

		dragStart(ctx, event) {
			ctx.effect(() => {
				ctx._[IGNORE_MULTITOUCH_SYMBOL].active_pointers.add(event.pointerId);

				if (value && ctx._[IGNORE_MULTITOUCH_SYMBOL].active_pointers.size > 1) {
					event.preventDefault();
				}
			});
		},

		drag(ctx) {
			if (value && ctx._[IGNORE_MULTITOUCH_SYMBOL].active_pointers.size > 1) {
				ctx.cancel();
			}
		},

		dragEnd(ctx, event) {
			ctx._[IGNORE_MULTITOUCH_SYMBOL].active_pointers.delete(event.pointerId);
		},
	};
}

const enum DEFAULT_CLASS {
	DEFAULT = 'neodrag',
	DRAGGING = 'neodrag-dragging',
	DRAGGED = 'neodrag-dragged',
}
function classes(
	classes: { default: string; dragging: string; dragged: string } = {
		default: DEFAULT_CLASS.DEFAULT,
		dragging: DEFAULT_CLASS.DRAGGING,
		dragged: DEFAULT_CLASS.DRAGGED,
	},
): Plugin {
	return {
		name: 'neodrag:classes',

		setup(ctx) {
			classes.default ??= DEFAULT_CLASS.DEFAULT;
			classes.dragging ??= DEFAULT_CLASS.DRAGGING;
			classes.dragged ??= DEFAULT_CLASS.DRAGGED;

			if (classes.default) ctx.rootNode.classList.add(classes.default);
		},

		dragStart(ctx) {
			ctx.effect(() => {
				ctx.rootNode.classList.add(classes.dragging);
			});
		},

		dragEnd(ctx) {
			ctx.rootNode.classList.remove(classes.dragging);
			ctx.rootNode.classList.add(classes.dragged);
		},
	};
}

const AXIS_SYMBOL = Symbol('axis');
// Degree of Freedom X and Y
function axis(value: 'both' | 'x' | 'y' | 'none' = 'both'): Plugin<{ dfx: boolean; dfy: boolean }> {
	return {
		name: 'neodrag:axis',

		setup(ctx) {
			ctx._[AXIS_SYMBOL] = {
				dfx: value === 'both' || value === 'x',
				dfy: value === 'both' || value === 'y',
			};
		},

		drag(ctx) {
			ctx.propose({
				x: ctx._[AXIS_SYMBOL].dfx ? ctx.proposed.x : null,
				y: ctx._[AXIS_SYMBOL].dfy ? ctx.proposed.y : null,
			});
		},
	};
}

const APPLY_USER_SELECT_HACK_SYMBOL = Symbol('apply_user_select_hack');
function applyUserSelectHack(value: boolean = true): Plugin<{ body_user_select_val: string }> {
	return {
		name: 'neodrag:applyUserSelectHack',

		setup(ctx) {
			ctx._[APPLY_USER_SELECT_HACK_SYMBOL] = { body_user_select_val: '' };
		},

		dragStart(ctx) {
			ctx.effect(() => {
				if (value) {
					ctx._[APPLY_USER_SELECT_HACK_SYMBOL].body_user_select_val =
						document.body.style.userSelect;
					document.body.style.userSelect = 'none';
				}
			});
		},

		dragEnd(ctx) {
			if (value) {
				document.body.style.userSelect = ctx._[APPLY_USER_SELECT_HACK_SYMBOL].body_user_select_val;
			}
		},
	};
}
