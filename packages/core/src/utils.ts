// Write a perfectly generic function that is an event listener
export function listen<K extends keyof HTMLElementEventMap>(
	el: HTMLElement,
	type: K,
	listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
	options?: boolean | AddEventListenerOptions,
) {
	el.addEventListener(type, listener, options);
}

export function set_node_key_style<T extends keyof CSSStyleDeclaration>(
	node: HTMLElement,
	key: T,
	value: CSSStyleDeclaration[T],
) {
	node.style.setProperty(key.toString(), value?.toString() ?? '');
}

export function get_node_style(node: HTMLElement, key: keyof CSSStyleDeclaration) {
	return node.style.getPropertyValue(key.toString());
}

export function set_node_dataset(node: HTMLElement, key: string, value: unknown) {
	node.dataset[key.toString()] = value?.toString() ?? '';
}
