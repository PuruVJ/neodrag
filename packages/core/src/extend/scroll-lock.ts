import type { DragPlugin } from '../drag/drag.ts';

/**
 * Freeze scrolling (and text selection / native touch panning) on a container for the
 * duration of a drag — ported from the old `scrollLock` plugin (plugins/drag.ts). Saves the
 * inline styles it touches on start and restores them verbatim on end, so a container that
 * had no inline `overflow`/`touch-action`/`user-select` goes back to having none.
 */
export interface ScrollLockOptions {
	/** Which native pan axis to forbid via `touch-action`. Default 'both'. */
	lockAxis?: 'x' | 'y' | 'both';
	/** Container to lock. Default `document.documentElement`. An element or lazy getter. */
	container?: HTMLElement | (() => HTMLElement);
	/** Keep the scrollbar (skip `overflow: hidden`). Default false. */
	allowScrollbar?: boolean;
}

type Saved = { userSelect: string; touchAction: string; overflow: string };

function resolveContainer(c: ScrollLockOptions['container']): HTMLElement {
	const el = typeof c === 'function' ? c() : c;
	return el instanceof HTMLElement ? el : document.documentElement;
}

function touchActionFor(lockAxis: NonNullable<ScrollLockOptions['lockAxis']>): string {
	if (lockAxis === 'both') return 'none';
	// Lock x → only vertical panning survives, and vice versa.
	return lockAxis === 'x' ? 'pan-y' : 'pan-x';
}

export function scrollLock(options: ScrollLockOptions = {}): DragPlugin {
	const lockAxis = options.lockAxis ?? 'both';
	const allowScrollbar = options.allowScrollbar ?? false;

	let target: HTMLElement | null = null;
	let saved: Saved | null = null;

	return {
		name: 'scroll-lock',
		onStart: () => {
			target = resolveContainer(options.container);
			saved = {
				userSelect: target.style.getPropertyValue('user-select'),
				touchAction: target.style.getPropertyValue('touch-action'),
				overflow: target.style.getPropertyValue('overflow'),
			};
			target.style.setProperty('user-select', 'none');
			if (!allowScrollbar) target.style.setProperty('overflow', 'hidden');
			target.style.setProperty('touch-action', touchActionFor(lockAxis));
		},
		onEnd: () => {
			if (!target || !saved) return;
			target.style.setProperty('user-select', saved.userSelect);
			target.style.setProperty('touch-action', saved.touchAction);
			target.style.setProperty('overflow', saved.overflow);
			target = null;
			saved = null;
		},
	};
}
