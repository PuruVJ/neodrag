import memoize from './memoize';

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
	 *
	 * @example
	 * ```svelte
	 * <!-- Bound to parent element -->
	 * <div use:draggable={{ bounds: 'parent' }}>
	 *   Hello
	 * </div>
	 * ```
	 *
	 * @example
	 * ```svelte
	 * <!-- Bound to body -->
	 * <div use:draggable={{ bounds: 'body' }}>
	 *   Hello
	 * </div>
	 * ```
	 *
	 * @example
	 * ```svelte
	 * <!-- Bound to arbitrary coordinates -->
	 * <div use:draggable={{ bounds: { top: 100, right: 100, bottom: 100, left: 100 } }}>
	 *   Hello
	 * </div>
	 * ```
	 */
	bounds?: DragBounds;

	/**
	 * Axis on which the element can be dragged on. Valid values: `both`, `x`, `y`, `none`.
	 *
	 * - `both` - Element can move in any direction
	 * - `x` - Only horizontal movement possible
	 * - `y` - Only vertical movement possible
	 * - `none` - No movement at all
	 *
	 * @default 'both'
	 *
	 * @example
	 * ```svelte
	 * <!-- Drag only in x direction -->
	 * <div use:draggable={{ axis: 'x' }}>
	 *   Text
	 * </div>
	 * ```
	 */
	axis?: DragAxis;

	/**
	 * If true, uses `translate3d` instead of `translate` to move the element around, and the hardware acceleration kicks in.
	 *
	 * `true` by default, but can be set to `false` if [blurry text issue](https://developpaper.com/question/why-does-the-use-of-css3-translate3d-result-in-blurred-display/) occur
	 *
	 * @default true
	 *
	 * @example
	 * ```svelte
	 * <!-- Disable GPU acceleration -->
	 * <div use:draggable={{ gpuAcceleration: false }}>
	 *   Text
	 * </div>
	 * ```
	 */
	gpuAcceleration?: boolean;

	/**
	 * Applies `user-select: none` on `<body />` element when dragging,
	 * to prevent the irritating effect where dragging doesn't happen and the text is selected.
	 * Applied when dragging starts and removed when it stops.
	 *
	 * Can be disabled using this option
	 *
	 * @default true
	 *
	 * @example
	 * ```svelte
	 * <!-- Do not disable user selection -->
	 * <div use:draggable={{ applyUserSelectHack: false }}>
	 *   Text
	 * </div>
	 * ```
	 */
	applyUserSelectHack?: boolean;

	/**
	 * Ignores touch events with more than 1 touch.
	 * This helps when you have multiple elements on a canvas where you want to implement
	 * pinch-to-zoom behaviour.
	 *
	 * @default false
	 *
	 * @example
	 * ```svelte
	 * <!-- Ignore Multitouch -->
	 * <div use:draggable={{ ignoreMultitouch: true }}>
	 *   Text
	 * </div>
	 * ```
	 */
	ignoreMultitouch?: boolean;

	/**
	 * Disables dragging altogether.
	 *
	 * @default false
	 *
	 * @example
	 * ```svelte
	 * <!-- Disable it entirely -->
	 * <div use:draggable={{ disabled: true }}>
	 *   Text
	 * </div>
	 * ```
	 */
	disabled?: boolean;

	/**
	 * Applies a grid on the page to which the element snaps to when dragging, rather than the default continuous grid.
	 *
	 * `Note`: If you're programmatically creating the grid, do not set it to [0, 0] ever, that will stop drag at all. Set it to `undefined`.
	 *
	 * @default undefined
	 *
	 * @example
	 * ```svelte
	 * <!-- Snap to a grid of 10 by 10 -->
	 * <div use:draggable={{ grid: [10, 10] }}>
	 *   Text
	 * </div>
	 * ```
	 */
	grid?: [number, number];

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
	 * Examples:
	 *
	 * [Changing with inputs](https://svelte.dev/repl/e1e707358b37467ba272891715878a1d?version=3.44.1)
	 *
	 * [Changing with Sliders](https://svelte.dev/repl/6b437a1cdbfc4c748520a72330c6395b?version=3.44.1)
	 *
	 * [Draggable only through external state, not user input](https://svelte.dev/repl/0eae169f272e41ba9c07ef222ed2bf66?version=3.44.1)
	 *
	 * [Comes back to original position after drag end](https://svelte.dev/repl/83d3aa8c5e154b7baf1a9c417c217d2e?version=3.44.1)
	 *
	 * [Comes back to original position with transition](https://svelte.dev/repl/bc84ed4ca22f45acbc28de3e33199883?version=3.44.1)
	 */
	position?: { x: number; y: number };

	/**
	 * CSS Selector of an element inside the parent node(on which `use:draggable` is applied).
	 *
	 * If it is provided, Trying to drag inside the `cancel` selector will prevent dragging.
	 *
	 * @default undefined
	 *
	 * @example
	 * <!-- Grid has a cancel element -->
	 * <div use:draggable={{ cancel: '.cancel' }}>
	 *   Text
	 *   <div class="cancel">This won't drag</div>
	 * </div>
	 * ```
	 */
	cancel?: string | HTMLElement;

	/**
	 * CSS Selector of an element inside the parent node(on which `use:draggable` is applied).
	 *
	 * If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.
	 *
	 * @default undefined
	 *
	 * @example
	 * <!-- Grid has a handle element -->
	 * <div use:draggable={{ handle: '.handle' }}>
	 *   This won't drag
	 *   <div class="handle">This sure will drag!!</div>
	 * </div>
	 * ```
	 */
	handle?: string | HTMLElement;

	/**
	 * Class to apply on the element on which `use:draggable` is applied.
	 * Note that if `handle` is provided, it will still apply class on the element to which this action is applied, **NOT** the handle
	 *
	 * neodrag'
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
	 * @example
	 * <!-- Place the element at (300, 200) at the very beginning -->
	 * <div use:draggable={{ defaultPosition: { x: 300; y: 200 } }}>
	 *   Hello
	 * </div>
	 * ```
	 */
	defaultPosition?: { x: number; y: number };

	/**
	 * Fires when dragging start
	 */
	onDragStart?: (data: { offsetX: number; offsetY: number; domRect: DOMRect }) => void;

	/**
	 * Fires when dragging is going on
	 */
	onDrag?: (data: { offsetX: number; offsetY: number; domRect: DOMRect }) => void;

	/**
	 * Fires when dragging ends
	 */
	onDragEnd?: (data: { offsetX: number; offsetY: number; domRect: DOMRect }) => void;
};

const enum DEFAULT_CLASS {
	MAIN = 'neodrag',
	DRAGGING = 'neodrag-dragging',
	DRAGGED = 'neodrag-dragged',
}

export const draggable = (node: HTMLElement, options: DragOptions = {}) => {
	let {
		bounds,
		axis = 'both',
		gpuAcceleration = true,
		applyUserSelectHack = true,
		disabled = false,
		ignoreMultitouch = false,

		grid,

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

	const tick = new Promise(requestAnimationFrame);

	let active = false;

	let [translateX, translateY] = [0, 0];
	let [initialX, initialY] = [0, 0];

	// The offset of the client position relative to the node's top-left corner
	let [clientToNodeOffsetX, clientToNodeOffsetY] = [0, 0];

	let { x: xOffset, y: yOffset } = { x: position?.x ?? 0, y: position?.y ?? 0 } ?? defaultPosition;

	setTranslate(xOffset, yOffset, node, gpuAcceleration);

	let canMoveInX: boolean;
	let canMoveInY: boolean;

	let bodyOriginalUserSelectVal = '';

	let computedBounds: DragBoundsCoords;
	let nodeRect: DOMRect;

	let dragEl: HTMLElement | undefined;
	let cancelEl: HTMLElement | undefined;

	let isControlled = !!position;

	const getEventData = () => ({
		offsetX: translateX,
		offsetY: translateY,
		domRect: node.getBoundingClientRect(),
	});

	function fireSvelteDragStartEvent(node: HTMLElement) {
		const data = getEventData();
		node.dispatchEvent(new CustomEvent('neodrag:start', { detail: data }));
		onDragStart?.(data);
	}

	function fireSvelteDragStopEvent(node: HTMLElement) {
		const data = getEventData();

		node.dispatchEvent(new CustomEvent('neodrag:end', { detail: data }));
		onDragEnd?.(data);
	}

	function fireSvelteDragEvent(node: HTMLElement) {
		const data = getEventData();

		node.dispatchEvent(new CustomEvent('neodrag', { detail: data }));
		onDrag?.(data);
	}

	const listen = addEventListener;

	listen('touchstart', dragStart, false);
	listen('touchend', dragEnd, false);
	listen('touchmove', drag, false);

	listen('mousedown', dragStart, false);
	listen('mouseup', dragEnd, false);
	listen('mousemove', drag, false);

	// On mobile, touch can become extremely janky without it
	node.style.touchAction = 'none';

	const calculateInverseScale = () => {
		// Calculate the current scale of the node
		let inverseScale = node.offsetWidth / nodeRect.width;
		if (isNaN(inverseScale)) inverseScale = 1;
		return inverseScale;
	};

	function dragStart(e: TouchEvent | MouseEvent) {
		if (disabled) return;
		if (ignoreMultitouch && e.type === 'touchstart' && (e as TouchEvent).touches.length > 1) return;

		node.classList.add(defaultClass);

		dragEl = getHandleEl(handle, node);
		cancelEl = getCancelElement(cancel, node);

		canMoveInX = ['both', 'x'].includes(axis);
		canMoveInY = ['both', 'y'].includes(axis);

		// Compute bounds
		if (typeof bounds !== 'undefined') {
			computedBounds = computeBoundRect(bounds, node);
		}

		// Compute current node's bounding client Rectangle
		nodeRect = node.getBoundingClientRect();

		if (isString(handle) && isString(cancel) && handle === cancel)
			throw new Error("`handle` selector can't be same as `cancel` selector");

		if (cancelEl?.contains(dragEl))
			throw new Error(
				"Element being dragged can't be a child of the element on which `cancel` is applied"
			);

		if (dragEl.contains(<HTMLElement>e.target) && !cancelEl?.contains(<HTMLElement>e.target))
			active = true;

		if (!active) return;

		if (applyUserSelectHack) {
			// Apply user-select: none on body to prevent misbehavior
			bodyOriginalUserSelectVal = document.body.style.userSelect;
			document.body.style.userSelect = 'none';
		}

		// Dispatch custom event
		fireSvelteDragStartEvent(node);

		const { clientX, clientY } = isTouchEvent(e) ? e.touches[0] : e;
		const inverseScale = calculateInverseScale();

		if (canMoveInX) initialX = clientX - xOffset / inverseScale;
		if (canMoveInY) initialY = clientY - yOffset / inverseScale;

		// Only the bounds uses these properties at the moment,
		// may open up in the future if others need it
		if (computedBounds) {
			clientToNodeOffsetX = clientX - nodeRect.left;
			clientToNodeOffsetY = clientY - nodeRect.top;
		}
	}

	function dragEnd() {
		if (!active) return;

		// Apply class defaultClassDragged
		node.classList.remove(defaultClassDragging);
		node.classList.add(defaultClassDragged);

		if (applyUserSelectHack) document.body.style.userSelect = bodyOriginalUserSelectVal;

		fireSvelteDragStopEvent(node);

		if (canMoveInX) initialX = translateX;
		if (canMoveInX) initialY = translateY;

		active = false;
	}

	function drag(e: TouchEvent | MouseEvent) {
		if (!active) return;

		// Apply class defaultClassDragging
		node.classList.add(defaultClassDragging);

		e.preventDefault();

		nodeRect = node.getBoundingClientRect();

		const { clientX, clientY } = isTouchEvent(e) ? e.touches[0] : e;

		// Get final values for clamping
		let [finalX, finalY] = [clientX, clientY];

		const inverseScale = calculateInverseScale();

		if (computedBounds) {
			// Client position is limited to this virtual boundary to prevent node going out of bounds
			const virtualClientBounds: DragBoundsCoords = {
				left: computedBounds.left + clientToNodeOffsetX,
				top: computedBounds.top + clientToNodeOffsetY,
				right: computedBounds.right + clientToNodeOffsetX - nodeRect.width,
				bottom: computedBounds.bottom + clientToNodeOffsetY - nodeRect.height,
			};

			finalX = clamp(finalX, virtualClientBounds.left, virtualClientBounds.right);
			finalY = clamp(finalY, virtualClientBounds.top, virtualClientBounds.bottom);
		}

		if (Array.isArray(grid)) {
			let [xSnap, ySnap] = grid;

			if (isNaN(+xSnap) || xSnap < 0)
				throw new Error('1st argument of `grid` must be a valid positive number');

			if (isNaN(+ySnap) || ySnap < 0)
				throw new Error('2nd argument of `grid` must be a valid positive number');

			let [deltaX, deltaY] = [finalX - initialX, finalY - initialY];
			[deltaX, deltaY] = snapToGrid(
				[Math.floor(xSnap / inverseScale), Math.floor(ySnap / inverseScale)],
				deltaX,
				deltaY
			);

			[finalX, finalY] = [initialX + deltaX, initialY + deltaY];
		}

		if (canMoveInX) translateX = (finalX - initialX) * inverseScale;
		if (canMoveInY) translateY = (finalY - initialY) * inverseScale;

		[xOffset, yOffset] = [translateX, translateY];

		fireSvelteDragEvent(node);

		tick.then(() => setTranslate(translateX, translateY, node, gpuAcceleration));
		// Promise.resolve().then(() => setTranslate(translateX, translateY, node, gpuAcceleration));
	}

	return {
		destroy: () => {
			const unlisten = removeEventListener;

			unlisten('touchstart', dragStart, false);
			unlisten('touchend', dragEnd, false);
			unlisten('touchmove', drag, false);

			unlisten('mousedown', dragStart, false);
			unlisten('mouseup', dragEnd, false);
			unlisten('mousemove', drag, false);
		},
		update: (options: DragOptions) => {
			// Update all the values that need to be changed
			axis = options.axis || 'both';
			disabled = options.disabled ?? false;
			ignoreMultitouch = options.ignoreMultitouch ?? false;
			handle = options.handle;
			bounds = options.bounds;
			cancel = options.cancel;
			applyUserSelectHack = options.applyUserSelectHack ?? true;
			grid = options.grid;
			gpuAcceleration = options.gpuAcceleration ?? true;

			const dragged = node.classList.contains(defaultClassDragged);

			node.classList.remove(defaultClass, defaultClassDragged);

			defaultClass = options.defaultClass ?? DEFAULT_CLASS.MAIN;
			defaultClassDragging = options.defaultClassDragging ?? DEFAULT_CLASS.DRAGGING;
			defaultClassDragged = options.defaultClassDragged ?? DEFAULT_CLASS.DRAGGED;

			node.classList.add(defaultClass);

			if (dragged) node.classList.add(defaultClassDragged);

			if (isControlled) {
				xOffset = translateX = options.position?.x ?? translateX;
				yOffset = translateY = options.position?.y ?? translateY;

				tick.then(() => setTranslate(translateX, translateY, node, gpuAcceleration));
			}
		},
	};
};

function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
	return Boolean((event as TouchEvent).touches && (event as TouchEvent).touches.length);
}

function clamp(val: number, min: number, max: number) {
	return Math.min(Math.max(val, min), max);
}

function isString(val: unknown): val is string {
	return typeof val === 'string';
}

const snapToGrid = memoize(
	([xSnap, ySnap]: [number, number], pendingX: number, pendingY: number): [number, number] => {
		const x = Math.round(pendingX / xSnap) * xSnap;
		const y = Math.round(pendingY / ySnap) * ySnap;
		return [x, y];
	}
);

function getHandleEl(handle: DragOptions['handle'], node: HTMLElement) {
	if (!handle) return node;

	if (handle instanceof HTMLElement) return handle;

	// Valid!! Let's check if this selector exists or not
	const handleEl = node.querySelector<HTMLElement>(handle);
	if (handleEl === null)
		throw new Error(
			'Selector passed for `handle` option should be child of the element on which the action is applied'
		);

	return handleEl!;
}

function getCancelElement(cancel: DragOptions['cancel'], node: HTMLElement) {
	if (!cancel) return;

	if (cancel instanceof HTMLElement) return cancel;

	const cancelEl = node.querySelector<HTMLElement>(cancel);

	if (cancelEl === null)
		throw new Error(
			'Selector passed for `cancel` option should be child of the element on which the action is applied'
		);

	return cancelEl;
}

function computeBoundRect(bounds: DragOptions['bounds'], rootNode: HTMLElement) {
	if (bounds instanceof HTMLElement) return bounds.getBoundingClientRect();

	if (typeof bounds === 'object') {
		// we have the left right etc
		const [windowWidth, windowHeight] = [window.innerWidth, window.innerHeight];

		const { top = 0, left = 0, right = 0, bottom = 0 } = bounds;

		const computedRight = windowWidth - right;
		const computedBottom = windowHeight - bottom;

		return { top, right: computedRight, bottom: computedBottom, left };
	}

	// It's a string
	if (bounds === 'parent') return (<HTMLElement>rootNode.parentNode).getBoundingClientRect();

	const node = document.querySelector<HTMLElement>(<string>bounds);
	if (node === null)
		throw new Error("The selector provided for bound doesn't exists in the document.");

	const computedBounds = node.getBoundingClientRect();
	return computedBounds;
}

function setTranslate(xPos: number, yPos: number, el: HTMLElement, gpuAcceleration: boolean) {
	el.style.transform = gpuAcceleration
		? `translate3d(${+xPos}px, ${+yPos}px, 0)`
		: `translate(${+xPos}px, ${+yPos}px)`;
}
