import type { Neodrag, NeodragDebugSnapshot } from '../engine.ts';

export interface InteractionInspectorOptions {
	mount?: HTMLElement;
	title?: string;
}

export interface InteractionInspector {
	refresh(): void;
	destroy(): void;
}

export function createInteractionInspector(
	engine: Neodrag,
	options: InteractionInspectorOptions = {},
): InteractionInspector {
	if (!engine.dev || !globalThis.document) {
		return { refresh() {}, destroy() {} };
	}

	const mount = options.mount ?? document.body;
	const panel = document.createElement('div');
	panel.setAttribute('data-neodrag-inspector', '');
	Object.assign(panel.style, {
		position: 'fixed',
		right: '12px',
		bottom: '12px',
		zIndex: '2147483646',
		maxWidth: '320px',
		padding: '10px 12px',
		font: '11px/1.4 ui-monospace, monospace',
		color: '#e8e8e8',
		background: 'rgba(12, 14, 20, 0.92)',
		border: '1px solid rgba(255,255,255,0.12)',
		borderRadius: '8px',
		boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
		pointerEvents: 'none',
		whiteSpace: 'pre-wrap',
	} as CSSStyleDeclaration);

	const title = options.title ?? 'neodrag';
	let rafId = 0;

	const render = (snapshot: NeodragDebugSnapshot | null) => {
		if (!snapshot) {
			panel.textContent = `${title}\n(dev mode off)`;
			return;
		}
		const session = snapshot.session;
		const sessionLine = session
			? `drag: ${session.state} · Δ(${session.deltaX.toFixed(0)}, ${session.deltaY.toFixed(0)}) · over:${session.overTargets}`
			: 'drag: idle';
		const resize = snapshot.resizeSession;
		const resizeLine = resize
			? `resize: ${resize.state} · ${resize.width.toFixed(0)}×${resize.height.toFixed(0)} · Δw:${resize.deltaWidth.toFixed(0)} Δh:${resize.deltaHeight.toFixed(0)} · ${resize.anchor}`
			: 'resize: idle';
		panel.textContent = [
			title,
			`targets · drag:${snapshot.dragTargets} drop:${snapshot.dropTargets} resize:${snapshot.resizeTargets}`,
			sessionLine,
			resizeLine,
		].join('\n');
	};

	const loop = () => {
		render(engine.debugSnapshot());
		rafId = requestAnimationFrame(loop);
	};

	rafId = requestAnimationFrame(loop);
	mount.appendChild(panel);

	return {
		refresh() {
			render(engine.debugSnapshot());
		},
		destroy() {
			if (rafId) cancelAnimationFrame(rafId);
			panel.remove();
		},
	};
}

export function installInteractionInspector(
	engine: Neodrag,
	options?: InteractionInspectorOptions,
): InteractionInspector {
	return createInteractionInspector(engine, options);
}
