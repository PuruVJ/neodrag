import { Swipeable, type SwipeOptions } from '@neodrag/core/swipe';
import { useCallback, useRef, useState } from 'react';
import type { RefCallback } from './_internal.ts';

/**
 * Swipe-to-dismiss hook — a thin adapter over the core `Swipeable` binder. Put `ref` on the element;
 * read `offset` / `isDismissed`. Released past `threshold` the element flies out and fires `onDismiss`,
 * otherwise it springs back.
 */
export function useSwipe(options: SwipeOptions = {}): {
	ref: RefCallback;
	offset: { x: number; y: number };
	isDismissed: boolean;
	reset: () => void;
} {
	const instance = useRef<Swipeable | null>(null);
	const dispose = useRef<(() => void) | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [offset, setOffset] = useState({ x: 0, y: 0 });
	const [isDismissed, setDismissed] = useState(false);

	const ref = useCallback<RefCallback>((node) => {
		dispose.current?.();
		if (node) {
			instance.current = new Swipeable({
				...opts.current,
				onChange: (s) => {
					setOffset(s.offset);
					setDismissed(s.dismissed);
				},
			});
			dispose.current = instance.current.attach(node);
		} else {
			instance.current = null;
			dispose.current = null;
		}
	}, []);

	const reset = useCallback(() => instance.current?.reset(), []);

	return { ref, offset, isDismissed, reset };
}

export { resolveSwipe, type SwipeAxis, type SwipeResult, type SwipeOptions } from '@neodrag/core/swipe';
