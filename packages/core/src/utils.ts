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

function camel_to_kebab(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export function set_node_key_style<T extends keyof CSSStyleDeclaration>(
	node: HTMLElement | SVGElement,
	key: T,
	value: CSSStyleDeclaration[T],
) {
	const kebabKey = camel_to_kebab(key.toString());
	node.style.setProperty(kebabKey, value?.toString() ?? '');
}

export function get_node_style(node: HTMLElement | SVGElement, key: keyof CSSStyleDeclaration) {
	const kebabKey = camel_to_kebab(key.toString());
	return node.style.getPropertyValue(kebabKey);
}

export function set_node_dataset(node: HTMLElement | SVGElement, key: string, value: unknown) {
	node.setAttribute(`data-${key}`, value + '');
}

export function is_svg_element(element: Element | EventTarget): element is SVGElement {
	return element instanceof SVGElement;
}

export function is_svg_svg_element(element: Element | EventTarget): element is SVGSVGElement {
	return element instanceof SVGSVGElement;
}

export type DeepMutable<T> = T extends object
	? {
			-readonly [P in keyof T]: T[P] extends readonly any[]
				? DeepMutable<T[P]>
				: T[P] extends object
					? keyof T[P] extends never
						? T[P]
						: DeepMutable<T[P]>
					: T[P];
		}
	: T;

export type ReadonlyToShallowMutable<T> = T extends object
	? {
			-readonly [P in keyof T]: T[P];
		}
	: T;
