// Write a perfectly generic function that is an event listener
// Overload for HTML elements
export function listen<EventName extends keyof HTMLElementEventMap>(
	el: HTMLElement,
	type: EventName,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[EventName]) => any,
	options?: boolean | AddEventListenerOptions,
): void;

// Overload for SVG elements
export function listen<EventName extends keyof SVGElementEventMap>(
	el: SVGElement,
	type: EventName,
	listener: (this: SVGElement, ev: SVGElementEventMap[EventName]) => any,
	options?: boolean | AddEventListenerOptions,
): void;

// Implementation
export function listen(
	el: HTMLElement | SVGElement,
	type: string,
	listener: EventListener,
	options?: boolean | AddEventListenerOptions,
) {
	el.addEventListener(type, listener, options);
}

export function set_node_key_style<T extends keyof CSSStyleDeclaration>(
	node: HTMLElement | SVGElement,
	key: T,
	value: CSSStyleDeclaration[T],
) {
	node.style.setProperty(key.toString(), value?.toString() ?? '');
}

export function get_node_style(node: HTMLElement | SVGElement, key: keyof CSSStyleDeclaration) {
	return node.style.getPropertyValue(key.toString());
}

export function set_node_dataset(node: HTMLElement | SVGElement, key: string, value: unknown) {
	node.setAttribute(`data-${key}`, value + '');
}

export function is_svg_element(element: Element): boolean {
	return element instanceof SVGElement;
}

export function is_svg_svg_element(element: Element): boolean {
	return element instanceof SVGSVGElement;
}
