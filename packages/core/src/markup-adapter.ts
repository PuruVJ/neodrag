export abstract class MarkupAdapter {
	abstract setAttr(name: string, value: string): void;
	abstract removeAttr(name: string): void;

	patch(record: Record<string, string | null>): void {
		for (const [name, value] of Object.entries(record)) {
			if (value === null) this.removeAttr(name);
			else this.setAttr(name, value);
		}
	}
}

export class DomMarkupAdapter extends MarkupAdapter {
	readonly #node: HTMLElement | SVGElement;

	constructor(node: HTMLElement | SVGElement) {
		super();
		this.#node = node;
	}

	setAttr(name: string, value: string): void {
		this.#node.setAttribute(name, value);
	}

	removeAttr(name: string): void {
		this.#node.removeAttribute(name);
	}
}

export function createDomMarkupAdapter(node: HTMLElement | SVGElement): DomMarkupAdapter {
	return new DomMarkupAdapter(node);
}

export function applyMarkupAttr(
	adapter: MarkupAdapter | undefined,
	node: HTMLElement | SVGElement,
	name: string,
	value: string | null,
): void {
	const target = adapter ?? new DomMarkupAdapter(node);
	if (value === null) target.removeAttr(name);
	else target.setAttr(name, value);
}
