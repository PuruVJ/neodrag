type Coords = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Options = {
  bounds?: string | Coords;
  axis?: 'both' | 'x' | 'y' | 'none';
  gpuAcceleration?: boolean;
  applyUserSelectHack?: boolean;
  disabled?: boolean;
  handle?: string;

  defaultClass?: string;
  defaultClassDragging?: string;
  defaultClassDragged?: string;

  defaultPosition?: { x: number; y: number };
};

export const draggable = (
  node: HTMLElement,
  {
    bounds,
    axis = 'both',
    gpuAcceleration = true,
    applyUserSelectHack = true,
    disabled = false,
    handle,

    defaultClass = 'svelte-draggable',
    defaultClassDragging = 'svelte-draggable-dragging',
    defaultClassDragged = 'svelte-draggable-dragged',

    defaultPosition = { x: 0, y: 0 },
  }: Options = {}
) => {
  let active = false;

  let translateX = 0;
  let translateY = 0;

  let initialX = 0;
  let initialY = 0;

  let xOffset = defaultPosition.x;
  let yOffset = defaultPosition.y;

  setTranslate(xOffset, yOffset, node, gpuAcceleration);

  let canMoveInX = ['both', 'x'].includes(axis);
  let canMoveInY = ['both', 'y'].includes(axis);

  let bodyOriginalUserSelectVal = '';

  let dragEl: HTMLElement;

  let computedBounds: Coords;
  let nodeRect: DOMRect;

  setupListeners(dragStart, dragEnd, drag);

  dragEl = getDragEl(handle, node);

  // Apply defaultClass on node
  node.classList.add(defaultClass);

  function dragStart(e: TouchEvent | MouseEvent) {
    if (disabled) return;

    dragEl = getDragEl(handle, node);

    // Compute bounds
    if (typeof bounds !== 'undefined') computedBounds = computeBoundRect(bounds);

    // Compute current node's bounding client Rectangle
    nodeRect = node.getBoundingClientRect();

    if (applyUserSelectHack) {
      // Apply user-select: none on body to prevent misbehavior
      bodyOriginalUserSelectVal = document.body.style.userSelect;
      document.body.style.userSelect = 'none';
    }

    if (e.target === dragEl) active = true;

    // Dispatch custom event
    node.dispatchEvent(new CustomEvent('svelte-drag:start'));

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

    node.dispatchEvent(new CustomEvent('svelte-drag:end'));

    if (canMoveInX) initialX = translateX;
    if (canMoveInX) initialY = translateY;

    active = false;
  }

  function drag(e: TouchEvent | MouseEvent) {
    if (disabled) return;

    if (!active) return;

    // Apply class defaultClassDragging
    node.classList.add(defaultClassDragging);

    node.dispatchEvent(
      new CustomEvent('svelte-drag', { detail: { x: translateX, y: translateY } })
    );

    e.preventDefault();

    nodeRect = node.getBoundingClientRect();

    const dimensions = e instanceof TouchEvent ? e.touches[0] : e;

    const { clientX, clientY } = dimensions;

    if (canMoveInX) translateX = clientX - initialX;
    if (canMoveInY) translateY = clientY - initialY;

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
  };
};

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
  if (typeof handle === 'string') {
    // Valid!! Let's check if this selector exists or not
    const handleEl = node.querySelector<HTMLElement>(handle);
    if (typeof handleEl === 'undefined')
      throw new Error(
        'Selector passed for `handle` option should be child of the element on which the action is applied'
      );

    return handleEl!;
  }
  return node;
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

  if (typeof node === 'undefined')
    throw new Error("The selector provided for bound doesn't exists in the document.");

  computedBounds = node!.getBoundingClientRect();

  return computedBounds;
}

function setTranslate(xPos: number, yPos: number, el: HTMLElement, gpuAcceleration: boolean) {
  el.style.transform = gpuAcceleration
    ? `translate3d(${+xPos}px, ${+yPos}px, 0)`
    : `translate(${+xPos}px, ${+yPos}px)`;
}
