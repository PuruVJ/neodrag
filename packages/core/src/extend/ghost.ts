import { mirrorPresentationTree } from '../utils.ts';
import type { DragPlugin, Point } from '../drag/drag.ts';
import { applyTranslate, clearTranslate } from '../transform.ts';

/**
 * Drag a floating clone while the original stays put — ported from the old `ghost` plugin
 * (plugins/drag.ts). The clone is mounted in a single shared fixed-position host (overlay
 * layer above everything, pointer-events: none), positioned over the original's start rect,
 * then translated by the live offset each move. The original keeps its place: the core writes
 * a translate to it, so each move we clear that back to zero and translate the clone instead.
 */
export interface GhostOptions {
	/** Clone opacity. Default 0.5. */
	opacity?: number;
	/** Clone z-index. Default a near-max overlay value. */
	zIndex?: number;
}

const GHOST_Z_INDEX = 2_147_483_640;

let ghostHost: HTMLElement | null = null;

function ensureGhostHost(): HTMLElement {
	if (ghostHost?.isConnected) return ghostHost;
	ghostHost = document.createElement('div');
	ghostHost.dataset.neodragGhostHost = '';
	ghostHost.style.position = 'fixed';
	ghostHost.style.inset = '0';
	ghostHost.style.zIndex = String(GHOST_Z_INDEX);
	ghostHost.style.pointerEvents = 'none';
	ghostHost.style.overflow = 'visible';
	ghostHost.style.margin = '0';
	ghostHost.style.padding = '0';
	ghostHost.style.border = '0';
	document.body.appendChild(ghostHost);
	return ghostHost;
}

export function ghost(options: GhostOptions = {}): DragPlugin {
	const opacity = options.opacity ?? 0.5;
	const zIndex = options.zIndex ?? GHOST_Z_INDEX;

	let clone: HTMLElement | SVGElement | null = null;

	return {
		name: 'ghost',
		onStart: ({ node }) => {
			// The original must look stationary: drop any translate the core just wrote.
			clearTranslate(node);
			document.body.classList.add('neodrag-ghost-active');

			const rect = node.getBoundingClientRect();
			const next = node.cloneNode(true) as HTMLElement | SVGElement;
			clone = next;
			next.classList.add('neodrag-ghost');

			if (node instanceof HTMLElement) mirrorPresentationTree(node, next as HTMLElement);
			next.removeAttribute('data-neodrag-dragging');
			next.removeAttribute('data-neodrag-state');
			next.removeAttribute('data-neodrag-count');

			const s = (next as HTMLElement).style;
			s.opacity = String(opacity);
			s.position = 'fixed';
			s.pointerEvents = 'none';
			s.margin = '0';
			s.top = `${rect.top}px`;
			s.left = `${rect.left}px`;
			s.width = `${rect.width}px`;
			s.height = `${rect.height}px`;
			s.translate = '';
			s.setProperty('z-index', String(zIndex), 'important');

			ensureGhostHost().appendChild(next);
		},
		onMove: ({ offset, node }): Point => {
			// Keep the original pinned, move the clone instead.
			clearTranslate(node);
			if (clone) applyTranslate(clone, offset.x, offset.y);
			// Original stays at rest.
			return { x: 0, y: 0 };
		},
		onEnd: ({ node }) => {
			document.body.classList.remove('neodrag-ghost-active');
			clone?.remove();
			clone = null;
			clearTranslate(node);
		},
	};
}
