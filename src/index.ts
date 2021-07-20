type Coords = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Options = {
  // bounds?: string | Coords;

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
  axis?: 'both' | 'x' | 'y' | 'none';

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
  cancel?: string;

  /**
   * CSS Selector of an element inside the parent node(on which `use:draggable` is applied).
   *
   * If it is provided, Only clicking and dragging on this element will allow the parent to drag, anywhere else on the parent won't work.
   *
   * @default undefined
   *
   * @example
   * <!-- Grid has a handle element -->
   * <div use:draggable={{ handle: '.handel' }}>
   *   This won't drag
   *   <div class="handel">This sure will drag!!</div>
   * </div>
   * ```
   */
  handle?: string;

  /**
   * Class to apply on the element on which `use:draggable` is applied.
   * Note that if `handle` is provided, it will still apply class on the parent element, **NOT** the handle
   *
   * @default 'svelte-draggable'
   */
  defaultClass?: string;

  /**
   * Class to apply on the parent element when it is dragging
   *
   * @default 'svelte-draggable-dragging'
   */
  defaultClassDragging?: string;

  /**
   * Class to apply on the parent element if it has been dragged at least once.
   *
   * @default 'svelte-draggable-dragged'
   */
  defaultClassDragged?: string;

  /**
   * Offsets your element to the position you specify in the very beginning.
   * `x` and `y` should be in pixels
   *
   
   *
   * @example
   * <!-- Place the element at (300, 200) at the very beginning -->
   * <div use:draggable={{ defaultPosition: { x: 300; y: 200 } }}>
   *   Hello
   * </div>
   * ```
   */
  defaultPosition?: { x: number; y: number };
};

const DEFAULT_CLASS = {
  MAIN: 'svelte-draggable',
  DRAGGING: 'svelte-draggable-dragging',
  DRAGGED: 'svelte-draggable-dragged',
};

export const draggable = (node: HTMLElement, options: Options = {}) => {
  let {
    // bounds,
    axis = 'both',
    gpuAcceleration = true,
    applyUserSelectHack = true,
    disabled = false,

    grid,

    cancel,
    handle,

    defaultClass = DEFAULT_CLASS.MAIN,
    defaultClassDragging = DEFAULT_CLASS.DRAGGING,
    defaultClassDragged = DEFAULT_CLASS.DRAGGED,

    defaultPosition = { x: 0, y: 0 },
  } = options;

  let active = false;

  let [translateX, translateY] = [0, 0];
  let [initialX, initialY] = [0, 0];
  let [previousX, previousY] = [0, 0];

  let [xOffset, yOffset] = [defaultPosition.x, defaultPosition.y];

  setTranslate(xOffset, yOffset, node, gpuAcceleration);

  let canMoveInX: boolean;
  let canMoveInY: boolean;

  let bodyOriginalUserSelectVal = '';

  let computedBounds: Coords;
  let nodeRect: DOMRect;

  let dragEl: HTMLElement | undefined;
  let cancelEl: HTMLElement | undefined;

  setupListeners(dragStart, dragEnd, drag);

  // On mobile, touch can become extremely janky without it
  node.style.touchAction = 'none';

  function dragStart(e: TouchEvent | MouseEvent) {
    if (disabled) return;

    node.classList.add(defaultClass);

    dragEl = getDragEl(handle, node);
    cancelEl = getCancelElement(cancel, node);

    canMoveInX = ['both', 'x'].includes(axis);
    canMoveInY = ['both', 'y'].includes(axis);

    // Compute bounds
    // if (typeof bounds !== 'undefined') computedBounds = computeBoundRect(bounds);

    // Compute current node's bounding client Rectangle
    nodeRect = node.getBoundingClientRect();

    if (isString(handle) && isString(cancel) && handle === cancel)
      throw new Error("`handle` selector can't be same as `cancel` selector");

    if (cancelEl?.contains(dragEl))
      throw new Error(
        "Element being dragged can't be a child of the element on which action is applied"
      );

    if (dragEl.contains(e.target as HTMLElement) && !cancelEl?.contains(e.target as HTMLElement))
      active = true;

    if (!active) return;

    if (applyUserSelectHack) {
      // Apply user-select: none on body to prevent misbehavior
      bodyOriginalUserSelectVal = document.body.style.userSelect;
      document.body.style.userSelect = 'none';
    }
    // Dispatch custom event
    fireSvelteDragStartEvent(node);

    const { clientX, clientY } =
      e.type === 'touchstart' ? (e as TouchEvent).touches[0] : (e as MouseEvent);

    if (canMoveInX) initialX = clientX - xOffset;
    if (canMoveInY) initialY = clientY - yOffset;
  }

  function dragEnd() {
    if (disabled) return;

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
    if (disabled) return;

    if (!active) return;

    // Apply class defaultClassDragging
    node.classList.add(defaultClassDragging);

    fireSvelteDragEvent(node, translateX, translateY);

    e.preventDefault();

    nodeRect = node.getBoundingClientRect();

    const { clientX, clientY } =
      e.type === 'touchmove' ? (e as TouchEvent).touches[0] : (e as MouseEvent);

    // Get final values for clamping
    let [finalX, finalY] = [clientX, clientY];

    // TODO: Get bounds done
    // if (computedBounds) {
    //   finalX = Math.min(clientX, computedBounds.right);
    //   finalY = Math.min(clientY, computedBounds.bottom);

    //   finalX = Math.max(clientX, computedBounds.left);
    //   finalY = Math.max(clientY, computedBounds.top);
    // }

    if (Array.isArray(grid)) {
      let [xSnap, ySnap] = grid;

      if (isNaN(+xSnap) || xSnap < 0)
        throw new Error('1st argument of `grid` must be a valid positive number');

      if (isNaN(+ySnap) || ySnap < 0)
        throw new Error('2nd argument of `grid` must be a valid positive number');

      let [deltaX, deltaY] = [finalX - previousX, finalY - previousY];
      [deltaX, deltaY] = snapToGrid([xSnap, ySnap], deltaX, deltaY);

      if (!deltaX && !deltaY) return;

      [finalX, finalY] = [previousX + deltaX, previousY + deltaY];
    }

    if (canMoveInX) translateX = finalX - initialX;
    if (canMoveInY) translateY = finalY - initialY;

    [xOffset, yOffset] = [translateX, translateY];

    Promise.resolve().then(() => setTranslate(translateX, translateY, node, gpuAcceleration));
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
    update: (options: Options) => {
      // Update all the values that need to be changed
      axis = options.axis || 'both';
      disabled = options.disabled ?? false;
      handle = options.handle;
      // bounds = options.bounds;
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
    },
  };
};

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function snapToGrid(
  [xSnap, ySnap]: [number, number],
  pendingX: number,
  pendingY: number
): [number, number] {
  const x = Math.round(pendingX / xSnap) * xSnap;
  const y = Math.round(pendingY / ySnap) * ySnap;
  return [x, y];
}

function fireSvelteDragStopEvent(node: HTMLElement) {
  node.dispatchEvent(new CustomEvent('svelte-drag:end'));
}

function fireSvelteDragStartEvent(node: HTMLElement) {
  node.dispatchEvent(new CustomEvent('svelte-drag:start'));
}

function fireSvelteDragEvent(node: HTMLElement, translateX: number, translateY: number) {
  node.dispatchEvent(new CustomEvent('svelte-drag', { detail: { x: translateX, y: translateY } }));
}

function setupListeners(
  dragStart: (e: TouchEvent | MouseEvent) => void,
  dragEnd: () => void,
  drag: (e: TouchEvent | MouseEvent) => void
) {
  const listen = addEventListener;

  listen('touchstart', dragStart, false);
  listen('touchend', dragEnd, false);
  listen('touchmove', drag, false);

  listen('mousedown', dragStart, false);
  listen('mouseup', dragEnd, false);
  listen('mousemove', drag, false);
}

function getDragEl(handle: string | undefined, node: HTMLElement) {
  if (!handle) return node;

  // Valid!! Let's check if this selector exists or not
  const handleEl = node.querySelector<HTMLElement>(handle);
  if (handleEl === null)
    throw new Error(
      'Selector passed for `handle` option should be child of the element on which the action is applied'
    );

  return handleEl!;
}

function getCancelElement(cancel: string | undefined, node: HTMLElement) {
  if (!cancel) return;

  const cancelEl = node.querySelector<HTMLElement>(cancel);

  if (cancelEl === null)
    throw new Error(
      'Selector passed for `cancel` option should be child of the element on which the action is applied'
    );

  return cancelEl;
}

function computeBoundRect(bounds: string | Coords) {
  let computedBounds: Coords;

  if (typeof bounds === 'object') {
    // we have the left right etc
    const { right: bodyRight, bottom: bodyBottom } = document.body.getBoundingClientRect();

    const { top = 0, left = 0, right = bodyRight, bottom = bodyBottom } = bounds;

    return { top, right, bottom, left };
  }

  // It's a string
  const node = document.querySelector(bounds);

  if (node === null)
    throw new Error("The selector provided for bound doesn't exists in the document.");

  computedBounds = node!.getBoundingClientRect();

  return computedBounds;
}

function setTranslate(xPos: number, yPos: number, el: HTMLElement, gpuAcceleration: boolean) {
  el.style.transform = gpuAcceleration
    ? `translate3d(${+xPos}px, ${+yPos}px, 0)`
    : `translate(${+xPos}px, ${+yPos}px)`;
}
