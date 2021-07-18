export function int(a: string): number {
  return parseInt(a, 10);
}

export function outerHeight(node: HTMLElement): number {
  // This is deliberately excluding margin for our calculations, since we are using
  // offsetTop which is including margin. See getBoundPosition
  let height = node.clientHeight;
  const computedStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
  height += int(computedStyle?.borderTopWidth || '0');
  height += int(computedStyle?.borderBottomWidth || '0');
  return height;
}

export function outerWidth(node: HTMLElement): number {
  // This is deliberately excluding margin for our calculations, since we are using
  // offsetLeft which is including margin. See getBoundPosition
  let width = node.clientWidth;
  const computedStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
  width += int(computedStyle?.borderLeftWidth || '0');
  width += int(computedStyle?.borderRightWidth || '0');
  return width;
}
export function innerHeight(node: HTMLElement): number {
  let height = node.clientHeight;
  const computedStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
  height -= int(computedStyle?.paddingTop || '0');
  height -= int(computedStyle?.paddingBottom || '0');
  return height;
}

export function innerWidth(node: HTMLElement): number {
  let width = node.clientWidth;
  const computedStyle = node?.ownerDocument?.defaultView?.getComputedStyle(node);
  width -= int(computedStyle?.paddingLeft || '0');
  width -= int(computedStyle?.paddingRight || '0');
  return width;
}
