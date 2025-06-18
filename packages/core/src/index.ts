export type DragBoundsCoords = {
	/** Number of pixels from left of the document */
	left: number;

	/** Number of pixels from top of the document */
	top: number;

	/** Number of pixels from the right side of document */
	right: number;

	/** Number of pixels from the bottom of the document */
	bottom: number;
};

export type DragAxis = 'both' | 'x' | 'y' | 'none';

export type DragBounds =
	| HTMLElement
	| Partial<DragBoundsCoords>
	| 'parent'
	| 'body'
	| (string & Record<never, never>);

export type DragEventData = {
	/** How much element moved from its original position horizontally */
	offsetX: number;

	/** How much element moved from its original position vertically */
	offsetY: number;

	/** The node on which the draggable is applied */
	rootNode: HTMLElement;

	/** The element being dragged */
	currentNode: HTMLElement;

	/** The pointer event that triggered the drag */
	event: PointerEvent;
};

export type DragOptions = {
	/**
	 * Optionally limit the drag area
	 *
	 * Accepts `parent` as prefixed value, and limits it to its parent.
	 *
	 * Or, you can specify any selector and it will be bound to that.
	 *
	 * **Note**: We don't check whether the selector is bigger than the node element.
	 * You yourself will have to make sure of that, or it may lead to strange behavior
	 *
	 * Or, finally, you can pass an object of type `{ top: number; right: number; bottom: number; left: number }`.
	 * These mimic the css `top`, `right`, `bottom` and `left`, in the sense that `bottom` starts from the bottom of the window, and `right` from right of window.
	 * If any of these properties are unspecified, they are assumed to be `0`.
	 */
	bounds?: DragBounds;

	/**
	 * When to recalculate the dimensions of the `bounds` element.
	 *
	 * By default, bounds are recomputed only on dragStart. Use this options to change that behavior.
	 *
	 * @default '{ dragStart: true, drag: false, dragEnd: false }'
	 */
	recomputeBounds?: {
		dragStart?: boolean;
		drag?: boolean;
		dragEnd?: boolean;
	};

	/**
	 * Axis on which the element can be dragged on. Valid values: `both`, `x`, `y`, `none`.
	 *
	 * - `both` - Element can move in any direction
	 * - `x` - Only horizontal movement possible
	 * - `y` - Only vertical movement possible
	 * - `none` - No movement at all
	 *
	 * @default 'both'
	 */
	axis?: DragAxis;

	/**
	 * If false, uses the new translate property instead of transform: translate(); to move the element around.
	 *
	 * At present this is true by default, but will be changed to false in a future major version.
	 *
	 * @default false
	 * @deprecated Use `transform` option instead for transform: translate() or any other custom transform. Will be removed in v3.
	 */
	legacyTranslate?: boolean;

	/**
	 * If true, uses `translate3d` instead of `translate` to move the element around, and the hardware acceleration kicks in.
	 *
	 * `true` by default, but can be set to `false` if [blurry text issue](https://developpaper.com/question/why-does-the-use-of-css3-translate3d-result-in-blurred-display/) occur
	 *
	 * @default true
	 * @deprecated Use `transform` option instead with translate(x, y, 1px). 1px forces some browsers to use GPU acceleration. Will be removed in v3
	 */
	gpuAcceleration?: boolean;

	/**
	 * Custom transform function. If provided, this function will be used to apply the DOM transformations to the root node to move it.
	 * Existing transform logic, including `gpuAcceleration` and `legacyTranslate`, will be ignored.
	 *
	 * You can return a string to apply to a `transform` property, or not return anything and apply your transformations using `rootNode.style.transform = VALUE`
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
	}) => string | undefined | void;

	/**
	 * Applies `user-select: none` on `<body />` element when dragging,
	 * to prevent the irritating effect where dragging doesn't happen and the text is selected.
	 * Applied when dragging starts and removed when it stops.
	 *
	 * Can be disabled using this option
	 *
	 * @default true
	 */
	applyUserSelectHack?: boolean;

	/**
	 * Ignores touch events with more than 1 touch.
	 * This helps when you have multiple elements on a canvas where you want to implement
	 * pinch-to-zoom behaviour.
	 *
	 * @default false
	 *
	 */
	ignoreMultitouch?: boolean;

	/**
	 * Disables dragging altogether.
	 *
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Applies a grid on the page to which the element snaps to when dragging, rather than the default continuous grid.
	 *
	 * `Note`: If you're programmatically creating the grid, do not set it to [0, 0] ever, that will stop drag at all. Set it to `undefined`.
	 *
	 * @default undefined
	 */
	grid?: [number, number];

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
	 * Control the position manually with your own state
	 *
	 * By default, the element will be draggable by mouse/finger, and all options will work as default while dragging.
	 *
	 * But changing the `position` option will also move the draggable around. These parameters are reactive,
	 * so using Svelte's reactive variables as values for position will work like a charm.
	 *
	 *
	 * Note: If you set `disabled: true`, you'll still be able to move the draggable through state variables. Only the user interactions won't work
	 *
	 */
	position?: { x: number; y: number };

	/**
	 * CSS Selector of an element or multiple elements inside the parent node(on which `use:draggable` is applied).
	 *
	 * Can be an element or elements too. If it is provided, Trying to drag inside the `cancel` element(s) will prevent dragging.
	 *
	 * @default undefined
	 */
	cancel?: string | HTMLElement | HTMLElement[];

	/**
	 * CSS Selector of an element or multiple elements inside the parent node(on which `use:draggable` is applied). Can be an element or elements too.
	 *
	 * If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.
	 *
	 * @default undefined
	 */
	handle?: string | HTMLElement | HTMLElement[];

	/**
	 * Class to apply on the element on which `use:draggable` is applied.
	 * Note that if `handle` is provided, it will still apply class on the element to which this action is applied, **NOT** the handle
	 *
	 */
	defaultClass?: string;

	/**
	 * Class to apply on the element when it is dragging
	 *
	 * @default 'neodrag-dragging'
	 */
	defaultClassDragging?: string;

	/**
	 * Class to apply on the element if it has been dragged at least once.
	 *
	 * @default 'neodrag-dragged'
	 */
	defaultClassDragged?: string;

	/**
	 * Offsets your element to the position you specify in the very beginning.
	 * `x` and `y` should be in pixels
	 *
	 */
	defaultPosition?: { x: number; y: number };

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

const enum DEFAULT_CLASS {
	MAIN = 'neodrag',
	DRAGGING = 'neodrag-dragging',
	DRAGGED = 'neodrag-dragged',
}

const DEFAULT_RECOMPUTE_BOUNDS: Exclude<DragOptions['recomputeBounds'], undefined> = {
	dragStart: true,
};

const enum DEFAULT_DRAG_THRESHOLD_VALUES {
	DELAY = 0,
	DISTANCE = 3,
}

const DEFAULT_DRAG_THRESHOLD: Exclude<DragOptions['threshold'], undefined> = {
	delay: DEFAULT_DRAG_THRESHOLD_VALUES.DELAY,
	distance: DEFAULT_DRAG_THRESHOLD_VALUES.DISTANCE,
};

export function draggable(node: HTMLElement, options: DragOptions = {}) {
	let {
		bounds,
		axis = 'both',
		gpuAcceleration = true,
		legacyTranslate = false,
		transform,
		applyUserSelectHack = true,
		disabled = false,
		ignoreMultitouch = false,
		recomputeBounds = DEFAULT_RECOMPUTE_BOUNDS,
		grid,
		threshold = DEFAULT_DRAG_THRESHOLD,
		position,
		cancel,
		handle,
		defaultClass = DEFAULT_CLASS.MAIN,
		defaultClassDragging = DEFAULT_CLASS.DRAGGING,
		defaultClassDragged = DEFAULT_CLASS.DRAGGED,
		defaultPosition = { x: 0, y: 0 },
		onDragStart,
		onDrag,
		onDragEnd,
	} = options;

	/** Make sure user is interacting(clicking, tapping, trying to move) the `node` */
	let is_interacting = false;
	/** Whether we should allow for dragging */
	let is_dragging = false;

	let start_time = 0;
	let meets_time_threshold = false;
	let meets_distance_threshold = false;

	let translate_x = 0,
		translate_y = 0;

	let initial_x = 0,
		initial_y = 0;

	// The offset of the client position relative to the node's top-left corner
	let client_to_node_offsetX = 0,
		client_to_node_offsetY = 0;

	let { x: x_offset, y: y_offset } = position
		? { x: position?.x ?? 0, y: position?.y ?? 0 }
		: defaultPosition;

	set_translate(x_offset, y_offset);

	let can_move_in_x: boolean;
	let can_move_in_y: boolean;

	let body_original_user_select_val = '';

	let computed_bounds: DragBoundsCoords | undefined;
	let node_rect: DOMRect;

	let drag_els: HTMLElement[];
	let cancel_els: HTMLElement[];

	let currently_dragged_el: HTMLElement;

	let is_controlled = !!position;

	// Set proper defaults for recomputeBounds
	recomputeBounds = { ...DEFAULT_RECOMPUTE_BOUNDS, ...recomputeBounds };

	// Proper defaults for threshold
	threshold = { ...DEFAULT_DRAG_THRESHOLD, ...(threshold ?? {}) };

	let active_pointers = new Set<number>();

	function try_start_drag(event: PointerEvent) {
		if (
			is_interacting &&
			!is_dragging &&
			meets_distance_threshold &&
			meets_time_threshold &&
			currently_dragged_el
		) {
			is_dragging = true;
			fire_svelte_drag_start_event(event);
			node_class_list.add(defaultClassDragging);

			if (applyUserSelectHack) {
				// Apply user-select: none on body to prevent misbehavior
				body_original_user_select_val = body_style.userSelect;
				body_style.userSelect = 'none';
			}
		}
	}

	function reset_state() {
		is_dragging = false;
		meets_time_threshold = false;
		meets_distance_threshold = false;
	}

	// Arbitrary constants for better minification
	const body_style = document.body.style;
	const node_class_list = node.classList;

	function set_translate(x_pos = translate_x, y_pos = translate_y) {
		if (!transform) {
			if (legacyTranslate) {
				let common = `${+x_pos}px, ${+y_pos}px`;
				return set_style(
					node,
					'transform',
					gpuAcceleration ? `translate3d(${common}, 0)` : `translate(${common})`,
				);
			}

			return set_style(node, 'translate', `${+x_pos}px ${+y_pos}px`);
		}

		// Call transform function if provided
		const transform_called = transform({ offsetX: x_pos, offsetY: y_pos, rootNode: node });
		if (is_string(transform_called)) {
			set_style(node, 'transform', transform_called);
		}
	}

	function get_event_data(event: PointerEvent) {
		return {
			offsetX: translate_x,
			offsetY: translate_y,
			rootNode: node,
			currentNode: currently_dragged_el,
			event
		};
	}

	function call_event(eventName: 'neodrag:start' | 'neodrag' | 'neodrag:end', fn: typeof onDrag, event: PointerEvent) {
		const data = get_event_data(event);
		node.dispatchEvent(new CustomEvent(eventName, { detail: data }));
		fn?.(data);
	}

	function fire_svelte_drag_start_event(event: PointerEvent) {
		call_event('neodrag:start', onDragStart, event);
	}

	function fire_svelte_drag_end_event(event: PointerEvent) {
		call_event('neodrag:end', onDragEnd, event);
	}

	function fire_svelte_drag_event(event: PointerEvent) {
		call_event('neodrag', onDrag, event);
	}

	const listen = addEventListener;
	const controller = new AbortController();
	const event_options = { signal: controller.signal, capture: false };

	// On mobile, touch can become extremely janky without it
	set_style(node, 'touch-action', 'none');

	listen(
		'pointerdown',
		(e) => {
			if (disabled) return;
			if (e.button === 2) return;

			active_pointers.add(e.pointerId);

			if (ignoreMultitouch && active_pointers.size > 1) return e.preventDefault();

			// Compute bounds
			if (recomputeBounds.dragStart) computed_bounds = compute_bound_rect(bounds, node);

			if (is_string(handle) && is_string(cancel) && handle === cancel)
				throw new Error("`handle` selector can't be same as `cancel` selector");

			node_class_list.add(defaultClass);

			drag_els = get_handle_els(handle, node);
			cancel_els = get_cancel_elements(cancel, node);

			can_move_in_x = /(both|x)/.test(axis);
			can_move_in_y = /(both|y)/.test(axis);

			if (cancel_element_contains(cancel_els, drag_els))
				throw new Error(
					"Element being dragged can't be a child of the element on which `cancel` is applied",
				);

			const event_target = e.composedPath()[0] as HTMLElement;
			if (
				drag_els.some((el) => el.contains(event_target) || el.shadowRoot?.contains(event_target)) &&
				!cancel_element_contains(cancel_els, [event_target])
			) {
				currently_dragged_el =
					drag_els.length === 1 ? node : drag_els.find((el) => el.contains(event_target))!;
				is_interacting = true;
				start_time = Date.now();

				// If no delay, immediately set time threshold
				if (!threshold.delay) {
					meets_time_threshold = true;
				}
			} else return;

			// Compute current node's bounding client Rectangle
			node_rect = node.getBoundingClientRect();

			const { clientX, clientY } = e;
			const inverse_scale = calculate_inverse_scale();

			if (can_move_in_x) initial_x = clientX - x_offset / inverse_scale;
			if (can_move_in_y) initial_y = clientY - y_offset / inverse_scale;

			// Only the bounds uses these properties at the moment,
			// may open up in the future if others need it
			if (computed_bounds) {
				client_to_node_offsetX = clientX - node_rect.left;
				client_to_node_offsetY = clientY - node_rect.top;
			}
		},
		event_options,
	);

	listen(
		'pointermove',
		(e) => {
			if (!is_interacting || (ignoreMultitouch && active_pointers.size > 1)) return;

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
					const distance = Math.sqrt(delta_x ** 2 + delta_y ** 2);

					if (distance >= threshold.distance!) {
						meets_distance_threshold = true;
						try_start_drag(e);
					}
				}

				if (!is_dragging) return;
			}

			if (recomputeBounds.drag) computed_bounds = compute_bound_rect(bounds, node);

			e.preventDefault();

			node_rect = node.getBoundingClientRect();

			// Get final values for clamping
			let final_x = e.clientX,
				final_y = e.clientY;

			const inverse_scale = calculate_inverse_scale();

			if (computed_bounds) {
				// Client position is limited to this virtual boundary to prevent node going out of bounds
				const virtual_client_bounds: DragBoundsCoords = {
					left: computed_bounds.left + client_to_node_offsetX,
					top: computed_bounds.top + client_to_node_offsetY,
					right: computed_bounds.right + client_to_node_offsetX - node_rect.width,
					bottom: computed_bounds.bottom + client_to_node_offsetY - node_rect.height,
				};

				final_x = clamp(final_x, virtual_client_bounds.left, virtual_client_bounds.right);
				final_y = clamp(final_y, virtual_client_bounds.top, virtual_client_bounds.bottom);
			}

			if (Array.isArray(grid)) {
				let [x_snap, y_snap] = grid;

				if (isNaN(+x_snap) || x_snap < 0)
					throw new Error('1st argument of `grid` must be a valid positive number');

				if (isNaN(+y_snap) || y_snap < 0)
					throw new Error('2nd argument of `grid` must be a valid positive number');

				let delta_x = final_x - initial_x,
					delta_y = final_y - initial_y;

				[delta_x, delta_y] = snap_to_grid(
					[x_snap / inverse_scale, y_snap / inverse_scale],
					delta_x,
					delta_y,
				);

				final_x = initial_x + delta_x;
				final_y = initial_y + delta_y;
			}

			if (can_move_in_x) translate_x = Math.round((final_x - initial_x) * inverse_scale);
			if (can_move_in_y) translate_y = Math.round((final_y - initial_y) * inverse_scale);

			x_offset = translate_x;
			y_offset = translate_y;

			fire_svelte_drag_event(e);

			set_translate();
		},
		event_options,
	);

	listen(
		'pointerup',
		(e) => {
			active_pointers.delete(e.pointerId);

			if (!is_interacting) return;

			if (is_dragging) {
				// Listen for click handler and cancel it
				listen('click', (e) => e.stopPropagation(), {
					once: true,
					signal: controller.signal,
					capture: true,
				});

				if (recomputeBounds.dragEnd) computed_bounds = compute_bound_rect(bounds, node);

				// Apply class defaultClassDragged
				node_class_list.remove(defaultClassDragging);
				node_class_list.add(defaultClassDragged);

				if (applyUserSelectHack) body_style.userSelect = body_original_user_select_val;

				fire_svelte_drag_end_event(e);

				if (can_move_in_x) initial_x = translate_x;
				if (can_move_in_y) initial_y = translate_y;
			}

			is_interacting = false;
			reset_state();
		},
		event_options,
	);

	function calculate_inverse_scale() {
		// Calculate the current scale of the node
		let inverse_scale = node.offsetWidth / node_rect.width;
		if (isNaN(inverse_scale)) inverse_scale = 1;
		return inverse_scale;
	}

	return {
		destroy: (): void => controller.abort(),
		update: (options: DragOptions): void => {
			// Update all the values that need to be changed
			axis = options.axis || 'both';
			disabled = options.disabled ?? false;
			ignoreMultitouch = options.ignoreMultitouch ?? false;
			handle = options.handle;
			bounds = options.bounds;
			recomputeBounds = options.recomputeBounds ?? DEFAULT_RECOMPUTE_BOUNDS;
			cancel = options.cancel;
			applyUserSelectHack = options.applyUserSelectHack ?? true;
			grid = options.grid;
			gpuAcceleration = options.gpuAcceleration ?? true;
			legacyTranslate = options.legacyTranslate ?? false;
			transform = options.transform;
			threshold = { ...DEFAULT_DRAG_THRESHOLD, ...(options.threshold ?? {}) };

			const dragged = node_class_list.contains(defaultClassDragged);

			node_class_list.remove(defaultClass, defaultClassDragged);

			defaultClass = options.defaultClass ?? DEFAULT_CLASS.MAIN;
			defaultClassDragging = options.defaultClassDragging ?? DEFAULT_CLASS.DRAGGING;
			defaultClassDragged = options.defaultClassDragged ?? DEFAULT_CLASS.DRAGGED;

			node_class_list.add(defaultClass);

			if (dragged) node_class_list.add(defaultClassDragged);

			if (is_controlled) {
				x_offset = translate_x = options.position?.x ?? translate_x;
				y_offset = translate_y = options.position?.y ?? translate_y;

				set_translate();
			}
		},
	};
}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

const is_string = (val: unknown): val is string => typeof val === 'string';

const snap_to_grid = (
	[x_snap, y_snap]: [number, number],
	pending_x: number,
	pending_y: number,
): [number, number] => {
	const calc = (val: number, snap: number) => (snap === 0 ? 0 : Math.ceil(val / snap) * snap);

	const x = calc(pending_x, x_snap);
	const y = calc(pending_y, y_snap);

	return [x, y];
};

function get_handle_els(handle: DragOptions['handle'], node: HTMLElement): HTMLElement[] {
	if (!handle) return [node];

	if (is_HTMLElement(handle)) return [handle];
	if (Array.isArray(handle)) return handle;

	// Valid!! Let's check if this selector exists or not
	const handle_els = node.querySelectorAll<HTMLElement>(handle);
	if (handle_els === null)
		throw new Error(
			'Selector passed for `handle` option should be child of the element on which the action is applied',
		);

	return Array.from(handle_els.values());
}

function get_cancel_elements(cancel: DragOptions['cancel'], node: HTMLElement): HTMLElement[] {
	if (!cancel) return [];

	if (is_HTMLElement(cancel)) return [cancel];
	if (Array.isArray(cancel)) return cancel;

	const cancel_els = node.querySelectorAll<HTMLElement>(cancel);

	if (cancel_els === null)
		throw new Error(
			'Selector passed for `cancel` option should be child of the element on which the action is applied',
		);

	return Array.from(cancel_els.values());
}

const cancel_element_contains = (cancel_elements: HTMLElement[], drag_elements: HTMLElement[]) =>
	cancel_elements.some((cancelEl) => drag_elements.some((el) => cancelEl.contains(el)));

function compute_bound_rect(bounds: DragOptions['bounds'], rootNode: HTMLElement) {
	if (bounds === undefined) return;

	if (is_HTMLElement(bounds)) return bounds.getBoundingClientRect();

	if (typeof bounds === 'object') {
		// we have the left right etc

		const { top = 0, left = 0, right = 0, bottom = 0 } = bounds;

		const computed_right = window.innerWidth - right;
		const computed_bottom = window.innerHeight - bottom;

		return { top, right: computed_right, bottom: computed_bottom, left };
	}

	// It's a string
	if (bounds === 'parent') return (<HTMLElement>rootNode.parentNode).getBoundingClientRect();

	const node = document.querySelector<HTMLElement>(<string>bounds);
	if (node === null)
		throw new Error("The selector provided for bound doesn't exists in the document.");

	return node.getBoundingClientRect();
}

const set_style = (el: HTMLElement, style: string, value: string) =>
	el.style.setProperty(style, value);

const is_HTMLElement = (obj: unknown): obj is HTMLElement => obj instanceof HTMLElement;
