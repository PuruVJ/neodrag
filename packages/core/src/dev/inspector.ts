import type { Interactions } from '../engine.ts';

export interface InteractionInspectorOptions {
	mount?: HTMLElement;
	title?: string;
}

export interface InteractionInspector {
	refresh(): void;
	destroy(): void;
}

export function createInteractionInspector(
	engine: Interactions,
	options: InteractionInspectorOptions = {},
): InteractionInspector {
	if (!globalThis.document) {
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
	let raf_id = 0;

	const render = () => {
		const session = engine.session;
		const session_line = session
			? `session: ${session.started ? 'active' : 'pending'} · capability:${String(session.capability.key.description ?? 'unknown')}`
			: 'session: idle';
		panel.textContent = [title, session_line].join('\n');
	};

	const loop = () => {
		render();
		raf_id = requestAnimationFrame(loop);
	};

	raf_id = requestAnimationFrame(loop);
	mount.appendChild(panel);

	return {
		refresh() {
			render();
		},
		destroy() {
			if (raf_id) cancelAnimationFrame(raf_id);
			panel.remove();
		},
	};
}

export function installInteractionInspector(
	engine: Interactions,
	options?: InteractionInspectorOptions,
): InteractionInspector {
	return createInteractionInspector(engine, options);
}
