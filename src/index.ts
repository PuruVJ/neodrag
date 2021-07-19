type Coords = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Options = {
  // bounds?: string | Coords;

  axis?: 'both' | 'x' | 'y' | 'none';
  gpuAcceleration?: boolean;

  applyUserSelectHack?: boolean;

  disabled?: boolean;

  grid?: [number, number];

  cancel?: string;
  handle?: string;

  defaultClass?: string;
  defaultClassDragging?: string;
  defaultClassDragged?: string;

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

  // Apply defaultClass on node

  function dragStart(e: TouchEvent | MouseEvent) {
    node.classList.add(defaultClass);

    if (disabled) return;

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

    const { clientX, clientY } = e instanceof TouchEvent ? e.touches[0] : e;

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

    const { clientX, clientY } = e instanceof TouchEvent ? e.touches[0] : e;

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
