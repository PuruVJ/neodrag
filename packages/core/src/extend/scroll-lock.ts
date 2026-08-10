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

type Saved = { user_select: string; touch_action: string; overflow: string };

function resolve_container(c: ScrollLockOptions['container']): HTMLElement {
	const el = typeof c === 'function' ? c() : c;
	return el instanceof HTMLElement ? el : document.documentElement;
}

function touch_action_for(lock_axis: NonNullable<ScrollLockOptions['lockAxis']>): string {
	if (lock_axis === 'both') return 'none';
	// Lock x → only vertical panning survives, and vice versa.
	return lock_axis === 'x' ? 'pan-y' : 'pan-x';
}

export function scrollLock(options: ScrollLockOptions = {}): DragPlugin {
	const lock_axis = options.lockAxis ?? 'both';
	const allow_scrollbar = options.allowScrollbar ?? false;

	let target: HTMLElement | null = null;
	let saved: Saved | null = null;

	return {
		name: 'scroll-lock',
		onStart: () => {
			target = resolve_container(options.container);
			saved = {
				user_select: target.style.getPropertyValue('user-select'),
				touch_action: target.style.getPropertyValue('touch-action'),
				overflow: target.style.getPropertyValue('overflow'),
			};
			target.style.setProperty('user-select', 'none');
			if (!allow_scrollbar) target.style.setProperty('overflow', 'hidden');
			target.style.setProperty('touch-action', touch_action_for(lock_axis));
		},
		onEnd: () => {
			if (!target || !saved) return;
			target.style.setProperty('user-select', saved.user_select);
			target.style.setProperty('touch-action', saved.touch_action);
			target.style.setProperty('overflow', saved.overflow);
			target = null;
			saved = null;
		},
	};
}
