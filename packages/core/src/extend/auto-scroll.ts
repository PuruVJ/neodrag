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

function resolve_container(c: AutoScrollOptions['container']): HTMLElement | null {
	const el = typeof c === 'function' ? c() : c;
	return el ?? null;
}

function viewport_rect(): EdgeRect {
	return { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight };
}

function read_pointer(input: InteractionInput): { x: number; y: number } {
	return { x: input.clientX, y: input.clientY };
}

export function autoScroll(options: AutoScrollOptions = {}): DragPlugin {
	const margin = options.margin ?? 48;
	const max_speed = options.maxSpeed ?? 24;

	return {
		name: 'auto-scroll',
		onMove: ({ input }) => {
			const container = resolve_container(options.container);
			const scroll_el: HTMLElement | Element =
				container ?? document.scrollingElement ?? document.documentElement;
			const rect: EdgeRect = container ? container.getBoundingClientRect() : viewport_rect();

			const { x, y } = read_pointer(input);
			let dx = 0;
			let dy = 0;
			if (y < rect.top + margin) dy = -max_speed;
			else if (y > rect.bottom - margin) dy = max_speed;
			if (x < rect.left + margin) dx = -max_speed;
			else if (x > rect.right - margin) dx = max_speed;

			if (dx === 0 && dy === 0) return;
			(scroll_el as HTMLElement).scrollBy(dx, dy);
		},
	};
}
