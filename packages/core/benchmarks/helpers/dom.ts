export function createDraggableNode(id?: string): HTMLDivElement {
	const el = document.createElement('div');
	if (id) el.dataset.testid = id;
	el.style.cssText =
		'position:fixed;left:80px;top:80px;width:120px;height:80px;touch-action:none;';
	document.body.appendChild(el);
	return el;
}

export function resetBody() {
	document.body.replaceChildren();
}

export function parseTranslate(el: HTMLElement): { x: number; y: number } {
	const raw = getComputedStyle(el).translate;
	if (!raw || raw === 'none') return { x: 0, y: 0 };
	const parts = raw.trim().split(/\s+/);
	return { x: Number.parseFloat(parts[0]) || 0, y: Number.parseFloat(parts[1]) || 0 };
}

export async function flushEffects() {
	await new Promise<void>((resolve) => queueMicrotask(resolve));
	await new Promise<void>((resolve) => requestAnimationFrame(resolve));
}

export function flushEffectsSync() {
	queueMicrotask(() => {});
}
