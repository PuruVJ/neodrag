import type { DragPlugin } from '../drag/drag.ts';

/** A vibration pattern — single duration or an on/off millisecond sequence. */
type Pattern = number | number[];

function buzz(pattern: Pattern | undefined): void {
	if (pattern === undefined) return;
	if (typeof navigator === 'undefined') return;
	navigator.vibrate?.(pattern);
}

/**
 * Fire `navigator.vibrate` on drag start/end — the mobile arena's <1KB opt-in.
 * SSR-guarded and a no-op where the Vibration API is unsupported. Defaults to a
 * single 10ms tap on start, silent on end.
 */
export function haptics(opts: { start?: Pattern; end?: Pattern } = {}): DragPlugin {
	const start = opts.start ?? 10;
	const end = opts.end;
	return {
		name: 'haptics',
		onStart: () => buzz(start),
		onEnd: () => buzz(end),
	};
}
