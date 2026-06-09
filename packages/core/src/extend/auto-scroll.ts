import type { InteractionInput } from '../interaction-input.ts';
import type { DragPlugin } from '../drag/drag.ts';

/**
 * Auto-scroll the nearest scroll container when the pointer drifts into its edge margin —
 * ported from the old `autoScroll` plugin (plugins/drag.ts). Opt-in via `use: []`; reads the
 * live pointer from the move ctx (`input.clientX/Y`) and nudges the container each move tick.
 *
 * Defaults match the old plugin: 48px edge margin, 24px/tick max speed, viewport container.
 */
export interface AutoScrollOptions {
	/** Edge band (px) inside which scrolling kicks in. Default 48. */
	margin?: number;
	/** Max px scrolled per move tick. Default 24. */
	maxSpeed?: number;
	/**
	 * Scroll container. Default the viewport (scrolls the scrolling element). An element or a
	 * lazy getter both work — the getter is re-read each tick so late-mounted containers resolve.
	 */
	container?: HTMLElement | (() => HTMLElement);
}

type EdgeRect = { top: number; left: number; right: number; bottom: number };

function resolveContainer(c: AutoScrollOptions['container']): HTMLElement | null {
	const el = typeof c === 'function' ? c() : c;
	return el ?? null;
}

function viewportRect(): EdgeRect {
	return { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
}

function readPointer(input: InteractionInput): { x: number; y: number } {
	return { x: input.clientX, y: input.clientY };
}

export function autoScroll(options: AutoScrollOptions = {}): DragPlugin {
	const margin = options.margin ?? 48;
	const maxSpeed = options.maxSpeed ?? 24;

	return {
		name: 'auto-scroll',
		onMove: ({ input }) => {
			const container = resolveContainer(options.container);
			const scrollEl: HTMLElement | Element =
				container ?? document.scrollingElement ?? document.documentElement;
			const rect: EdgeRect = container ? container.getBoundingClientRect() : viewportRect();

			const { x, y } = readPointer(input);
			let dx = 0;
			let dy = 0;
			if (y < rect.top + margin) dy = -maxSpeed;
			else if (y > rect.bottom - margin) dy = maxSpeed;
			if (x < rect.left + margin) dx = -maxSpeed;
			else if (x > rect.right - margin) dx = maxSpeed;

			if (dx === 0 && dy === 0) return;
			(scrollEl as HTMLElement).scrollBy(dx, dy);
		},
	};
}
