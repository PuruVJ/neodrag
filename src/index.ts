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
};

export const draggable = (
  node: HTMLElement,
  {
    bounds = 'body',
    axis = 'both',
    gpuAcceleration = true,
    applyUserSelectHack = true,
    disabled = false,
    handle,
  }: Options = {}
) => {
  let active = false;

  let translateX = 0;
  let translateY = 0;

  let initialX = 0;
  let initialY = 0;

  let xOffset = 0;
  let yOffset = 0;

  // Compute direction
  let canMoveInX = ['both', 'x'].includes(axis);
  let canMoveInY = ['both', 'y'].includes(axis);

  let bodyOriginalUserSelectVal = '';

  let dragEl: HTMLElement;

  let computedBounds: Coords;
  let nodeRect: DOMRect;

  let previousXCoord = 0;
  let previousYCoord = 0;

  setupListeners(dragStart, dragEnd, drag);

  dragEl = getDragEl(handle, node);

  // Compute bounds
  computedBounds = computeBoundRect(bounds);

  // Compute current node's bounding client Rectangle
  nodeRect = node.getBoundingClientRect();

  function dragStart(e: TouchEvent | MouseEvent) {
    if (disabled) return;

    dragEl = getDragEl(handle, node);

    // Compute bounds
    computedBounds = computeBoundRect(bounds);

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

    if (e.type === 'touchstart') {
      if (canMoveInX) initialX = (e as TouchEvent).touches[0].clientX - xOffset;
      if (canMoveInY) initialY = (e as TouchEvent).touches[0].clientY - yOffset;
    }

    if (canMoveInX) initialX = (e as MouseEvent).clientX - xOffset;
    if (canMoveInY) initialY = (e as MouseEvent).clientY - yOffset;
  }

  function dragEnd() {
    if (disabled) return;

    if (applyUserSelectHack) document.body.style.userSelect = bodyOriginalUserSelectVal;

    node.dispatchEvent(new CustomEvent('svelte-drag:end'));

    if (canMoveInX) initialX = translateX;
    if (canMoveInX) initialY = translateY;

    active = false;
  }

  function drag(e: TouchEvent | MouseEvent) {
    if (disabled) return;

    if (!active) return;

    node.dispatchEvent(
      new CustomEvent('svelte-drag', { detail: { x: translateX, y: translateY } })
    );

    e.preventDefault();

    nodeRect = node.getBoundingClientRect();

    const canMoveLeft = canMoveInX && nodeRect.left > computedBounds.left;
    const canMoveRight = canMoveInX && nodeRect.right < computedBounds.right;

    const canMoveUp = canMoveInY && nodeRect.top >= computedBounds.top;
    const canMoveDown = canMoveInY && nodeRect.bottom <= nodeRect.bottom;

    const dimensions = e instanceof TouchEvent ? e.touches[0] : e;

    const { clientX, clientY } = dimensions;

    // Now check directions
    const isMovingUp = clientY <= previousYCoord;
    const isMovingRight = clientX >= previousXCoord;

    console.log(isMovingRight);

    if ((canMoveRight && isMovingRight) || (canMoveLeft && !isMovingRight))
      translateX = clientX - initialX;

    if ((canMoveUp && isMovingUp) || (canMoveDown && !isMovingUp)) translateY = clientY - initialY;

    [previousXCoord, previousYCoord] = [clientX, clientY];

    [xOffset, yOffset] = [translateX, translateY];

    Promise.resolve().then(() => setTranslate(translateX, translateY, node, gpuAcceleration));
  }

  return {
    destroy: () => {
      removeEventListener('touchstart', dragStart, false);
      removeEventListener('touchend', dragEnd, false);
      removeEventListener('touchmove', drag, false);

      removeEventListener('mousedown', dragStart, false);
      removeEventListener('mouseup', dragEnd, false);
      removeEventListener('mousemove', drag, false);
    },
  };
};

function setupListeners(
  dragStart: (e: TouchEvent | MouseEvent) => void,
  dragEnd: () => void,
  drag: (e: TouchEvent | MouseEvent) => void
) {
  addEventListener('touchstart', dragStart, false);
  addEventListener('touchend', dragEnd, false);
  addEventListener('touchmove', drag, false);

  addEventListener('mousedown', dragStart, false);
  addEventListener('mouseup', dragEnd, false);
  addEventListener('mousemove', drag, false);
}

function getDragEl(handle: string | undefined, node: HTMLElement) {
  let dragEl: HTMLElement;

  if (typeof handle === 'string') {
    // Valid!! Let's check if this selector exists or not
    const handleEl = node.querySelector<HTMLElement>(handle);
    if (typeof handleEl === 'undefined')
      throw new Error(
        'Selector passed for `handle` option should be child of the element on which the action is applied'
      );

    dragEl = handleEl!;
  } else {
    dragEl = node;
  }
  return dragEl;
}

function computeBoundRect(bounds: string | Coords) {
  let computedBounds: Coords;

  if (typeof bounds === 'object') {
    // we have the left right etc
    const { top = 0, right = 0, bottom = 0, left = 0 } = bounds;

    computedBounds = { top, right, bottom, left };
  } else {
    // It's a string
    const node = document.querySelector(bounds);

    if (typeof node === 'undefined')
      throw new Error("The selector provided for bound doesn't exists in the document.");

    computedBounds = node!.getBoundingClientRect();
  }

  return computedBounds;
}

function setTranslate(xPos: number, yPos: number, el: HTMLElement, gpuAcceleration: boolean) {
  el.style.transform = gpuAcceleration
    ? `translate3d(${+xPos}px, ${+yPos}px, 0)`
    : `translate(${+xPos}px, ${+yPos}px)`;
}
