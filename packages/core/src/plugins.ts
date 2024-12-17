export interface PluginContext {
	delta: {
		x: number;
		y: number;
	};

	// Current position (mutable). Only of this drag cycle
	proposed: {
		x: number | null;
		y: number | null;
	};

	offset: {
		x: number;
		y: number;
	};

	initial: {
		x: number;
		y: number;
	};

	// Drag status
	readonly isDragging: boolean;

	readonly isInteracting: boolean;

	readonly rootNode: HTMLElement;

	readonly lastEvent: PointerEvent | null;

	/**
	 * Here for performance reasons. Must be calculated only during dragStart by the core instance, not by any plugin within.
	 */
	cachedRootNodeRect: DOMRect;

	// This will be overriden by controls plugin for eg
	currentlyDraggedNode: HTMLElement;

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

	preventStart: () => void;
}

export interface Plugin<PrivateState = any> {
	// Identifier for the plugin
	name: string;

	/**
	 * Priority decides the order in which the plugins will run. Higher the number, earlier it runs. If priority of two or more plugins are sam
	 * then they run in the order specified in the plugins array
	 */
	priority?: number;

	/**
	 * Whether calling context.cancel() should cancel this plugin as well
	 */
	cancelable?: boolean;

	/**
	 * Whether the plugin should be updated live. If false, the plugin will be updated only when the dragging stops
	 * and recreated
	 */
	liveUpdate?: boolean;

	// Called when plugin is initialized
	setup?: (context: PluginContext) => PrivateState | void;

	shouldDrag?: (context: PluginContext, state: PrivateState, event: PointerEvent) => boolean;

	// Start of drag - return false to prevent drag
	dragStart?: (context: PluginContext, state: PrivateState, event: PointerEvent) => void;

	// During drag - return state modifications
	drag?: (context: PluginContext, state: PrivateState, event: PointerEvent) => void;

	// End of drag
	dragEnd?: (context: PluginContext, state: PrivateState, event: PointerEvent) => void;

	// Cleanup when draggable is destroyed
	cleanup?: () => void;
}

/**
 * !This is an unstable API and may change until next major
 * @unstable
 */
export const unstable_definePlugin = <State, Arguments extends any[]>(
	plugin: (...args: Arguments) => Plugin<State>,
) => plugin;

export const ignoreMultitouch = unstable_definePlugin((value = true) => {
	return {
		name: 'neodrag:ignoreMultitouch',

		setup() {
			return {
				active_pointers: new Set<number>(),
			};
		},

		dragStart(ctx, state, event) {
			ctx.effect(() => {
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

		dragEnd(_, state, event) {
			state.active_pointers.delete(event.pointerId);
		},
	};
});

export const stateMarker = unstable_definePlugin(() => {
	return {
		name: 'neodrag:stateMarker',
		cancelable: false,

		setup(ctx) {
			ctx.rootNode.dataset.neodrag = '';
			ctx.rootNode.dataset.neodragState = 'idle';
			ctx.rootNode.dataset.neodragCount = '0';

			return {
				count: 0,
			};
		},

		dragStart(ctx) {
			ctx.effect(() => {
				ctx.rootNode.dataset.neodragState = 'dragging';
			});
		},

		dragEnd(ctx, state) {
			ctx.rootNode.dataset.neodragState = 'idle';
			ctx.rootNode.dataset.neodragCount = (++state.count).toString();
		},
	};
});

// Degree of Freedom X and Y
export const axis = unstable_definePlugin((value: 'both' | 'x' | 'y' = 'both') => {
	return {
		name: 'neodrag:axis',

		setup() {
			return {
				df: {
					x: value === 'both' || value === 'x',
					y: value === 'both' || value === 'y',
				},
			};
		},

		drag(ctx, state) {
			ctx.propose({
				x: state.df.x ? ctx.proposed.x : null,
				y: state.df.y ? ctx.proposed.y : null,
			});
		},
	};
});

export const applyUserSelectHack = unstable_definePlugin((value: boolean = true) => {
	return {
		name: 'neodrag:applyUserSelectHack',

		setup() {
			return {
				body_user_select_val: '',
			};
		},

		dragStart(ctx, state) {
			ctx.effect(() => {
				if (value) {
					state.body_user_select_val = document.body.style.userSelect;
					document.body.style.userSelect = 'none';
				}
			});
		},

		dragEnd(_, state) {
			if (value) {
				document.body.style.userSelect = state.body_user_select_val;
			}
		},
	};
});

function snap_to_grid(
	[x_snap, y_snap]: [number, number],
	pending_x: number | null,
	pending_y: number | null,
) {
	const calc = (val: number, snap: number) => (snap === 0 ? 0 : Math.ceil(val / snap) * snap);

	const x = pending_x ? calc(pending_x, x_snap) : pending_x;
	const y = pending_y ? calc(pending_y, y_snap) : pending_y;

	return { x, y };
}
export const grid = unstable_definePlugin((x: number, y: number) => {
	return {
		name: 'neodrag:grid',

		drag(ctx) {
			ctx.propose(snap_to_grid([x, y], ctx.proposed.x!, ctx.proposed.y!));
		},
	};
});

export const disabled = unstable_definePlugin(() => {
	return {
		name: 'neodrag:disabled',
		shouldDrag() {
			return false;
		},
	};
});

export const transform = unstable_definePlugin(
	(func?: (args: { offsetX: number; offsetY: number; rootNode: HTMLElement }) => void) => {
		return {
			name: 'neodrag:transform',
			cancelable: false,
			liveUpdate: true,

			setup(ctx) {
				// If initial offset is non-zero, apply it
				if (ctx.offset.x !== 0 || ctx.offset.y !== 0) {
					if (func) {
						func({
							offsetX: ctx.offset.x,
							offsetY: ctx.offset.y,
							rootNode: ctx.rootNode,
						});
					} else {
						ctx.rootNode.style.translate = `${ctx.offset.x}px ${ctx.offset.y}px`;
					}
				}
			},

			drag(ctx) {
				ctx.effect(() => {
					if (func) {
						return func({
							offsetX: ctx.offset.x,
							offsetY: ctx.offset.y,
							rootNode: ctx.rootNode,
						});
					}

					ctx.rootNode.style.translate = `${ctx.offset.x}px ${ctx.offset.y}px`;
				});
			},
		};
	},
);

type BoundFromFunction = (data: {
	root_node: HTMLElement;
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
export const bounds = unstable_definePlugin(
	(
		value: BoundFromFunction,
		shouldRecompute: (ctx: { readonly hook: 'dragStart' | 'drag' | 'dragEnd' }) => boolean = (
			ctx,
		) => ctx.hook === 'dragStart',
	) => {
		return {
			name: 'neodrag:bounds',

			setup(ctx) {
				return {
					bounds: value({ root_node: ctx.rootNode }),
				};
			},

			dragStart(ctx, state) {
				if (shouldRecompute({ hook: 'dragStart' })) {
					state.bounds = value({ root_node: ctx.rootNode });
				}
			},

			drag(ctx, state) {
				if (shouldRecompute({ hook: 'drag' })) {
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
				const allowed_movement: [[number, number], [number, number]] = [
					[
						bound_coords[0][0] - ctx.offset.x, // max left
						bound_coords[0][1] - ctx.offset.y, // max top
					],
					[
						bound_coords[1][0] - element_width - ctx.offset.x, // max right
						bound_coords[1][1] - element_height - ctx.offset.y, // max bottom
					],
				];

				// Now clamp the proposed delta movement to our allowed movement bounds
				ctx.propose({
					x:
						ctx.proposed.x != null
							? clamp(ctx.proposed.x, allowed_movement[0][0], allowed_movement[1][0])
							: ctx.proposed.x,
					y:
						ctx.proposed.y != null
							? clamp(ctx.proposed.y, allowed_movement[0][1], allowed_movement[1][1])
							: ctx.proposed.y,
				});
			},

			dragEnd(context, state) {
				if (shouldRecompute({ hook: 'dragEnd' })) {
					state.bounds = value({ root_node: context.rootNode });
				}
			},
		};
	},
);

export const threshold = unstable_definePlugin(
	(options: { delay?: number; distance?: number } = {}) => {
		return {
			name: 'neodrag:threshold',

			setup() {
				const _options = { ...options } as Required<typeof options>;
				_options.delay ??= 0;
				_options.distance ??= 0;

				return {
					start_time: 0,
					_options,
				};
			},

			shouldDrag(_, state) {
				state.start_time = Date.now();
				return true;
			},

			drag(ctx, state, event) {
				if (ctx.isDragging) return;

				// First check if we're still on the draggable element
				if (!ctx.currentlyDraggedNode.contains(event.target as Node)) {
					ctx.preventStart();
					return;
				}

				if (state._options.delay) {
					const elapsed = Date.now() - state.start_time;
					if (elapsed < state._options.delay) {
						console.log('Prevent start');
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
		};
	},
);

export type DragEventData = Readonly<{
	/** How much element moved from its original position horizontally */
	offset: Readonly<{ x: number; y: number }>;

	/** The node on which the draggable is applied */
	rootNode: HTMLElement;

	/** The element being dragged */
	currentNode: HTMLElement;
}>;

function fire_custom_event(node: HTMLElement, name: string, data: any) {
	return node.dispatchEvent(new CustomEvent(name, { detail: data }));
}
export const events = unstable_definePlugin(
	(
		options: {
			onDragStart?: (data: DragEventData) => void;
			onDrag?: (data: DragEventData) => void;
			onDragEnd?: (data: DragEventData) => void;
		} = {},
	) => {
		const data = {
			offset: { x: 0, y: 0 },
			rootNode: null! as HTMLElement,
			currentNode: null! as HTMLElement,
		} satisfies DragEventData;

		return {
			name: 'neodrag:events',
			cancelable: false,

			setup(ctx) {
				data.rootNode = ctx.rootNode;
			},

			dragStart(ctx) {
				ctx.effect(() => {
					data.offset = ctx.offset;
					data.currentNode = ctx.currentlyDraggedNode;

					fire_custom_event(ctx.rootNode, 'neodrag_start', data);
					options.onDragStart?.(data);
				});
			},

			drag(ctx) {
				ctx.effect(() => {
					data.offset = ctx.offset;
					data.currentNode = ctx.currentlyDraggedNode;

					fire_custom_event(ctx.rootNode, 'neodrag', data);
					options.onDrag?.(data);
				});
			},

			dragEnd(ctx) {
				ctx.effect(() => {
					data.offset = ctx.offset;
					data.currentNode = ctx.currentlyDraggedNode;

					fire_custom_event(ctx.rootNode, 'neodrag_end', data);
					options.onDragEnd?.(data);
				});
			},
		};
	},
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
export const controls = unstable_definePlugin(
	(options: {
		allow?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
		block?: ReturnType<(typeof ControlFrom)[keyof typeof ControlFrom]>;
		priority?: 'allow' | 'block';
	}) => {
		return {
			name: 'neodrag:controls',

			setup(ctx) {
				return {
					allow_zones: (options.allow?.(ctx.rootNode) ?? []).sort((a, b) => a.area - b.area),
					block_zones: options.block?.(ctx.rootNode) ?? [],
				};
			},

			shouldDrag(ctx, state, event) {
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

				return !state.block_zones.some((zone) =>
					is_point_in_zone(clientX, clientY, zone, root_rect),
				);
			},
		};
	},
);

export const position = unstable_definePlugin(
	(
		options: {
			current?: { x: number; y: number };
			default?: { x: number; y: number };
		} = {},
	) => {
		return {
			name: 'neodrag:position',
			priority: 1000,
			liveUpdate: true,

			setup(ctx) {
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

			drag(ctx) {
				if (options.current) {
					ctx.propose({
						x: options.current.x - ctx.offset.x,
						y: options.current.y - ctx.offset.y,
					});
					ctx.cancel();
				}
			},
		};
	},
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

export const touchAction = unstable_definePlugin((mode: TouchActionMode = 'manipulation') => {
	return {
		name: 'neodrag:touch-action',
		cancelable: false,
		liveUpdate: true,

		setup(ctx) {
			const original_touch_action = ctx.rootNode.style.touchAction;
			ctx.rootNode.style.touchAction = mode;

			return { original_touch_action };
		},

		dragEnd(ctx, state) {
			// Restore original touch-action
			ctx.rootNode.style.touchAction = state.original_touch_action || 'auto';
		},
	};
});
