import { applyMarkupAttr, type MarkupAdapter } from '../markup-adapter.ts';

const rowMarkups = new WeakMap<HTMLElement, MarkupAdapter>();

export function registerSortableRowMarkup(
	row: HTMLElement,
	adapter: MarkupAdapter,
): () => void {
	rowMarkups.set(row, adapter);
	return () => {
		rowMarkups.delete(row);
	};
}

export function sortableRowMarkup(row: HTMLElement | null | undefined): MarkupAdapter | undefined {
	if (!row) return undefined;
	return rowMarkups.get(row);
}

export function applySortableRowMarkupAttr(
	row: HTMLElement,
	name: string,
	value: string | null,
): void {
	applyMarkupAttr(sortableRowMarkup(row), row, name, value);
}
